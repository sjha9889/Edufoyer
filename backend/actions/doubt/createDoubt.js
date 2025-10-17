import { z } from 'zod';
import Doubt from '../../models/Doubt.js';
import Solver from '../../models/Solver.js';
import Notification from '../../models/Notification.js';
import { sendEmail } from '../../utils/email.js';
import { getIO } from '../../socket.js';

const AskDoubtSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  subject: z.string().min(1, "Subject is required"),
  category: z.enum(["small", "medium", "large"], {
    required_error: "Doubt category is required",
  }).optional(),
  doubtCategory: z.enum(["small", "medium", "large"], {
    required_error: "Doubt category is required",
  }).optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  doubtDescription: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  imagePath: z.string().nullable().optional(),
});

async function getUserEmail(userId) {
  try {
    const User = (await import('../../models/User.js')).default;
    const userResult = await User.findById(userId).select('email');
    return userResult?.email || null;
  } catch (error) {
    console.error(`Error fetching email for user ${userId}:`, error);
    return null;
  }
}

export async function createDoubt(formData, userId) {
  const validatedFields = AskDoubtSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten());
    return {
      success: false,
      error: "Invalid input data.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized: You must be logged in to ask a doubt.",
    };
  }

  const { title, subject, category, doubtCategory, description, doubtDescription, imagePath } = validatedFields.data;
  
  // Use the appropriate fields based on what's provided
  const finalSubject = subject;
  const finalDescription = description || doubtDescription;
  const finalCategory = category || doubtCategory;

  try {
    const newDoubt = new Doubt({
      subject: finalSubject,
      description: finalDescription,
      image: imagePath,
      doubter_id: userId,
      status: "open",
    });

    const savedDoubt = await newDoubt.save();

    // Create notification for the user
    await Notification.create({
      user_id: userId,
      doubt_id: savedDoubt._id,
      message_type: "DOUBT_SUBMITTED",
      content: `Your doubt "${savedDoubt.subject}" has been submitted successfully and is awaiting a solver.`,
    });

    // Optimize: Use lean() for faster queries and limit results
    const potentialSolvers = await Solver.find({
      specialities: { $in: [savedDoubt.subject.toLowerCase()] }
    }).select('user_id').lean().limit(20); // Limit to 20 solvers max for performance

    // Realtime: notify solvers subscribed to this subject (async, don't wait)
    setImmediate(() => {
      try {
        const io = getIO();
        if (io) {
          io.to(`subject:${savedDoubt.subject.toLowerCase()}`).emit('doubt:available', {
            doubtId: String(savedDoubt._id),
            subject: savedDoubt.subject,
            description: savedDoubt.description,
            createdAt: savedDoubt.createdAt,
            status: savedDoubt.status,
          });
        }
      } catch (emitErr) {
        console.error('Socket emit error (doubt:available):', emitErr);
      }
    });

    console.log(`Found ${potentialSolvers.length} potential solvers for subject "${savedDoubt.subject}".`);

    // Optimize: Process notifications asynchronously to not block response
    if (potentialSolvers.length > 0) {
      setImmediate(async () => {
        const frontendBase = (process.env.FRONTEND_URL || '').trim();
        if (!frontendBase) {
          console.warn('FRONTEND_URL is not set; email links will be relative.');
        }
        const base = frontendBase || '';
        const acceptUrl = `${base}/dashboard/solve/${savedDoubt._id}`;
        
        // Batch process notifications (max 10 at a time)
        const batchSize = 10;
        for (let i = 0; i < potentialSolvers.length; i += batchSize) {
          const batch = potentialSolvers.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (potentialSolver) => {
            try {
              const solverEmail = await getUserEmail(potentialSolver.user_id);
              if (solverEmail) {
                // Send email notification
                await sendEmail({
                  to: solverEmail,
                  subject: `New Doubt Available: ${savedDoubt.subject}`,
                  text: `A new doubt matching your specialities has been submitted.\n\nSubject: ${savedDoubt.subject}\nDescription: ${savedDoubt.description?.substring(0, 100)}...\n\nYou can view and accept this doubt here: ${acceptUrl}\n\nIf you accept it, it will be assigned to you. Please solve it promptly.`,
                  html: `
                    <p>Hello,</p>
                    <p>A new doubt matching your specialities has been submitted and is available for you to solve:</p>
                    <hr>
                    <p><strong>Subject:</strong> ${savedDoubt.subject}</p>
                    <p><strong>Description:</strong> ${savedDoubt.description?.substring(0, 200)}...</p>
                    <hr>
                    <p>You can view the full details and accept this doubt by clicking the button below:</p>
                    <p style="text-align: center; margin: 20px 0;">
                      <a href="${acceptUrl}" style="background-color: #104be3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View and Accept Doubt</a>
                    </p>
                    <p>Accepting the doubt will assign it exclusively to you. Please ensure you can provide a solution promptly.</p>
                    <p>You can also see this and other available doubts in your <a href="${base}/dashboard/solve">Assigned Doubts</a> dashboard.</p>
                    <br>
                    <p>Thank you,<br>Your App Name Team</p>
                  `,
                });

                // Create notification
                await Notification.create({
                  user_id: potentialSolver.user_id,
                  doubt_id: savedDoubt._id,
                  message_type: "DOUBT_AVAILABLE",
                  content: `A new doubt is available for you: "${savedDoubt.subject}". Click to view.`,
                });

                // Realtime notification
                try {
                  const io = getIO();
                  if (io) {
                    io.to(`solver:${potentialSolver.user_id}`).emit('doubt:available', {
                      doubtId: String(savedDoubt._id),
                      subject: savedDoubt.subject,
                      description: savedDoubt.description,
                      createdAt: savedDoubt.createdAt,
                      status: savedDoubt.status,
                    });
                  }
                } catch (sockErr) {
                  console.error('Socket emit error (solver room doubt:available):', sockErr);
                }

                console.log(`Notification sent to solver ${potentialSolver.user_id} for doubt ${savedDoubt._id}`);
              }
            } catch (error) {
              console.error(`Failed to notify solver ${potentialSolver.user_id}:`, error);
            }
          });

          // Wait for batch to complete before processing next batch
          await Promise.allSettled(batchPromises);
        }
      });
    }

    return {
      success: true,
      message: "Doubt submitted successfully! Potential solvers have been notified.",
      doubtId: savedDoubt._id,
    };
  } catch (error) {
    console.error("Database Error creating doubt or notifying solvers:", error);
    return {
      success: false,
      error: "Database Error: Failed to submit doubt or notify solvers. Please try again later.",
    };
  }
}

import Doubt from '../../models/Doubt.js';

export async function getUserDoubts(userId, page = 1, limit = 20) {
  if (!userId) {
    console.error("getUserDoubts: Unauthorized access attempt.");
    return { success: false, error: "Unauthorized", doubts: [] };
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Use lean() for better performance when not modifying documents
    // Select only needed fields for better performance
    const [userDoubts, total] = await Promise.all([
      Doubt.find({ doubter_id: userId })
        .select('subject description image status is_solved rating category createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Doubt.countDocuments({ doubter_id: userId })
    ]);

    return { 
      success: true, 
      doubts: userDoubts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDoubts: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    };

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Database Error fetching doubts for user ${userId}:`, error);
    }
    return {
      success: false,
      error: "Database Error: Failed to fetch doubts.",
      doubts: [],
    };
  }
}

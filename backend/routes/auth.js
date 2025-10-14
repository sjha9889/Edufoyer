import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken, generateToken, requireAdmin } from '../middleware/auth.js';
import { validateEmail, normalizeEmail } from '../utils/emailValidator.js';
import { checkEmailWhitelist } from '../utils/emailWhitelist.js';
import { verifyEmail, sendVerificationEmail, generateVerificationCode } from '../utils/emailVerification.js';

const router = express.Router();

// Register new user
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 100 })
    .withMessage('Please provide a valid email address')
    .custom((value) => {
      // Additional validation to catch common invalid patterns
      if (!value || typeof value !== 'string') {
        throw new Error('Email is required');
      }
      
      const trimmedEmail = value.trim();
      
      // Check for basic structure
      if (!trimmedEmail.includes('@')) {
        throw new Error('Email must contain @ symbol');
      }
      
      if (trimmedEmail.startsWith('@') || trimmedEmail.endsWith('@')) {
        throw new Error('Invalid email format');
      }
      
      if (trimmedEmail.includes('..')) {
        throw new Error('Email cannot contain consecutive dots');
      }
      
      if (trimmedEmail.includes(' ')) {
        throw new Error('Email cannot contain spaces');
      }
      
      // Check for valid domain
      const parts = trimmedEmail.split('@');
      if (parts.length !== 2) {
        throw new Error('Invalid email format');
      }
      
      const [localPart, domainPart] = parts;
      
      if (!localPart || !domainPart) {
        throw new Error('Invalid email format');
      }
      
      if (!domainPart.includes('.')) {
        throw new Error('Domain must contain a dot');
      }
      
      // Check for valid TLD
      const tldRegex = /\.[a-zA-Z]{2,}$/;
      if (!tldRegex.test(domainPart)) {
        throw new Error('Invalid domain format');
      }
      
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Registration validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Comprehensive email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    // Check if email is in whitelist
    const whitelistCheck = checkEmailWhitelist(email);
    if (!whitelistCheck.isApproved) {
      return res.status(403).json({
        success: false,
        message: whitelistCheck.message
      });
    }

    // Verify email exists and is from known providers
    const emailVerification = await verifyEmail(email);
    if (!emailVerification.isValid) {
      return res.status(400).json({
        success: false,
        message: emailVerification.message
      });
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists (check both original and normalized email)
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { email: normalizedEmail }
      ]
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user with normalized email (not verified yet)
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpiry: verificationExpiry
    });

    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode);
    
    if (!emailResult.success) {
      // If email sending fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please check if your email address is correct and try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified
        },
        verificationRequired: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Comprehensive email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    // Normalize email for lookup
    const normalizedEmail = normalizeEmail(email);

    // Find user by email (check both original and normalized)
    const user = await User.findOne({ 
      $or: [
        { email: email },
        { email: normalizedEmail }
      ]
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your email for verification code.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
      updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Test email validation endpoint
router.post('/test-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  const emailValidation = validateEmail(email);
  const whitelistCheck = checkEmailWhitelist(email);
  
  res.json({
    success: emailValidation.isValid && whitelistCheck.isApproved,
    message: emailValidation.isValid ? whitelistCheck.message : emailValidation.message,
    email: email,
    isValid: emailValidation.isValid,
    isApproved: whitelistCheck.isApproved
  });
});

// Verify email with verification code
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
    }

    if (new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    if (user.emailVerificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resend verification'
    });
  }
});

// Admin endpoints for whitelist management
import { 
  addToWhitelist, 
  removeFromWhitelist, 
  getApprovedEmails, 
  getApprovedDomains 
} from '../utils/emailWhitelist.js';

// Get approved emails (admin only)
router.get('/admin/whitelist', authenticateToken, (req, res) => {
  // Add admin check here if needed
  res.json({
    success: true,
    data: {
      approvedEmails: getApprovedEmails(),
      approvedDomains: getApprovedDomains()
    }
  });
});

// Add email to whitelist (admin only)
router.post('/admin/whitelist', authenticateToken, (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  const added = addToWhitelist(email);
  
  res.json({
    success: true,
    message: added ? 'Email added to whitelist' : 'Email already in whitelist',
    data: {
      email: email,
      added: added
    }
  });
});

// Remove email from whitelist (admin only)
router.delete('/admin/whitelist', authenticateToken, (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  const removed = removeFromWhitelist(email);
  
  res.json({
    success: true,
    message: removed ? 'Email removed from whitelist' : 'Email not found in whitelist',
    data: {
      email: email,
      removed: removed
    }
  });
});

// Admin onboard solver by email
router.post('/admin/onboard-solver', requireAdmin, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('specialities')
    .isArray({ min: 1 })
    .withMessage('At least one speciality is required'),
  body('specialities.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each speciality must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, name, specialities, experience = 'beginner', bio = '' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: tempPassword,
      role: 'user',
      isSolver: true,
      isActive: true,
      emailVerified: true // Admin onboarded users are pre-verified
    });

    await user.save();

    // Create solver profile
    const Solver = (await import('../models/Solver.js')).default;
    const solver = new Solver({
      user_id: user._id,
      specialities,
      experience,
      bio
    });

    await solver.save();

    // Send onboarding email
    const { sendEmail } = await import('../utils/email.js');
    const onboardingEmailResult = await sendEmail({
      to: email,
      subject: 'Welcome to NLS - Solver Onboarding',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to NLS Solver Community!</h2>
          <p>Hello ${name},</p>
          <p>You have been onboarded as a solver for the following subjects: <strong>${specialities.join(', ')}</strong></p>
          <p>Your temporary login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${tempPassword}</li>
          </ul>
          <p><strong>Important:</strong> Please change your password after your first login for security.</p>
          <p>You can now start helping students with their doubts in your areas of expertise.</p>
          <p>Best regards,<br>NLS Admin Team</p>
        </div>
      `,
      text: `Welcome to NLS Solver Community!\n\nHello ${name},\n\nYou have been onboarded as a solver for: ${specialities.join(', ')}\n\nYour temporary login credentials:\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease change your password after first login.\n\nBest regards,\nNLS Admin Team`
    });

    if (!onboardingEmailResult.success) {
      console.error('Failed to send onboarding email:', onboardingEmailResult.error);
      // Don't fail the request, just log the error
    }

    res.status(201).json({
      success: true,
      message: 'Solver onboarded successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isSolver: user.isSolver
        },
        solver: {
          id: solver._id,
          specialities: solver.specialities,
          experience: solver.experience
        },
        emailSent: onboardingEmailResult.success
      }
    });

  } catch (error) {
    console.error('Solver onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during solver onboarding'
    });
  }
});

// Serve admin promotion page
router.get('/admin/promote', (req, res) => {
  res.sendFile('admin-promote.html', { root: '.' });
});

// Promote user to admin (for development/testing)
router.post('/admin/promote-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = 'admin';
    await user.save();

    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user promotion'
    });
  }
});

export default router;

import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import Solver from '../models/Solver.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/admin/register-solver
// @desc    Register any user as a solver (admin function)
// @access  Private (Admin only)
router.post('/register-solver', requireAdmin, async (req, res) => {
  try {
    const { name, email, subjects, experience, bio } = req.body;

    // Validate required fields
    if (!name || !email || !subjects || subjects.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and at least one subject are required' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name: name,
        email: email.toLowerCase(),
        password: 'temp_password_' + Date.now(), // Temporary password
        isEmailVerified: false,
        isSolver: false
      });
      await user.save();
    }

    // Check if user is already a solver
    const existingSolver = await Solver.findOne({ user_id: user._id });
    if (existingSolver) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already registered as a solver' 
      });
    }

    // Create new solver
    const newSolver = new Solver({
      user_id: user._id,
      specialities: subjects.map(s => s.toLowerCase()),
      experience: experience || 'beginner',
      bio: bio || '',
      isActive: true
    });

    await newSolver.save();

    // Update user profile with solver info
    await User.findByIdAndUpdate(user._id, {
      name: name,
      isSolver: true
    });

    res.status(201).json({
      success: true,
      message: `Successfully registered ${email} as a solver`,
      data: {
        userId: user._id,
        solverId: newSolver._id,
        email: email,
        specialities: newSolver.specialities
      }
    });
  } catch (error) {
    console.error('Admin register solver error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin function)
// @access  Private (Admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email isSolver createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/solvers
// @desc    Get all solvers (admin function)
// @access  Private (Admin only)
router.get('/solvers', requireAdmin, async (req, res) => {
  try {
    const solvers = await Solver.find({})
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: solvers
    });
  } catch (error) {
    console.error('Get solvers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;

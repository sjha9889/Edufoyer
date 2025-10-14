import express from 'express';
import { protect } from '../middleware/auth.js';
import { acceptDoubtAssignment } from '../actions/solver/acceptDoubtAssignment.js';
import { completeDoubt } from '../actions/solver/completeDoubt.js';
import { getSolvedDoubts } from '../actions/solver/getSolvedDoubts.js';
import SolverDoubts from '../models/SolverDoubts.js';
import mongoose from 'mongoose';
import Doubt from '../models/Doubt.js';
import Solver from '../models/Solver.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Solver routes are working' });
});

// @route   POST /api/solver/accept-doubt
// @desc    Accept a doubt assignment
// @access  Private
router.post('/accept-doubt', protect, async (req, res) => {
  try {
    const result = await acceptDoubtAssignment(req.body, req.user.id);

    // Defensive: handle unexpected undefined/null results
    if (!result || typeof result !== 'object') {
      console.error('acceptDoubtAssignment returned invalid result:', result);
      return res.status(500).json({ success: false, message: 'Unexpected server response while accepting doubt' });
    }

    if (result.success) {
      res.status(200).json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.error, fieldErrors: result.fieldErrors });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/solver/assigned-doubts
// @desc    Get all doubts assigned to the current solver
// @access  Private
router.get('/assigned-doubts', protect, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    const baseCondition = { solver_id: req.user.id };
    const statusCondition = status !== 'all' ? { resolution_status: status } : null;
    const combinedCondition = statusCondition ? { ...baseCondition, ...statusCondition } : baseCondition;

    const results = await Doubt.aggregate([
      {
        $lookup: {
          from: 'solverdoubts',
          localField: '_id',
          foreignField: 'doubt_id',
          as: 'solverDoubt'
        }
      },
      {
        $match: {
          'solverDoubt.solver_id': req.user.id,
          ...(status !== 'all' ? { 'solverDoubt.resolution_status': status } : {})
        }
      },
      {
        $sort: { 'solverDoubt.assigned_at': -1 }
      }
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/solver/available-doubts
// @desc    Get available doubts for the current solver
// @access  Private
router.get('/available-doubts', protect, async (req, res) => {
  try {
    // Get solver's specialities
    const solverInfo = await Solver.findOne({ user_id: req.user.id }).select('specialities');

    if (!solverInfo || !solverInfo.specialities || solverInfo.specialities.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const specialities = solverInfo.specialities.map(s => s.toLowerCase());

    const availableDoubts = await Doubt.find({
      status: 'open',
      subject: { $in: specialities }
    }).select('id subject description image createdAt').sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: availableDoubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/solver/register
// @desc    Register as a solver
// @access  Private
router.post('/register', protect, async (req, res) => {
  try {
    const { name, email, subjects, experience, bio } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !email || !subjects || subjects.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and at least one subject are required' 
      });
    }

    // Check if solver already exists
    const existingSolver = await Solver.findOne({ user_id: userId });
    if (existingSolver) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already registered as a solver' 
      });
    }

    // Create new solver
    const newSolver = new Solver({
      user_id: userId,
      specialities: subjects.map(s => s.toLowerCase()),
      experience: experience || 'beginner',
      bio: bio || '',
      isActive: true
    });

    await newSolver.save();

    // Update user profile with solver info
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(userId, {
      name: name,
      email: email,
      isSolver: true
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered as solver',
      data: {
        solverId: newSolver._id,
        specialities: newSolver.specialities
      }
    });
  } catch (error) {
    console.error('Solver registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

// @route   POST /api/solver/complete-doubt
// @desc    Mark a doubt as completed by the solver
// @access  Private
router.post('/complete-doubt', protect, async (req, res) => {
  try {
    const result = await completeDoubt(req.body, req.user.id);
    
    if (result.success) {
      res.status(200).json({ success: true, message: result.message, data: result.data });
    } else {
      res.status(400).json({ success: false, message: result.error, fieldErrors: result.fieldErrors });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/solver/solved-doubts
// @desc    Get all solved doubts by the current solver
// @access  Private
router.get('/solved-doubts', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getSolvedDoubts({ page: parseInt(page), limit: parseInt(limit) }, req.user.id);
    
    if (result.success) {
      res.status(200).json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, message: result.error, fieldErrors: result.fieldErrors });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/solver/metrics
// @desc    Get solver performance metrics (current month count and average rating)
// @access  Private
router.get('/metrics', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const solverObjectId = new mongoose.Types.ObjectId(req.user.id);

    const pipeline = [
      { $match: { solver_id: solverObjectId, resolution_status: 'session_completed', resolved_at: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          solvedCount: { $sum: 1 },
          avgRating: { $avg: '$feedback_rating' }
        }
      }
    ];

    const results = await SolverDoubts.aggregate(pipeline);
    const metrics = results[0] || { solvedCount: 0, avgRating: null };

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    console.error('Solver metrics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;

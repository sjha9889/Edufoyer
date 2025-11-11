import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Wallet from '../models/Wallet.js';
import { recalculateAllCoins } from '../actions/wallet/creditCoins.js';

const router = express.Router();

// @route   GET /api/wallet
// @desc    Get user's wallet balance and transactions
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user_id: req.user.id })
      .populate('transactions.doubt_id', 'subject category')
      .sort({ 'transactions.createdAt': -1 });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({
        user_id: req.user.id,
        balance: 0,
        total_earned: 0,
        transactions: []
      });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        total_earned: wallet.total_earned,
        transactions: wallet.transactions
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/wallet/balance
// @desc    Get only wallet balance
// @access  Private
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user_id: req.user.id });
    
    res.status(200).json({
      success: true,
      data: {
        balance: wallet?.balance || 0,
        total_earned: wallet?.total_earned || 0
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/wallet/recalculate
// @desc    Manually recalculate all coins based on current average rating
// @access  Private
router.post('/recalculate', authenticateToken, async (req, res) => {
  try {
    const result = await recalculateAllCoins(req.user.id);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Coins recalculated successfully',
        data: {
          balance: result.balance,
          totalCoins: result.totalCoins,
          averageRating: result.averageRating
        }
      });
    } else {
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Recalculate coins error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;


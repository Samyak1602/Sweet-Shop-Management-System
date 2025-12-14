import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/test/protected
 * @desc    Test protected route (requires authentication)
 * @access  Private
 */
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to protected route',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

/**
 * @route   GET /api/test/public
 * @desc    Test public route (no authentication required)
 * @access  Public
 */
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to public route',
  });
});

export default router;

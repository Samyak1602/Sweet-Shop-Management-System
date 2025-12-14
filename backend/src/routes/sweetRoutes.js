import express from 'express';
import {
  createSweet,
  getAllSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  getSweetsByCategory,
  getAvailableSweets,
} from '../controllers/sweetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/sweets/available
 * @desc    Get all available sweets (in stock)
 * @access  Public
 */
router.get('/available', getAvailableSweets);

/**
 * @route   GET /api/sweets/category/:category
 * @desc    Get sweets by category
 * @access  Public
 */
router.get('/category/:category', getSweetsByCategory);

/**
 * @route   POST /api/sweets
 * @desc    Create a new sweet
 * @access  Private (authenticated users)
 */
router.post('/', protect, createSweet);

/**
 * @route   GET /api/sweets
 * @desc    Get all sweets
 * @access  Public
 */
router.get('/', getAllSweets);

/**
 * @route   GET /api/sweets/:id
 * @desc    Get sweet by ID
 * @access  Public
 */
router.get('/:id', getSweetById);

/**
 * @route   PUT /api/sweets/:id
 * @desc    Update sweet
 * @access  Private (authenticated users)
 */
router.put('/:id', protect, updateSweet);

/**
 * @route   DELETE /api/sweets/:id
 * @desc    Delete sweet
 * @access  Private (admin only)
 */
router.delete('/:id', protect, authorize('admin'), deleteSweet);

export default router;

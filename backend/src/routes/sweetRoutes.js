import express from 'express';
import {
  getAllSweets,
  getSweetById,
  createSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
  searchSweets,
} from '../controllers/sweetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/sweets/search
 * @desc    Search sweets by name, category, or price range
 * @access  Protected
 */
router.get('/search', protect, searchSweets);

/**
 * @route   GET /api/sweets
 * @desc    Get all sweets with optional filters
 * @access  Protected
 */
router.get('/', protect, getAllSweets);

/**
 * @route   GET /api/sweets/:id
 * @desc    Get a single sweet by ID
 * @access  Protected
 */
router.get('/:id', protect, getSweetById);

/**
 * @route   POST /api/sweets
 * @desc    Create a new sweet
 * @access  Protected (Admin only)
 */
router.post('/', protect, authorize('admin'), createSweet);

/**
 * @route   PUT /api/sweets/:id
 * @desc    Update a sweet
 * @access  Protected (Admin only)
 */
router.put('/:id', protect, authorize('admin'), updateSweet);

/**
 * @route   DELETE /api/sweets/:id
 * @desc    Delete a sweet
 * @access  Protected (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), deleteSweet);

/**
 * @route   POST /api/sweets/:id/purchase
 * @desc    Purchase a sweet (decrease quantity)
 * @access  Protected
 */
router.post('/:id/purchase', protect, purchaseSweet);

/**
 * @route   POST /api/sweets/:id/restock
 * @desc    Restock a sweet (increase quantity)
 * @access  Protected (Admin only)
 */
router.post('/:id/restock', protect, authorize('admin'), restockSweet);

export default router;


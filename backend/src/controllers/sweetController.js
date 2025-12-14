import * as sweetService from '../services/sweetService.js';

/**
 * Get all sweets with optional search/filter
 * @route GET /api/sweets
 */
export const getAllSweets = async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(
      key => filters[key] === undefined && delete filters[key]
    );

    const sweets = await sweetService.getAllSweets(filters);

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search sweets
 * @route GET /api/sweets/search
 */
export const searchSweets = async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name || req.query.q,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(
      key => filters[key] === undefined && delete filters[key]
    );

    const sweets = await sweetService.getAllSweets(filters);

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single sweet by ID
 * @route GET /api/sweets/:id
 */
export const getSweetById = async (req, res, next) => {
  try {
    const sweet = await sweetService.getSweetById(req.params.id);

    res.status(200).json({
      success: true,
      data: sweet,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Create a new sweet
 * @route POST /api/sweets
 */
export const createSweet = async (req, res, next) => {
  try {
    const sweet = await sweetService.createSweet(req.body);

    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: sweet,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Update a sweet
 * @route PUT /api/sweets/:id
 */
export const updateSweet = async (req, res, next) => {
  try {
    const sweet = await sweetService.updateSweet(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Sweet updated successfully',
      data: sweet,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete a sweet
 * @route DELETE /api/sweets/:id
 */
export const deleteSweet = async (req, res, next) => {
  try {
    await sweetService.deleteSweet(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Sweet deleted successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Purchase a sweet (decrease quantity)
 * @route POST /api/sweets/:id/purchase
 */
export const purchaseSweet = async (req, res, next) => {
  try {
    const quantity = req.body.quantity || 1;
    const sweet = await sweetService.purchaseSweet(req.params.id, quantity);

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      data: sweet,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Restock a sweet (increase quantity)
 * @route POST /api/sweets/:id/restock
 */
export const restockSweet = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required and must be greater than 0',
      });
    }

    const sweet = await sweetService.restockSweet(req.params.id, quantity);

    res.status(200).json({
      success: true,
      message: 'Restock successful',
      data: sweet,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};


import * as sweetService from '../services/sweetService.js';

/**
 * Create a new sweet
 * @route POST /api/sweets
 * @access Private (authenticated users)
 */
export const createSweet = async (req, res, next) => {
  try {
    const sweetData = req.body;
    const sweet = await sweetService.createSweet(sweetData);

    res.status(201).json({
      success: true,
      data: sweet,
      message: 'Sweet created successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Get all sweets
 * @route GET /api/sweets
 * @access Public
 */
export const getAllSweets = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      inStock: req.query.inStock,
    };

    const sweets = await sweetService.getAllSweets(filters);

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Get sweet by ID
 * @route GET /api/sweets/:id
 * @access Public
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
 * Update sweet
 * @route PUT /api/sweets/:id
 * @access Private (authenticated users)
 */
export const updateSweet = async (req, res, next) => {
  try {
    const sweet = await sweetService.updateSweet(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: sweet,
      message: 'Sweet updated successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Delete sweet
 * @route DELETE /api/sweets/:id
 * @access Private (admin only)
 */
export const deleteSweet = async (req, res, next) => {
  try {
    const result = await sweetService.deleteSweet(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Get sweets by category
 * @route GET /api/sweets/category/:category
 * @access Public
 */
export const getSweetsByCategory = async (req, res, next) => {
  try {
    const sweets = await sweetService.getSweetsByCategory(req.params.category);

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Get available sweets
 * @route GET /api/sweets/available
 * @access Public
 */
export const getAvailableSweets = async (req, res, next) => {
  try {
    const sweets = await sweetService.getAvailableSweets();

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Search sweets
 * @route GET /api/sweets/search
 * @access Public
 */
export const searchSweets = async (req, res, next) => {
  try {
    const searchParams = {
      name: req.query.name,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    const sweets = await sweetService.searchSweets(searchParams);

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

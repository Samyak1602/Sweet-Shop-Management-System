import Sweet from '../models/Sweet.js';

/**
 * Create a new sweet
 * @param {Object} sweetData - Sweet data
 * @returns {Object} Created sweet
 */
export const createSweet = async sweetData => {
  // Validate required fields
  const { name, category, price, quantity } = sweetData;

  if (!name || !category || price === undefined || quantity === undefined) {
    throw {
      statusCode: 400,
      message: 'Name, category, price, and quantity are required',
    };
  }

  // Validate price
  if (price <= 0) {
    throw {
      statusCode: 400,
      message: 'Price must be greater than 0',
    };
  }

  // Validate quantity
  if (quantity < 0) {
    throw {
      statusCode: 400,
      message: 'Quantity cannot be negative',
    };
  }

  // Create sweet
  const sweet = await Sweet.create(sweetData);
  return sweet;
};

/**
 * Get all sweets
 * @param {Object} filters - Optional filters
 * @returns {Array} List of sweets
 */
export const getAllSweets = async (filters = {}) => {
  const query = {};

  // Apply filters if provided
  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.inStock !== undefined) {
    query.inStock = filters.inStock;
  }

  const sweets = await Sweet.find(query).sort({ createdAt: -1 });
  return sweets;
};

/**
 * Search sweets with multiple filters
 * @param {Object} searchParams - Search parameters
 * @returns {Array} List of matching sweets
 */
export const searchSweets = async (searchParams = {}) => {
  const query = {};

  // Name search - case-insensitive partial match
  if (searchParams.name && searchParams.name.trim() !== '') {
    query.name = {
      $regex: searchParams.name.trim(),
      $options: 'i', // Case-insensitive
    };
  }

  // Category filter - exact match
  if (searchParams.category) {
    query.category = searchParams.category;
  }

  // Price range filters
  if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
    query.price = {};

    if (searchParams.minPrice !== undefined) {
      const minPrice = parseFloat(searchParams.minPrice);
      if (!isNaN(minPrice)) {
        query.price.$gte = minPrice;
      }
    }

    if (searchParams.maxPrice !== undefined) {
      const maxPrice = parseFloat(searchParams.maxPrice);
      if (!isNaN(maxPrice)) {
        query.price.$lte = maxPrice;
      }
    }

    // Remove empty price query if no valid filters were added
    if (Object.keys(query.price).length === 0) {
      delete query.price;
    }
  }

  // Execute query with sorting (newest first)
  const sweets = await Sweet.find(query).sort({ createdAt: -1 });
  return sweets;
};

/**
 * Get sweet by ID
 * @param {String} sweetId - Sweet ID
 * @returns {Object} Sweet data
 */
export const getSweetById = async sweetId => {
  const sweet = await Sweet.findById(sweetId);

  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

  return sweet;
};

/**
 * Update sweet
 * @param {String} sweetId - Sweet ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated sweet
 */
export const updateSweet = async (sweetId, updateData) => {
  // Validate price if provided
  if (updateData.price !== undefined && updateData.price <= 0) {
    throw {
      statusCode: 400,
      message: 'Price must be greater than 0',
    };
  }

  // Validate quantity if provided
  if (updateData.quantity !== undefined && updateData.quantity < 0) {
    throw {
      statusCode: 400,
      message: 'Quantity cannot be negative',
    };
  }

  const sweet = await Sweet.findByIdAndUpdate(
    sweetId,
    updateData,
    {
      new: true, // Return updated document
      runValidators: true, // Run model validators
    }
  );

  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

  return sweet;
};

/**
 * Delete sweet
 * @param {String} sweetId - Sweet ID
 * @returns {Object} Success message
 */
export const deleteSweet = async sweetId => {
  const sweet = await Sweet.findByIdAndDelete(sweetId);

  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

  return {
    message: 'Sweet deleted successfully',
    deletedSweet: sweet,
  };
};

/**
 * Get sweets by category
 * @param {String} category - Category name
 * @returns {Array} List of sweets in category
 */
export const getSweetsByCategory = async category => {
  const sweets = await Sweet.findByCategory(category);
  return sweets;
};

/**
 * Get available sweets
 * @returns {Array} List of available sweets
 */
export const getAvailableSweets = async () => {
  const sweets = await Sweet.findAvailable();
  return sweets;
};

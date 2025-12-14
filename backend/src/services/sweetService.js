import Sweet from '../models/Sweet.js';

/**
 * Get all sweets with optional filters
 * @param {Object} filters - Filter options (name, category, minPrice, maxPrice)
 * @returns {Array} List of sweets
 */
export const getAllSweets = async (filters = {}) => {
  const query = {};

  // Filter by name (case-insensitive search)
  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }

  // Filter by price range
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) {
      query.price.$gte = parseFloat(filters.minPrice);
    }
    if (filters.maxPrice) {
      query.price.$lte = parseFloat(filters.maxPrice);
    }
  }

  const sweets = await Sweet.find(query).sort({ createdAt: -1 });
  return sweets;
};

/**
 * Get a single sweet by ID
 * @param {String} id - Sweet ID
 * @returns {Object} Sweet object
 */
export const getSweetById = async id => {
  const sweet = await Sweet.findById(id);
  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }
  return sweet;
};

/**
 * Create a new sweet
 * @param {Object} sweetData - Sweet data
 * @returns {Object} Created sweet
 */
export const createSweet = async sweetData => {
  const { name, category, price, quantity, description, image } = sweetData;

  // Validate required fields
  if (!name || !category || !price) {
    throw {
      statusCode: 400,
      message: 'Name, category, and price are required',
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
  const qty = quantity || 0;
  if (qty < 0) {
    throw {
      statusCode: 400,
      message: 'Quantity cannot be negative',
    };
  }

  const sweet = await Sweet.create({
    name,
    category,
    price,
    quantity: qty,
    description,
    image,
  });

  return sweet;
};

/**
 * Update a sweet
 * @param {String} id - Sweet ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated sweet
 */
export const updateSweet = async (id, updateData) => {
  const sweet = await Sweet.findById(id);
  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

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

  // Update fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      sweet[key] = updateData[key];
    }
  });

  await sweet.save();
  return sweet;
};

/**
 * Delete a sweet
 * @param {String} id - Sweet ID
 * @returns {Object} Deletion confirmation
 */
export const deleteSweet = async id => {
  const sweet = await Sweet.findById(id);
  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

  await Sweet.findByIdAndDelete(id);
  return { message: 'Sweet deleted successfully' };
};

/**
 * Purchase a sweet (decrease quantity)
 * @param {String} id - Sweet ID
 * @param {Number} quantity - Quantity to purchase (default: 1)
 * @returns {Object} Updated sweet
 */
export const purchaseSweet = async (id, quantity = 1) => {
  const sweet = await Sweet.findById(id);
  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

  if (quantity <= 0) {
    throw {
      statusCode: 400,
      message: 'Purchase quantity must be greater than 0',
    };
  }

  if (sweet.quantity < quantity) {
    throw {
      statusCode: 400,
      message: 'Insufficient stock available',
    };
  }

  await sweet.updateQuantity(-quantity);
  return sweet;
};

/**
 * Restock a sweet (increase quantity)
 * @param {String} id - Sweet ID
 * @param {Number} quantity - Quantity to add
 * @returns {Object} Updated sweet
 */
export const restockSweet = async (id, quantity) => {
  const sweet = await Sweet.findById(id);
  if (!sweet) {
    throw {
      statusCode: 404,
      message: 'Sweet not found',
    };
  }

  if (quantity <= 0) {
    throw {
      statusCode: 400,
      message: 'Restock quantity must be greater than 0',
    };
  }

  await sweet.updateQuantity(quantity);
  return sweet;
};


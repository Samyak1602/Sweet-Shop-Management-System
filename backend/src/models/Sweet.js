import mongoose from 'mongoose';

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sweet name is required'],
      trim: true,
      minlength: [2, 'Sweet name must be at least 2 characters long'],
      maxlength: [100, 'Sweet name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: [
          'Traditional',
          'Chocolate',
          'Milk-based',
          'Dry Fruit',
          'Sugar-free',
          'Seasonal',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: 'Price must be greater than 0',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field to check if sweet is available
sweetSchema.virtual('isAvailable').get(function () {
  return this.quantity > 0 && this.inStock;
});

// Index for faster queries
sweetSchema.index({ name: 1, category: 1 });
sweetSchema.index({ category: 1 });

// Pre-save middleware to update inStock status based on quantity
sweetSchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.inStock = false;
  }
  next();
});

// Method to update quantity
sweetSchema.methods.updateQuantity = function (change) {
  this.quantity += change;
  if (this.quantity < 0) {
    this.quantity = 0;
  }
  if (this.quantity === 0) {
    this.inStock = false;
  } else if (this.quantity > 0) {
    this.inStock = true;
  }
  return this.save();
};

// Static method to find sweets by category
sweetSchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

// Static method to find available sweets
sweetSchema.statics.findAvailable = function () {
  return this.find({ quantity: { $gt: 0 }, inStock: true });
};

const Sweet = mongoose.model('Sweet', sweetSchema);

export default Sweet;

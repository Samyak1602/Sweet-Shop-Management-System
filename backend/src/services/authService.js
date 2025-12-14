import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { validatePassword, validateEmail } from '../utils/validators.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user and success message
 */
export const registerUser = async ({ name, email, password }) => {
  // Validate required fields
  if (!name || !email || !password) {
    throw {
      statusCode: 400,
      message: 'Name, email, and password are required',
    };
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw {
      statusCode: 400,
      message: 'Please provide a valid email address',
    };
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw {
      statusCode: 400,
      message: passwordValidation.message,
    };
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw {
      statusCode: 400,
      message: 'Email already exists',
    };
  }

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  // Return user without password
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    message: 'User registered successfully',
  };
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @returns {Object} User data and JWT token
 */
export const loginUser = async ({ email, password }) => {
  // Validate required fields
  if (!email || !password) {
    throw {
      statusCode: 400,
      message: 'Email and password are required',
    };
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw {
      statusCode: 400,
      message: 'Please provide a valid email address',
    };
  }

  // Find user by email (include password for comparison)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  if (!user) {
    throw {
      statusCode: 401,
      message: 'Invalid credentials',
    };
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw {
      statusCode: 401,
      message: 'Invalid credentials',
    };
  }

  // Generate JWT token
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  // Return user data and token
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
    message: 'Login successful',
  };
};

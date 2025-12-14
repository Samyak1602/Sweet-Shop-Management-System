import * as authService from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: generateToken({
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        }),
      },
    });
  } catch (error) {
    // Pass error to error handler middleware
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    // Pass error to error handler middleware
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

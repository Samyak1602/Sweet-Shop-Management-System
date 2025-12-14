import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT token
 */
export const generateToken = payload => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = token => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  return jwt.verify(token, secret);
};

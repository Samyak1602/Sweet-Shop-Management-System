/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} { isValid: Boolean, message: String }
 */
export const validatePassword = password => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter and one number',
    };
  }

  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean}
 */
export const validateEmail = email => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

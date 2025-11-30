const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const {
  generateAccessToken,
} = require('../utils/jwt');

/**
 * POST /graduates-system/auth/login
 * Login with email and password
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user by email
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if user is active
  if (!user.is_active) {
    return res.status(401).json({ message: 'Account is inactive' });
  }

  // Verify password
  const isPasswordValid = await user.checkPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate access token
  const accessToken = generateAccessToken(user.id);

  res.json({
    id: user.id,
    email: user.email,
    token: accessToken,
  });
});

/**
 * POST /graduates-system/auth/register
 * Register a new user
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, nationalId, phone, password } = req.body;

  // Validate input
  if (!fullName || !email || !nationalId || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Check if user with email already exists
  const existingEmail = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingEmail) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Check if user with national ID already exists
  const existingNationalId = await User.findOne({ where: { national_id: nationalId } });
  if (existingNationalId) {
    return res.status(400).json({ message: 'National ID already registered' });
  }

  // Create user (password will be automatically hashed by the model hook)
  const user = await User.create({
    full_name: fullName,
    email: email.toLowerCase(),
    national_id: nationalId,
    phone: phone,
    password_hash: password, // Will be hashed by beforeCreate hook
    is_active: true,
  });

  res.status(201).json({
    message: 'Account created successfully',
    id: user.id,
    email: user.email,
  });
});

/**
 * POST /graduates-system/auth/create-test-user
 * Create a test user (for development/testing only)
 */
const createTestUser = asyncHandler(async (req, res) => {
  const { 
    fullName = 'Test User', 
    email = 'test@example.com', 
    nationalId = '12345678901234',
    phone = '01234567890',
    password = 'password123' 
  } = req.body;

  // Check if user already exists - delete it first to recreate with correct password
  const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    // Delete existing user to recreate with proper password hash
    await existingUser.destroy();
  }

  // Create user (password will be automatically hashed by the model hook)
  const user = await User.create({
    full_name: fullName,
    email: email.toLowerCase(),
    national_id: nationalId,
    phone: phone,
    password_hash: password, // Will be hashed by beforeCreate hook
    is_active: true,
  });

  res.status(201).json({
    message: 'Test user created successfully',
    email: user.email,
    id: user.id,
  });
});

/**
 * POST /graduates-system/auth/reset-password
 * Reset password using National ID
 */
const resetPassword = asyncHandler(async (req, res) => {
  // Check if request body exists
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required' });
  }

  const { nationalId, newPassword } = req.body;

  // Validate input
  if (!nationalId || !newPassword) {
    return res.status(400).json({ message: 'National ID and new password are required' });
  }

  // Validate password length
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Find user by National ID
  const user = await User.findOne({ where: { national_id: nationalId } });

  if (!user) {
    return res.status(404).json({ message: 'National ID not found' });
  }

  // Check if user is active
  if (!user.is_active) {
    return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
  }

  // Update password (will be automatically hashed by the beforeUpdate hook)
  user.password_hash = newPassword;
  await user.save();

  res.json({
    message: 'Password reset successfully',
  });
});

module.exports = {
  login,
  register,
  createTestUser,
  resetPassword,
};


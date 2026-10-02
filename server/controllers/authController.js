import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fairshare_super_secret_jwt_key_2026';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents XSS attacks from reading cookie
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in prod
    sameSite: 'lax'
  };

  // Convert to object and strip password if present
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  res.status(statusCode)
     .cookie('token', token, cookieOptions)
     .json({
       success: true,
       message,
       token, // Also return token in body for SPA flexibility
       user: userObj
     });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    sendTokenResponse(user, 201, res, 'Account registered successfully');
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user & return JWT in HttpOnly cookie
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Must explicitly select +password since schema has select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Search registered users (for adding to groups)
// @route   GET /api/auth/users?query=xxx
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.query || '';
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email avatar').limit(10);

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

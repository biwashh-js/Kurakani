import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.token || req.headers.authorization?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - No token provided. Please login.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token. Please login again.',
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please login again.',
      });
    }

    // CRITICAL: Attach user to request and continue
    req.user = user;
    next(); // This MUST be outside the if block!

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token. Please login again.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.',
    });
  }
};
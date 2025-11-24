// middleware/authMiddleware.js
const asyncHandler = require("express-async-handler");
const { verifyAccessToken } = require("../utils/jwt");
const { User } = require("../models");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user from token (without password)
      req.user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["password_hash"] },
      });

      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Not authenticated" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = { protect };

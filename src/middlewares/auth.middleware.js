import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";
import { User } from "../modules/auth/auth.model.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new UnauthorizedError("Authentication token is required"));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new UnauthorizedError("User not found"));
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been suspended",
      });
    }

    req.user = {
      id: user._id,
      platformRole: user.platformRole,
      email: user.email,
      name: user.name,
      status: user.status,
    };

    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};

// Separate middleware for endpoints that require active status
export const requireActiveUser = async (req, res, next) => {
  if (req.user.platformRole !== "super_admin" && req.user.status !== "active") {
    return res.status(403).json({
      message: "Your account is pending workspace approval",
    });
  }

  return next();
};

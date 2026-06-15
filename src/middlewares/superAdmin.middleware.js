import { ForbiddenError } from "../utils/errors.js";

export const requireSuperAdmin = (req, res, next) => {
  if (req.user.platformRole !== "super_admin") {
    return next(new ForbiddenError("Super admin access required"));
  }

  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user.platformRole !== "super_admin") {
    return res.status(403).json({
      message: "Super admin access required",
    });
  }

  next();
};

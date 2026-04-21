const adminMiddleware = (req, res, next) => {
  const user = req.user; 

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only."
    });
  }

  next();
};

module.exports = adminMiddleware;
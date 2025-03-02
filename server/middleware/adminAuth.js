const isAdmin = (req, res, next) => {
  if (req.userData.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = isAdmin;
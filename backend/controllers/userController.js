const { findById } = require('../models/userModel');

function profile(req, res) {
  const user = findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ id: user.id, email: user.email, role: user.role });
}

function adminDashboard(_req, res) {
  return res.json({ message: 'Admin dashboard' });
}

module.exports = { profile, adminDashboard };

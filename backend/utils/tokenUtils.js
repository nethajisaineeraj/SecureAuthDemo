const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  const payload = { sub: user.id, role: user.role };
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn });
}

function generateRefreshToken(user) {
  const payload = { sub: user.id, role: user.role };
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

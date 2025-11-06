const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { createUser, findByEmail, findById, setRefreshTokenHash, clearRefreshTokenHash } = require('../models/userModel');

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

async function register(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const existing = findByEmail(email);
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser(email, passwordHash, role || 'user');
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  setRefreshTokenHash(user.id, refreshHash);
  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken, user });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const userRecord = findByEmail(email);
  if (!userRecord) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, userRecord.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const user = { id: userRecord.id, email: userRecord.email, role: userRecord.role };
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  setRefreshTokenHash(user.id, refreshHash);
  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken, user });
}

async function refresh(req, res) {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Missing refresh token' });
  try {
    const decoded = verifyRefreshToken(token);
    const userRecord = findById(decoded.sub);
    if (!userRecord || !userRecord.refresh_token_hash) return res.status(401).json({ message: 'Invalid refresh token' });
    const match = await bcrypt.compare(token, userRecord.refresh_token_hash);
    if (!match) return res.status(401).json({ message: 'Invalid refresh token' });
    const user = { id: userRecord.id, email: userRecord.email, role: userRecord.role };
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    setRefreshTokenHash(user.id, newRefreshHash);
    setRefreshCookie(res, newRefreshToken);
    return res.json({ accessToken: newAccessToken, user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

async function logout(req, res) {
  const token = req.cookies && req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      clearRefreshTokenHash(decoded.sub);
    } catch (_) { }
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/api/auth' });
  return res.json({ message: 'Logged out' });
}

module.exports = { register, login, refresh, logout };

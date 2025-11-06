const db = require('../config/db');

function createUser(email, passwordHash, role) {
  const stmt = db.prepare(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`);
  const info = stmt.run(email, passwordHash, role);
  return { id: info.lastInsertRowid, email, role };
}

function findByEmail(email) {
  const stmt = db.prepare(`SELECT id, email, password_hash, role, refresh_token_hash FROM users WHERE email = ?`);
  return stmt.get(email) || null;
}

function findById(id) {
  const stmt = db.prepare(`SELECT id, email, role, refresh_token_hash FROM users WHERE id = ?`);
  return stmt.get(id) || null;
}

function setRefreshTokenHash(userId, hash) {
  const stmt = db.prepare(`UPDATE users SET refresh_token_hash = ? WHERE id = ?`);
  stmt.run(hash, userId);
}

function clearRefreshTokenHash(userId) {
  const stmt = db.prepare(`UPDATE users SET refresh_token_hash = NULL WHERE id = ?`);
  stmt.run(userId);
}

function setRoleByEmail(email, role) {
  const stmt = db.prepare(`UPDATE users SET role = ? WHERE email = ?`);
  const info = stmt.run(role, email);
  return info.changes;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  setRefreshTokenHash,
  clearRefreshTokenHash,
  setRoleByEmail,
};

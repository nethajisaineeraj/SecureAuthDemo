const bcrypt = require('bcryptjs');
const { findByEmail, createUser, setRoleByEmail } = require('../models/userModel');

function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return;
  }
  const existing = findByEmail(email);
  if (!existing) {
    const hash = bcrypt.hashSync(password, 10);
    createUser(email, hash, 'admin');
    return;
  }
  if (existing.role !== 'admin') {
    setRoleByEmail(email, 'admin');
  }
}

module.exports = bootstrapAdmin;

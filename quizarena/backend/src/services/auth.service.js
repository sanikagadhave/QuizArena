// src/services/auth.service.js
// ===================== AUTH SERVICE =====================
// Owns: users table only. This is the seam for a future standalone
// Auth microservice - nothing outside this file touches `users` directly
// for writes.
const { v4: uuid } = require('uuid');
const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatarColor: u.avatar_color, createdAt: u.created_at };
}

function register({ name, email, password, role }) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const id = uuid();
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const passwordHash = hashPassword(password);
  const finalRole = role === 'admin' ? 'admin' : 'student';

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), email.toLowerCase(), passwordHash, finalRole, color);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  return { user: publicUser(user), token };
}

function login({ email, password }) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  const valid = comparePassword(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password.');

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  return { user: publicUser(user), token };
}

function getById(id) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) throw new ApiError(404, 'User not found.');
  return publicUser(user);
}

module.exports = { register, login, getById, publicUser };

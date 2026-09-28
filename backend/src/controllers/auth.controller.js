// src/controllers/auth.controller.js
const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const result = authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = authService.getById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

module.exports = { register, login, me };

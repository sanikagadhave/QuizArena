// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const optionalAuth = require('./middleware/optionalAuth.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const quizRoutes = require('./routes/quiz.routes');
const attemptRoutes = require('./routes/attempt.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Apply optional auth globally to quiz routes so GET /quizzes can tell
// admins from guests without requiring a token.
app.use('/api/quizzes', optionalAuth);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'QuizArena API is running', time: new Date().toISOString() }));

// ===== Route groups map 1:1 onto the future microservices =====
app.use('/api/auth', authRoutes);            // -> Auth Service
app.use('/api/quizzes', quizRoutes);         // -> Quiz Service
app.use('/api/attempts', attemptRoutes);     // -> Attempt/Scoring Service
app.use('/api/leaderboard', leaderboardRoutes); // -> Leaderboard Service
app.use('/api/admin', adminRoutes);          // -> Admin aggregate (Quiz + Attempt)

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

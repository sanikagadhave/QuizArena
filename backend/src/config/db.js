// src/config/db.js
// Central DB connection. Uses SQLite (file-based, zero external setup) via
// better-sqlite3 for a simple, synchronous, beginner-friendly API.
//
// NOTE ON MICROSERVICE-READINESS:
// Each "domain" (users, quizzes, attempts, leaderboard) only ever accesses
// its own tables through its own service module. That means when this
// monolith is later split into Auth / Quiz / Attempt / Leaderboard
// services, each service can be given its own database (Postgres/Mongo/etc)
// without touching the others - the service layer is already the seam.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/quizarena.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    -- ===================== AUTH SERVICE DOMAIN =====================
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student','admin')) DEFAULT 'student',
      avatar_color TEXT DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ===================== QUIZ SERVICE DOMAIN =====================
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy','Medium','Hard')) DEFAULT 'Easy',
      duration_minutes INTEGER NOT NULL DEFAULT 10,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL CHECK(correct_option IN ('a','b','c','d')),
      points INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    -- ================ ATTEMPT / SCORING SERVICE DOMAIN =============
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      submitted_at TEXT,
      status TEXT NOT NULL CHECK(status IN ('in_progress','submitted','auto_submitted')) DEFAULT 'in_progress',
      score INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      time_taken_seconds INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempt_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_option TEXT CHECK(selected_option IN ('a','b','c','d') OR selected_option IS NULL),
      is_correct INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    -- ================== LEADERBOARD SERVICE DOMAIN =================
    -- Leaderboard is derived from the attempts table (materialized-view
    -- style, kept in sync on submit) so the future Leaderboard microservice can
    -- read this table directly without joining across other services.
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      attempt_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      time_taken_seconds INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON attempts(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_quiz ON leaderboard_entries(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_answers_attempt ON attempt_answers(attempt_id);
  `);
}

initSchema();

module.exports = db;

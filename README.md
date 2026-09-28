# 🎯 QuizArena

A full-stack, timed quiz platform for students — built with **React (Vite + Tailwind)** on the
frontend and **Node.js/Express + SQLite** on the backend, with JWT authentication, role-based
access (Student/Admin), automatic scoring, quiz history, and a live leaderboard.

The backend is a single Node app today, but its code is **already organized into four
independent service modules** (Auth, Quiz, Attempt/Scoring, Leaderboard) so it can be split
into real microservices later with minimal rework. Docker and Kubernetes/Minikube manifests
are included for that next step.

---

## 1. Project Structure

```
quizarena/
├── backend/                     # Express REST API (Node.js)
│   ├── src/
│   │   ├── config/db.js         # SQLite connection + schema (all tables)
│   │   ├── services/            # Business logic, one file per domain:
│   │   │   ├── auth.service.js        -> future Auth Service
│   │   │   ├── quiz.service.js        -> future Quiz Service
│   │   │   ├── attempt.service.js     -> future Attempt/Scoring Service
│   │   │   └── leaderboard.service.js -> future Leaderboard Service
│   │   ├── controllers/         # Thin HTTP layer calling services
│   │   ├── routes/              # Express routers, one per domain
│   │   ├── middleware/          # auth (JWT), role guard, validation, errors
│   │   ├── utils/                # jwt.js, password.js, ApiError.js
│   │   ├── seed/seed.js         # Sample admin/student users + 8 quizzes
│   │   ├── database/            # SQLite .db file lives here (generated)
│   │   ├── app.js               # Express app + route wiring
│   │   └── server.js            # Entry point (seeds DB, starts server)
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                    # React SPA (Vite)
│   ├── src/
│   │   ├── api/                 # Axios client + per-domain API calls
│   │   ├── context/AuthContext.jsx
│   │   ├── components/          # Navbar, QuizCard, Timer, QuestionNav, etc.
│   │   ├── pages/                # Landing, Login, Register, Dashboard,
│   │   │                          Browse, QuizAttempt, Results, History,
│   │   │                          Profile, Leaderboard
│   │   └── pages/admin/         # AdminDashboard, AdminQuizzes, AdminQuizEditor
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── k8s/                         # Kubernetes manifests (Minikube-ready)
├── docker-compose.yml           # Run both containers locally with one command
└── README.md                    # (this file)
```

---

## 2. Tech Stack & Why

| Layer      | Choice                          | Why |
|------------|----------------------------------|-----|
| Frontend   | React 18 + Vite + Tailwind CSS  | Fast dev server, modern component model, utility CSS for a polished, responsive UI without a design system dependency |
| Routing    | react-router-dom                | Standard client-side routing/protected routes |
| Charts     | recharts                        | Lightweight charts for the admin dashboard |
| Backend    | Node.js + Express               | Minimal, well-understood, huge ecosystem, easy to containerize |
| Database   | **SQLite** via `better-sqlite3` | Zero external setup (no server to install/configure) — perfect for a college project that still needs a *real* relational database with foreign keys, transactions and indexes. Swappable for Postgres/MySQL later with minimal code changes since all access goes through the service layer |
| Auth       | JWT + bcryptjs                  | Stateless auth, industry-standard password hashing |
| Validation | express-validator               | Declarative request validation with consistent error shape |

---

## 3. Prerequisites

- **Node.js 18+** and npm
- No database server to install — SQLite is a single file, created automatically.

---

## 4. Backend Setup & Run

```bash
cd backend
npm install
cp .env.example .env      # edit values if you want, defaults work out of the box
npm run dev                # starts on http://localhost:5000 with auto-reload (nodemon)
# or: npm start            # plain node, no auto-reload
```

On first boot, the server automatically **seeds the database** (`src/database/quizarena.db`)
with an admin account, two demo student accounts, and 8 sample quizzes across Programming,
Science, Geography, History, Mathematics and Computer Science.

**Seeded accounts** (also printed in the server console on first run):

| Role    | Email                  | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@quizarena.com     | Admin@123    |
| Student | aditi@student.com       | Student@123  |
| Student | rohan@student.com       | Student@123  |

To re-seed from scratch, stop the server and delete the `.db` file(s):
```bash
rm backend/src/database/quizarena.db*
npm run dev
```

### Environment variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DB_PATH=./src/database/quizarena.db
JWT_SECRET=quizarena_super_secret_change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@quizarena.com
ADMIN_PASSWORD=Admin@123
```

### Quick API check

```bash
curl http://localhost:5000/api/health
```

---

## 5. Frontend Setup & Run

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` (see
`frontend/vite.config.js`), so **make sure the backend is running first**.

Open **http://localhost:5173** and log in with one of the seeded accounts above, or register a
new student account.

To build a production bundle:
```bash
npm run build      # outputs static files to frontend/dist
npm run preview    # serve the production build locally
```

---

## 6. Database Schema

SQLite file: `backend/src/database/quizarena.db` (auto-created). Key tables:

- **users** — id, name, email, password_hash, role (`student`/`admin`), avatar_color
- **quizzes** — id, title, description, category, difficulty, duration_minutes, is_published, created_by
- **questions** — id, quiz_id, question_text, option_a..d, correct_option, points, order_index
- **attempts** — id, user_id, quiz_id, started_at, submitted_at, status, score, total_points, correct_count, time_taken_seconds
- **attempt_answers** — id, attempt_id, question_id, selected_option, is_correct
- **leaderboard_entries** — id, user_id, quiz_id, attempt_id, score, total_points, time_taken_seconds

Foreign keys and indexes are defined in `backend/src/config/db.js`, with each table
commented under the "service domain" that owns it.

---

## 7. REST API Reference

Base URL: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth Service — `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Register a new student account |
| POST | `/login` | – | Login, returns `{ user, token }` |
| GET | `/me` | ✅ | Get the current logged-in user |

### Quiz Service — `/api/quizzes`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | optional | List quizzes (supports `?search=&category=&difficulty=`). Admins also see unpublished quizzes |
| GET | `/categories` | – | Distinct list of quiz categories |
| GET | `/:id` | optional | Get one quiz with its questions (correct answers hidden unless admin) |
| POST | `/` | ✅ admin | Create a quiz with questions |
| PUT | `/:id` | ✅ admin | Update a quiz (optionally replacing all questions) |
| DELETE | `/:id` | ✅ admin | Delete a quiz |

### Attempt/Scoring Service — `/api/attempts`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/start` | ✅ | Start an attempt for a quiz (`{ quizId }`), returns questions without answers |
| POST | `/:id/submit` | ✅ | Submit answers, auto-scored server-side |
| POST | `/:id/auto-submit` | ✅ | Same as submit, called automatically when the timer hits zero |
| GET | `/:id/review` | ✅ | Full answer-by-answer review with correct answers revealed |
| GET | `/history` | ✅ | The logged-in user's past attempts |
| GET | `/stats` | ✅ | Aggregate stats (accuracy, avg score, category breakdown) |
| GET | `/in-progress/:quizId` | ✅ | Check for a resumable in-progress attempt |

The server enforces the time limit independently of the client: if you submit after the
allotted duration (+15s grace for latency), the attempt is marked `auto_submitted` regardless
of what the client sends.

### Leaderboard Service — `/api/leaderboard`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/global` | ✅ | Global ranking by total score across all quizzes |
| GET | `/quiz/:quizId` | ✅ | Ranking for one specific quiz |

### Admin — `/api/admin`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/overview` | ✅ admin | Dashboard stats: user/quiz/attempt counts, recent attempts, popularity |

All error responses share the shape: `{ "success": false, "message": "...", "details": [...] }`.

---

## 8. Frontend Features Map

| Feature | Page(s) |
|---|---|
| Landing / marketing page | `pages/Landing.jsx` |
| Login / Registration | `pages/Login.jsx`, `pages/Register.jsx` |
| Student dashboard (stats + popular quizzes) | `pages/Dashboard.jsx` |
| Browse / search / filter by category & difficulty | `pages/Browse.jsx` |
| Timed quiz with question nav, progress bar, auto-submit | `pages/QuizAttempt.jsx` |
| Results + full answer review | `pages/Results.jsx` |
| Quiz history table | `pages/History.jsx` |
| Profile + statistics | `pages/Profile.jsx` |
| Live leaderboard (global + per-quiz, polls every 15s) | `pages/Leaderboard.jsx` |
| Admin dashboard (charts, recent activity) | `pages/admin/AdminDashboard.jsx` |
| Admin quiz list (edit/delete/publish) | `pages/admin/AdminQuizzes.jsx` |
| Admin quiz create/edit (dynamic question builder) | `pages/admin/AdminQuizEditor.jsx` |

---

## 9. Running Everything With Docker (optional)

```bash
# from the project root
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:5000

The backend's SQLite file persists in a named Docker volume (`quizarena_db`), so data survives
container restarts.

---

## 10. Deploying to Kubernetes / Minikube (optional)

The `k8s/` folder has manifests already split so each backend "service domain" can later become
its own Deployment:

```bash
minikube start
eval $(minikube docker-env)              # build images directly into Minikube's Docker

docker build -t quizarena-backend:latest ./backend
docker build -t quizarena-frontend:latest ./frontend

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
# optional, needs `minikube addons enable ingress`:
kubectl apply -f k8s/ingress.yaml

kubectl get pods -n quizarena
minikube service quizarena-frontend -n quizarena   # opens the app in your browser
```

---

## 11. Path to Microservices

The backend is a monolith today, but the seam is already drawn:

- **Auth Service** — `services/auth.service.js` + `routes/auth.routes.js`, owns the `users` table only.
- **Quiz Service** — `services/quiz.service.js` + `routes/quiz.routes.js`, owns `quizzes` and `questions`.
- **Attempt/Scoring Service** — `services/attempt.service.js` + `routes/attempt.routes.js`, owns `attempts` and `attempt_answers`, and enforces timing/scoring rules.
- **Leaderboard Service** — `services/leaderboard.service.js` + `routes/leaderboard.routes.js`, owns a denormalized `leaderboard_entries` table kept in sync by the Attempt service on every submit — so it never needs to join into another service's tables.

To split them for real: give each service its own repo/Dockerfile/database, replace the direct
`require('../services/...')` calls between domains with HTTP or message-queue calls, and update
the Ingress/K8s manifests to route `/api/auth`, `/api/quizzes`, `/api/attempts` and
`/api/leaderboard` to four separate Deployments instead of one.

---

## 12. Troubleshooting

- **"Port 5000 already in use"** — change `PORT` in `backend/.env`, and update the Vite proxy in `frontend/vite.config.js` to match.
- **Frontend shows network errors** — make sure the backend is running *before* the frontend, since the dev server proxies API calls to it.
- **Want a clean database** — delete `backend/src/database/quizarena.db*` and restart the backend; it will reseed automatically.
- **Admin routes redirect you to /dashboard** — you're logged in as a student; log in with the admin account above.

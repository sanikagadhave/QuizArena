// src/api/index.js
// Thin wrapper functions per backend domain - mirrors the microservice
// boundaries on the backend (auth / quiz / attempt / leaderboard / admin).
import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data).then(r => r.data.data),
  login: (data) => client.post('/auth/login', data).then(r => r.data.data),
  me: () => client.get('/auth/me').then(r => r.data.data),
};

export const quizApi = {
  list: (params) => client.get('/quizzes', { params }).then(r => r.data.data),
  categories: () => client.get('/quizzes/categories').then(r => r.data.data),
  get: (id) => client.get(`/quizzes/${id}`).then(r => r.data.data),
  create: (data) => client.post('/quizzes', data).then(r => r.data.data),
  update: (id, data) => client.put(`/quizzes/${id}`, data).then(r => r.data.data),
  remove: (id) => client.delete(`/quizzes/${id}`).then(r => r.data.data),
};

export const attemptApi = {
  start: (quizId) => client.post('/attempts/start', { quizId }).then(r => r.data.data),
  submit: (id, answers) => client.post(`/attempts/${id}/submit`, { answers }).then(r => r.data.data),
  autoSubmit: (id, answers) => client.post(`/attempts/${id}/auto-submit`, { answers }).then(r => r.data.data),
  review: (id) => client.get(`/attempts/${id}/review`).then(r => r.data.data),
  history: () => client.get('/attempts/history').then(r => r.data.data),
  stats: () => client.get('/attempts/stats').then(r => r.data.data),
  inProgress: (quizId) => client.get(`/attempts/in-progress/${quizId}`).then(r => r.data.data),
};

export const leaderboardApi = {
  global: () => client.get('/leaderboard/global').then(r => r.data.data),
  forQuiz: (quizId) => client.get(`/leaderboard/quiz/${quizId}`).then(r => r.data.data),
};

export const adminApi = {
  overview: () => client.get('/admin/overview').then(r => r.data.data),
};

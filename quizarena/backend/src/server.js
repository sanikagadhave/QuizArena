// src/server.js
require('dotenv').config();
const app = require('./app');
const { seedIfEmpty } = require('./seed/seed');

const PORT = process.env.PORT || 5000;

seedIfEmpty();

app.listen(PORT, () => {
  console.log(`\n🚀 QuizArena API listening on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

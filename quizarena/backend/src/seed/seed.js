// src/seed/seed.js
// Seeds the database with a default admin, a couple of demo students, and
// realistic sample quizzes/questions so the app is usable immediately.
require('dotenv').config();
const { v4: uuid } = require('uuid');
const db = require('../config/db');
const { hashPassword } = require('../utils/password');

function seedIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount > 0) {
    console.log('ℹ️  Database already has data - skipping seed.');
    return;
  }
  console.log('🌱 Seeding database with sample data...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@quizarena.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const adminId = uuid();
  const student1Id = uuid();
  const student2Id = uuid();

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(adminId, 'Admin User', adminEmail.toLowerCase(), hashPassword(adminPassword), 'admin', '#6366f1');
  insertUser.run(student1Id, 'Aditi Sharma', 'aditi@student.com', hashPassword('Student@123'), 'student', '#ec4899');
  insertUser.run(student2Id, 'Rohan Verma', 'rohan@student.com', hashPassword('Student@123'), 'student', '#14b8a6');

  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (id, title, description, category, difficulty, duration_minutes, is_published, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, points, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  function addQuiz({ title, description, category, difficulty, duration, questions }) {
    const quizId = uuid();
    insertQuiz.run(quizId, title, description, category, difficulty, duration, adminId);
    questions.forEach((q, idx) => {
      insertQuestion.run(uuid(), quizId, q.q, q.options[0], q.options[1], q.options[2], q.options[3], q.correct, 1, idx);
    });
    return quizId;
  }

  const tx = db.transaction(() => {
    addQuiz({
      title: 'JavaScript Fundamentals',
      description: 'Test your core knowledge of JavaScript: variables, functions, scope, and more.',
      category: 'Programming',
      difficulty: 'Easy',
      duration: 10,
      questions: [
        { q: 'Which keyword declares a block-scoped variable in JavaScript?', options: ['var', 'let', 'define', 'const only'], correct: 'b' },
        { q: 'What does "===" check in JavaScript?', options: ['Value only', 'Type only', 'Value and type', 'Neither'], correct: 'c' },
        { q: 'Which method converts a JSON string into a JS object?', options: ['JSON.stringify()', 'JSON.parse()', 'Object.toJSON()', 'JSON.convert()'], correct: 'b' },
        { q: 'What is the output of typeof null?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correct: 'c' },
        { q: 'Which array method creates a new array with results of calling a function on every element?', options: ['forEach', 'map', 'filter', 'reduce'], correct: 'b' },
        { q: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function with access to its outer scope', 'A type of array', 'An error handler'], correct: 'b' },
        { q: 'Which of these is NOT a JavaScript data type?', options: ['Number', 'String', 'Float', 'Boolean'], correct: 'c' },
        { q: 'How do you write an arrow function that returns x + 1?', options: ['x => x + 1', 'function => x + 1', 'x -> x + 1', '(x) := x + 1'], correct: 'a' },
      ],
    });

    addQuiz({
      title: 'React.js Essentials',
      description: 'Hooks, components, props, and state management basics.',
      category: 'Programming',
      difficulty: 'Medium',
      duration: 12,
      questions: [
        { q: 'Which hook is used to manage state in a function component?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], correct: 'b' },
        { q: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extra'], correct: 'a' },
        { q: 'Which hook runs side effects after render?', options: ['useState', 'useCallback', 'useEffect', 'useContext'], correct: 'c' },
        { q: 'How do you pass data from parent to child component?', options: ['State', 'Props', 'Context only', 'Redux only'], correct: 'b' },
        { q: 'What is the virtual DOM?', options: ['A browser API', 'An in-memory representation of the real DOM', 'A CSS framework', 'A database'], correct: 'b' },
        { q: 'Which function is used to render a React app into the DOM (React 18)?', options: ['ReactDOM.render', 'createRoot().render', 'React.mount', 'App.render'], correct: 'b' },
      ],
    });

    addQuiz({
      title: 'Python Basics',
      description: 'A beginner-friendly quiz covering Python syntax and core concepts.',
      category: 'Programming',
      difficulty: 'Easy',
      duration: 8,
      questions: [
        { q: 'Which symbol is used for comments in Python?', options: ['//', '#', '/* */', '--'], correct: 'b' },
        { q: 'What is the correct file extension for Python files?', options: ['.py', '.python', '.pt', '.pyt'], correct: 'a' },
        { q: 'Which data structure is ordered and mutable in Python?', options: ['Tuple', 'Set', 'List', 'Frozenset'], correct: 'c' },
        { q: 'How do you define a function in Python?', options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'], correct: 'b' },
        { q: 'What does len() do?', options: ['Returns type', 'Returns length', 'Returns memory address', 'Returns list index'], correct: 'b' },
      ],
    });

    addQuiz({
      title: 'World Geography Challenge',
      description: 'Continents, capitals, rivers, and mountains from around the globe.',
      category: 'Geography',
      difficulty: 'Medium',
      duration: 10,
      questions: [
        { q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct: 'c' },
        { q: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 'b' },
        { q: 'Mount Kilimanjaro is located in which country?', options: ['Kenya', 'Tanzania', 'Uganda', 'Ethiopia'], correct: 'b' },
        { q: 'Which is the smallest country in the world by area?', options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], correct: 'c' },
        { q: 'The Sahara Desert is primarily located on which continent?', options: ['Asia', 'Africa', 'Australia', 'South America'], correct: 'b' },
        { q: 'Which country has the most time zones?', options: ['USA', 'Russia', 'China', 'France'], correct: 'd' },
      ],
    });

    addQuiz({
      title: 'General Science Quiz',
      description: 'Physics, chemistry, and biology basics for high school and college students.',
      category: 'Science',
      difficulty: 'Easy',
      duration: 10,
      questions: [
        { q: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 'c' },
        { q: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 'c' },
        { q: 'What force pulls objects toward the Earth?', options: ['Magnetism', 'Gravity', 'Friction', 'Tension'], correct: 'b' },
        { q: 'What gas do plants absorb from the atmosphere for photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 'c' },
        { q: 'How many bones are in the adult human body?', options: ['196', '206', '216', '226'], correct: 'b' },
        { q: 'What is the boiling point of water at sea level (°C)?', options: ['90', '95', '100', '110'], correct: 'c' },
        { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 'b' },
      ],
    });

    addQuiz({
      title: 'Advanced Algorithms & Data Structures',
      description: 'A challenging quiz on complexity analysis, trees, graphs and sorting algorithms.',
      category: 'Computer Science',
      difficulty: 'Hard',
      duration: 15,
      questions: [
        { q: 'What is the average time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correct: 'b' },
        { q: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Heap', 'Linked List'], correct: 'b' },
        { q: 'What is the worst-case time complexity of binary search?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], correct: 'c' },
        { q: 'Which traversal visits nodes level by level in a tree?', options: ['Preorder', 'Inorder', 'Postorder', 'BFS'], correct: 'd' },
        { q: 'A graph with no cycles and connected is called a?', options: ['Tree', 'Forest', 'Mesh', 'Loop'], correct: 'a' },
        { q: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correct: 'c' },
        { q: 'Which algorithm is used to find the shortest path in a weighted graph with non-negative edges?', options: ['DFS', 'BFS', "Dijkstra's", 'Bubble Sort'], correct: 'c' },
      ],
    });

    addQuiz({
      title: 'Modern History: 20th Century',
      description: 'World wars, independence movements, and major global events.',
      category: 'History',
      difficulty: 'Medium',
      duration: 10,
      questions: [
        { q: 'In which year did World War II end?', options: ['1943', '1945', '1947', '1950'], correct: 'b' },
        { q: 'India gained independence from British rule in which year?', options: ['1945', '1947', '1950', '1952'], correct: 'b' },
        { q: 'The Berlin Wall fell in which year?', options: ['1985', '1987', '1989', '1991'], correct: 'c' },
        { q: 'Who was the first President of the United States?', options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'], correct: 'b' },
        { q: 'The United Nations was founded in which year?', options: ['1943', '1945', '1948', '1950'], correct: 'b' },
      ],
    });

    addQuiz({
      title: 'Mathematics Aptitude',
      description: 'Algebra, geometry, and basic arithmetic reasoning.',
      category: 'Mathematics',
      difficulty: 'Easy',
      duration: 8,
      questions: [
        { q: 'What is the value of π (pi) rounded to 2 decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correct: 'b' },
        { q: 'Solve: 7 + 3 × 2 = ?', options: ['20', '13', '17', '10'], correct: 'b' },
        { q: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: 'c' },
        { q: 'A triangle has how many sides?', options: ['2', '3', '4', '5'], correct: 'b' },
        { q: 'What is 15% of 200?', options: ['20', '25', '30', '35'], correct: 'c' },
        { q: 'If x + 5 = 12, what is x?', options: ['5', '6', '7', '8'], correct: 'c' },
      ],
    });
  });

  tx();

  console.log('✅ Seed complete!');
  console.log(`   Admin login    -> ${adminEmail} / ${adminPassword}`);
  console.log('   Student login  -> aditi@student.com / Student@123');
  console.log('   Student login  -> rohan@student.com / Student@123');
}

// Allow running directly via `npm run seed`
if (require.main === module) {
  seedIfEmpty();
  process.exit(0);
}

module.exports = { seedIfEmpty };

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Ensure env variables are loaded

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const financeRoutes = require('./routes/financeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const examRoutes = require('./routes/examRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const routineRoutes = require('./routes/routineRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 2. Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/finance', financeRoutes);
app.use('/courses', courseRoutes);
app.use('/exams', examRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notices', noticeRoutes);
app.use('/routines', routineRoutes);

// Root Route
app.get('/', (req, res) => res.send('Asian School API Running 🚀'));

// 3. Error Handling (Catch-all for route errors)
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 4. Start Server
app.listen(PORT, () => {
  console.log('-----------------------------------');
  console.log(`🚀 ASIAN SCHOOL API IS ACTIVE`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log('-----------------------------------');
});
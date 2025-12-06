// 2. backend/index.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/auth', authRoutes); // Handles Login/Logout
app.use('/users', userRoutes); // Handles Create Student / Update Profile
app.use('/finance', financeRoutes);
app.use('/courses', courseRoutes);
app.use('/exams', examRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notices', noticeRoutes);
app.use('/routines', routineRoutes);

app.get('/', (req, res) => res.send('Asian School API Running 🚀'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
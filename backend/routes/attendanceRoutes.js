const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Teacher Routes
router.get('/sheet', attendanceController.getAttendanceSheet);
router.post('/submit', attendanceController.submitAttendance);

// Student Route
router.get('/student/:studentId', attendanceController.getStudentAttendance);

router.get('/report', attendanceController.getMonthlyReport);

module.exports = router;
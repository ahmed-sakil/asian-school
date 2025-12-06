const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// Admin Routes
router.post('/create', examController.createExam);

// Teacher Portal Routes
router.get('/subject/:subjectClassId', examController.getExamsBySubjectClass); // List exams
router.post('/create-direct', examController.createExamDirect); // Create new exam
router.get('/sheet/:assessmentId', examController.getMarksSheet); // View Marks Sheet
router.post('/marks', examController.submitMarks); // Save Marks

// Student Portal Routes
router.get('/student-subjects/:studentId', examController.getStudentSubjects); // Dropdown list
router.get('/live-result', examController.getLiveMarks); // Live View
router.get('/final-result', examController.getFinalResult); // Final View


module.exports = router;
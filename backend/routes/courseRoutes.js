const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Define Courses
router.post('/create', courseController.createCourse);
router.get('/all', courseController.getAllCourses);
router.put('/:id', courseController.updateCourse); // <--- New
router.delete('/:id', courseController.deleteCourse);

// Assign Logic
router.post('/assign', courseController.assignSubjectToSection);
router.get('/assignments', courseController.getAssignments);
router.get('/teacher/:teacherId', courseController.getTeacherAssignments);

module.exports = router;
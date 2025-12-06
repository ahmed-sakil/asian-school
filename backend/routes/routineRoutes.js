const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.post('/update', routineController.updateSlot);
router.get('/section', routineController.getSectionRoutine);
router.get('/teacher/:teacherId', routineController.getTeacherRoutine);
router.delete('/:id', routineController.deleteSlot);
router.get('/student/:studentId', routineController.getStudentRoutine); // <--- Add this

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); 

// --- PROTECTED ROUTES ---

// 1. Create Student
router.post('/students', protect, userController.createStudent); 

// 2. Get Student List
router.get('/students', protect, userController.getStudents);

// 3. Get Single Student Profile (By UUID)
router.get('/students/:id', protect, userController.getStudentById);

// 4. Lookup Student by School ID
router.get('/lookup/:schoolId', protect, userController.getStudentBySchoolId);

// 5. Get Teachers List (Dropdowns)
router.get('/teachers', protect, userController.getTeachers);

// 6. Update Profile
router.put('/profile/update', protect, userController.updateProfile);

// 👇 NEW: Staff Management Routes
router.get('/staff', protect, userController.getStaffList);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
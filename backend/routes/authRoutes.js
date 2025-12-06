const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you want to protect registration

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

// 👇 NEW: Staff Registration Route
// Note: In production, wrap this with 'protect' so only logged-in Admins can add staff
router.post('/register-staff', authController.registerStaff);

module.exports = router;
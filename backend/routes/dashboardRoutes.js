const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route: /dashboard/stats
router.get('/stats', dashboardController.getAdminStats);

module.exports = router;
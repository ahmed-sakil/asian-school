const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

// 1. Create Fee Structure
router.post('/create', protect, financeController.createFee);

// 2. Get Student Ledger (The missing link we need)
router.get('/ledger/:studentId', protect, financeController.getStudentLedger);

// 3. Collect Fee
router.post('/collect', protect, financeController.payFee);

// 4. List All Fees (For Fee Manager)
router.get('/list', protect, financeController.getAllFeeStructures);

// 5. Delete Fee
router.delete('/:id', protect, financeController.deleteFeeStructure);

// 6. Update Fee
router.put('/:id', protect, financeController.updateFeeStructure);

module.exports = router;
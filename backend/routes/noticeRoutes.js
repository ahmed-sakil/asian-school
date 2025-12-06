const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');

router.post('/create', noticeController.createNotice);
router.get('/all', noticeController.getNotices);
router.delete('/:id', noticeController.deleteNotice);

module.exports = router;
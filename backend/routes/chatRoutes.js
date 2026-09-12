const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.handleChat);
router.post('/stream', chatController.handleStreamChat);
router.get('/history', chatController.handleGetHistory);
router.post('/clear', chatController.handleClearChat);

module.exports = router;

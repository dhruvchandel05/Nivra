const express = require('express');
const chatbotController = require('../controllers/chatbot.controller');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/ask', requireAuth, chatbotController.ask);
router.get('/history', requireAuth, chatbotController.history);

module.exports = router;

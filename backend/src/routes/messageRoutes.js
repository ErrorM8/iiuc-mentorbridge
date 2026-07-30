const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversationList, getUnreadCount } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, sendMessage);
router.get('/conversations', authMiddleware, getConversationList);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/:userId', authMiddleware, getConversation);

module.exports = router;
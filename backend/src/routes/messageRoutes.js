const express = require('express');
const router = express.Router();
const { sendMessage, sendDirectMessage, getConversation, getConversationList, getUnreadCount, upload } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, upload.single('file'), sendMessage);
router.post('/send-direct', authMiddleware, sendDirectMessage);
router.get('/conversations', authMiddleware, getConversationList);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/:userId', authMiddleware, getConversation);

module.exports = router;
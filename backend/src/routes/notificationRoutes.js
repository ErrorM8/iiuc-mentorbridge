const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markOneRead, getUnreadCount } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.put('/mark-all-read', authMiddleware, markAllRead);
router.put('/:id/read', authMiddleware, markOneRead);

module.exports = router;
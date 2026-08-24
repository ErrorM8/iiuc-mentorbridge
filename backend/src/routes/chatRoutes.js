const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { chat } = require('../controllers/chatController');

router.post('/', authMiddleware, chat);

module.exports = router;
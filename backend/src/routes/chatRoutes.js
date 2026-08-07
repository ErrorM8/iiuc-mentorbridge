const express = require('express');
const router = express.Router();
const { chat, chatWithFile, upload } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, chat);
router.post('/file', authMiddleware, upload.single('file'), chatWithFile);

module.exports = router;
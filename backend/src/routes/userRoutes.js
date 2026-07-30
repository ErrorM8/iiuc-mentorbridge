const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateProfile, updateAvatar, removeAvatar, avatarUpload } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/profile', authMiddleware, updateProfile);
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), updateAvatar);
router.delete('/avatar', authMiddleware, removeAvatar);

module.exports = router;
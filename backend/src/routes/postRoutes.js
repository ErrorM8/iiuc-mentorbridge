const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, deletePost, editPost, toggleLike, getComments, addComment, reactToComment } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPost);
router.get('/', authMiddleware, getAllPosts);
router.delete('/:id', authMiddleware, deletePost);
router.put('/:id', authMiddleware, editPost);
router.post('/:id/like', authMiddleware, toggleLike);
router.get('/:id/comments', authMiddleware, getComments);
router.post('/:id/comments', authMiddleware, addComment);
router.post('/:id/comments/:commentId/react', authMiddleware, reactToComment);

module.exports = router;
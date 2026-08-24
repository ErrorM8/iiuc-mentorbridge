const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getItems, getMyItems, createItem, deleteItem, buyItem, markSold, upload } = require('../controllers/marketController');

router.get('/', authMiddleware, getItems);
router.get('/my', authMiddleware, getMyItems);
router.post('/', authMiddleware, upload.array('images', 5), createItem);
router.delete('/:id', authMiddleware, deleteItem);
router.post('/:id/buy', authMiddleware, buyItem);
router.put('/:id/sold', authMiddleware, markSold);

module.exports = router;
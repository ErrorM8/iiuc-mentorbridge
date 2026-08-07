const express = require('express');
const router = express.Router();
const { getItems, getMyItems, createItem, deleteItem, sendBuyRequest, markSold, upload } = require('../controllers/marketController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getItems);
router.get('/my', authMiddleware, getMyItems);
router.post('/', authMiddleware, upload.array('images', 5), createItem);
router.delete('/:id', authMiddleware, deleteItem);
router.post('/:id/buy', authMiddleware, sendBuyRequest);
router.put('/:id/sold', authMiddleware, markSold);

module.exports = router;
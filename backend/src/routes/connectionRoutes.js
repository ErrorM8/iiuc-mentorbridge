const express = require('express');
const router = express.Router();
const { sendRequest, cancelRequest, getMyRequests, updateRequest, disconnect, getConnectionStatus, getMyConnections } = require('../controllers/connectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send', authMiddleware, sendRequest);
router.post('/cancel', authMiddleware, cancelRequest);
router.get('/requests', authMiddleware, getMyRequests);
router.put('/:id', authMiddleware, updateRequest);
router.post('/disconnect', authMiddleware, disconnect);
router.get('/status/:userId', authMiddleware, getConnectionStatus);
router.get('/my', authMiddleware, getMyConnections);

module.exports = router;
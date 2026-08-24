const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getRequests,
  createRequest,
  deleteRequest,
  fulfillRequest,
  getDonors,
  getMyDonorProfile,
  registerDonor,
} = require('../controllers/bloodController');

router.get('/requests', authMiddleware, getRequests);
router.post('/requests', authMiddleware, createRequest);
router.delete('/requests/:id', authMiddleware, deleteRequest);
router.put('/requests/:id/fulfill', authMiddleware, fulfillRequest);
router.get('/donors', authMiddleware, getDonors);
router.get('/donors/me', authMiddleware, getMyDonorProfile);
router.post('/donors', authMiddleware, registerDonor);

module.exports = router;
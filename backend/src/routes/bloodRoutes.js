const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getRequests, createRequest, deleteRequest, markFulfilled, getDonors, registerDonor, getMyDonorProfile } = require('../controllers/bloodController');

router.get('/requests', auth, getRequests);
router.post('/requests', auth, createRequest);
router.delete('/requests/:id', auth, deleteRequest);
router.put('/requests/:id/fulfill', auth, markFulfilled);

router.get('/donors', auth, getDonors);
router.get('/donors/me', auth, getMyDonorProfile);
router.post('/donors', auth, registerDonor);

module.exports = router;
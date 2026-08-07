const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, googleLogin, forgotPassword, verifyResetOTP, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
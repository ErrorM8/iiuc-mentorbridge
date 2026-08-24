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
router.post('/google-complete', async (req, res) => {
  try {
    const {
      googleId, email, name, avatar,
      batch, department, role, studentId,
      bloodGroup, gender, bio, skills,
    } = req.body;

    if (!googleId || !email || !department || !batch) {
      return res.status(400).json({
        message: 'Department and batch are required to complete registration',
      });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const token = jwt.sign({ userId: existing.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Account already exists',
        token,
        user: {
          id: existing.id, name: existing.name, email: existing.email,
          role: existing.role, avatar: existing.avatar || null,
          department: existing.department, batch: existing.batch,
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name, email, password: '',
        googleId, avatar: avatar || null,
        emailVerified: true,
        batch: batch || '',
        department: department || '',
        role: role || 'junior',
        studentId: studentId || null,
        bloodGroup: bloodGroup || null,
        bio: bio || null,
        skills: skills || null,
        gender: gender || 'male',
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Registration complete! Welcome to MentorBridge.',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar || null,
        department: user.department, batch: user.batch,
      },
    });
  } catch (error) {
    console.error('Google complete error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
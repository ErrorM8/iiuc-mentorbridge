const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let nodemailer;
let transporter;
try {
  nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
} catch (e) { console.log('Nodemailer not available'); }

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp, type = 'verify') => {
  if (!transporter) return;
  const subject = type === 'verify' ? 'Verify Your IIUC MentorBridge Account' : 'Reset Your Password — IIUC MentorBridge';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1a2018;color:white;padding:30px;border-radius:12px;">
      <h2 style="color:#22c55e;">🌳 IIUC MentorBridge</h2>
      <p style="color:rgba(255,255,255,0.7);">${type === 'verify' ? 'Please verify your email.' : 'Password reset requested.'}</p>
      <div style="background:#0f3d2e;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
        <p style="color:rgba(255,255,255,0.5);margin:0 0 8px;">Your OTP Code</p>
        <h1 style="color:#22c55e;font-size:2.5rem;letter-spacing:8px;margin:0;">${otp}</h1>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:8px 0 0;">Expires in 10 minutes</p>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `IIUC MentorBridge <${process.env.EMAIL_USER}>`, to: email, subject, html });
};

const register = async (req, res) => {
  try {
    const { name, email, password, batch, department, role, studentId, bloodGroup, bio, skills, gender } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: { verificationOTP: otp, verificationExpiry: expiry }
      });
    } else {
      user = await prisma.user.create({
        data: {
          name, email, password: hashedPassword,
          batch: batch || '', department: department || '', role: role || 'junior',
          studentId: studentId || null, bloodGroup: bloodGroup || null,
          bio: bio || null, skills: skills || null, gender: gender || 'male',
          emailVerified: false, verificationOTP: otp, verificationExpiry: expiry,
        }
      });
    }

    try {
      await sendOTP(email, otp, 'verify');
      return res.status(201).json({ message: 'OTP sent to your email', needsVerification: true, email });
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
      await prisma.user.update({ where: { email }, data: { emailVerified: true, verificationOTP: null, verificationExpiry: null } });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Registered successfully',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, department: user.department, batch: user.batch }
      });
    }
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ message: 'Already verified', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null } });
    }
    if (user.verificationOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.verificationExpiry) return res.status(400).json({ message: 'OTP expired. Please register again.' });

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, verificationOTP: null, verificationExpiry: null }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Email verified successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, department: user.department, batch: user.batch }
    });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'This account uses Google login. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.emailVerified) {
      try {
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.user.update({ where: { email }, data: { verificationOTP: otp, verificationExpiry: expiry } });
        await sendOTP(email, otp, 'verify');
        return res.status(403).json({ message: 'Email not verified. OTP sent.', needsVerification: true, email });
      } catch (emailErr) {
        console.error('Email failed, auto-verifying:', emailErr.message);
        await prisma.user.update({ where: { email }, data: { emailVerified: true } });
      }
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, department: user.department, batch: user.batch }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Update google info if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, emailVerified: true, avatar: user.avatar || picture }
        });
      }
    } else {
      // New user via Google — create with basic info
      user = await prisma.user.create({
        data: {
          name, email, password: '',
          googleId, avatar: picture,
          emailVerified: true,
          batch: '', department: '', role: 'junior',
        }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Google login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, department: user.department, batch: user.batch },
      isNewUser: !user.department || !user.batch
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({ where: { email }, data: { resetToken: otp, resetExpiry: expiry } });

    try {
      await sendOTP(email, otp, 'reset');
      res.json({ message: 'OTP sent to your email', email });
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
      res.status(500).json({ message: 'Email service not configured. Please contact admin.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetToken !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.resetExpiry) return res.status(400).json({ message: 'OTP expired' });
    res.json({ message: 'OTP verified', email });
  } catch (error) {
    console.error('Verify reset error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetToken !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > user.resetExpiry) return res.status(400).json({ message: 'OTP expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetExpiry: null }
    });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, verifyEmail, login, googleLogin, forgotPassword, verifyResetOTP, resetPassword };
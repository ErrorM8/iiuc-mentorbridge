const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

let googleClient = null;
try {
  const { OAuth2Client } = require('google-auth-library');
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} catch (e) {}

// ============ EMAIL SETUP ============
// ============ EMAIL SETUP ============
const { Resend } = require('resend');
let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend email service ready');
} else {
  console.log('⚠️ Resend API key not configured');
}

const sendOTPEmail = async (email, otp, type = 'verify') => {
  if (!resend) throw new Error('EMAIL_NOT_CONFIGURED');

  const subject = type === 'verify'
    ? 'Verify Your IIUC MentorBridge Account'
    : 'Reset Your Password — IIUC MentorBridge';

  await resend.emails.send({
    from: 'MentorBridge <onboarding@resend.dev>',
    to: email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#1a2018;color:white;padding:32px;border-radius:14px;">
        <h2 style="color:#22c55e;">MentorBridge</h2>
        <p style="color:rgba(255,255,255,0.7);">
          ${type === 'verify' ? 'Enter this OTP to verify your email:' : 'Enter this OTP to reset your password:'}
        </p>
        <div style="background:#0f3d2e;border-radius:12px;padding:28px;text-align:center;margin:20px 0;">
          <h1 style="color:#22c55e;font-size:48px;letter-spacing:14px;margin:0;">${otp}</h1>
          <p style="color:rgba(255,255,255,0.4);margin:10px 0 0;">Expires in 10 minutes</p>
        </div>
      </div>
    `
  });
};

// ============ REGISTER ============
const register = async (req, res) => {
  try {
    const {
      name, email, password, batch, department,
      role, studentId, bloodGroup, bio, skills, gender,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    if (!resend) {
      return res.status(503).json({
        message: 'Email verification service is not available. Please contact admin.',
        error: 'EMAIL_NOT_CONFIGURED',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.pendingRegistration.upsert({
      where: { email },
      update: {
        name, passwordHash,
        batch: batch || '',
        department: department || '',
        role: role || 'junior',
        studentId: studentId || null,
        bloodGroup: bloodGroup || null,
        bio: bio || null,
        skills: skills || null,
        gender: gender || 'male',
        otp, otpExpiry,
        createdAt: new Date(),
      },
      create: {
        name, email, passwordHash,
        batch: batch || '',
        department: department || '',
        role: role || 'junior',
        studentId: studentId || null,
        bloodGroup: bloodGroup || null,
        bio: bio || null,
        skills: skills || null,
        gender: gender || 'male',
        otp, otpExpiry,
      },
    });

    try {
      await sendOTPEmail(email, otp, 'verify');
      console.log(`✅ OTP sent to ${email}`);
      return res.status(201).json({
        message: 'OTP sent to your email. Please verify to create your account.',
        needsVerification: true,
        email,
      });
    } catch (emailErr) {
      console.error('❌ Email failed:', emailErr.message);
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      return res.status(500).json({
        message: 'Failed to send verification email. Please check your email address and try again.',
        error: 'EMAIL_SEND_FAILED',
      });
    }
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ VERIFY EMAIL ============
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });

    if (!pending) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({
          message: 'This email is already verified. Please login.',
          alreadyVerified: true,
        });
      }
      return res.status(404).json({
        message: 'No pending registration found. Please register again.',
      });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    if (new Date() > pending.otpExpiry) {
      return res.status(400).json({
        message: 'OTP has expired. Please register again to get a new code.',
        expired: true,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.passwordHash,
        batch: pending.batch,
        department: pending.department,
        role: pending.role,
        studentId: pending.studentId,
        bloodGroup: pending.bloodGroup,
        bio: pending.bio,
        skills: pending.skills,
        gender: pending.gender,
        emailVerified: true,
      },
    });

    await prisma.pendingRegistration.delete({ where: { email } });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: '✅ Email verified! Welcome to MentorBridge.',
      token,
      user: {
        id: newUser.id, name: newUser.name, email: newUser.email,
        role: newUser.role, avatar: newUser.avatar || null,
        department: newUser.department, batch: newUser.batch,
      },
    });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ LOGIN ============
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
      if (pending) {
        return res.status(403).json({
          message: 'Your email is not verified yet. Please complete OTP verification first.',
          needsVerification: true,
          email,
        });
      }
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google login. Please sign in with Google.',
      });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar || null,
        department: user.department, batch: user.batch,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GOOGLE LOGIN ============
const googleLogin = async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ message: 'Google login not configured' });
    }
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, emailVerified: true, avatar: user.avatar || picture },
        });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Google login successful',
        token,
        user: {
          id: user.id, name: user.name, email: user.email,
          role: user.role, avatar: user.avatar || null,
          department: user.department, batch: user.batch,
        },
        isNewUser: false,
      });
    }

    return res.status(200).json({
      message: 'Complete your registration',
      isNewUser: true,
      googleData: { googleId, email, name, avatar: picture },
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

// ============ GOOGLE COMPLETE ============
const googleComplete = async (req, res) => {
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
};

// ============ FORGOT PASSWORD ============
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    if (!resend) {
      return res.status(503).json({
        message: 'Email service not configured.',
      });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({ where: { email }, data: { resetToken: otp, resetExpiry: expiry } });

    try {
      await sendOTPEmail(email, otp, 'reset');
      res.json({ message: 'OTP sent to your email', email });
    } catch (emailErr) {
      console.error('Forgot password email failed:', emailErr.message);
      res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ VERIFY RESET OTP ============
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resetToken || user.resetToken !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (new Date() > user.resetExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    res.json({ message: 'OTP verified', email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ RESET PASSWORD ============
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resetToken || user.resetToken !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (new Date() > user.resetExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetExpiry: null },
    });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register, verifyEmail, login, googleLogin, googleComplete,
  forgotPassword, verifyResetOTP, resetPassword,
};
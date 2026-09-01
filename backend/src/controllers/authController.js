const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

let googleClient = null;
try {
  const { OAuth2Client } = require('google-auth-library');
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} catch (e) {}

// ============ EMAIL SETUP ============
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER.includes('@') &&
    !process.env.EMAIL_USER.startsWith('actual_gmail')
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: false, // Port 587 এর জন্য false হতে হবে
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // <-- Render-এর IPv6 বাইপাস করার আসল ফিক্স
      tls: {
        rejectUnauthorized: false
      }
    });
    transporter.verify((err) => {
      if (err) {
        console.log('⚠️ Email config error:', err.message);
        transporter = null;
      } else {
        console.log('✅ Email service ready:', process.env.EMAIL_USER);
      }
    });
  } else {
    console.log('⚠️ Email not configured — registration will be blocked');
  }
} catch (e) {
  console.log('⚠️ Nodemailer error:', e.message);
}

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, type = 'verify') => {
  if (!transporter) throw new Error('EMAIL_NOT_CONFIGURED');
  const subject =
    type === 'verify'
      ? '🌳 Verify Your IIUC MentorBridge Account'
      : '🔒 Reset Your Password — IIUC MentorBridge';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;
      background:#1a2018;color:white;padding:32px;border-radius:14px;
      border:1px solid rgba(34,197,94,0.2)">
      <div style="margin-bottom:24px">
        <div style="color:#22c55e;font-weight:800;font-size:20px">🌳 MentorBridge</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px">IIUC Student Hub</div>
      </div>
      <h2 style="color:white;font-size:20px;margin-bottom:8px">
        ${type === 'verify' ? 'Verify Your Email Address' : 'Reset Your Password'}
      </h2>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin-bottom:24px;line-height:1.6">
        ${
          type === 'verify'
            ? 'Enter this OTP to verify your email and create your MentorBridge account.'
            : 'Enter this OTP to reset your password.'
        }
      </p>
      <div style="background:#0f3d2e;border-radius:12px;padding:28px;
        text-align:center;margin:20px 0;border:1px solid rgba(34,197,94,0.3)">
        <p style="color:rgba(255,255,255,0.4);margin:0 0 10px;font-size:13px;
          text-transform:uppercase;letter-spacing:0.1em">Your OTP Code</p>
        <h1 style="color:#22c55e;font-size:48px;letter-spacing:14px;margin:0;font-weight:800">
          ${otp}
        </h1>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:12px 0 0">
          ⏱ Expires in 10 minutes
        </p>
      </div>
      <p style="color:rgba(255,255,255,0.25);font-size:12px;text-align:center;
        margin-top:20px;line-height:1.6">
        If you did not request this, please ignore this email.<br/>
        Do not share this OTP with anyone.
      </p>
    </div>
  `;
  await transporter.sendMail({
    from: `IIUC MentorBridge <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

// ============================================================
// REGISTER — stores in PendingRegistration, NOT in User table
// ============================================================
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

    // Block if email already has a verified account
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // Block if email service not configured
    if (!transporter) {
      return res.status(503).json({
        message:
          'Email verification service is not available. ' +
          'Please contact admin to enable registration.',
        error: 'EMAIL_NOT_CONFIGURED',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Upsert PendingRegistration (update if same email resends)
    await prisma.pendingRegistration.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        batch: batch || '',
        department: department || '',
        role: role || 'junior',
        studentId: studentId || null,
        bloodGroup: bloodGroup || null,
        bio: bio || null,
        skills: skills || null,
        gender: gender || 'male',
        otp,
        otpExpiry,
        createdAt: new Date(),
      },
      create: {
        name,
        email,
        passwordHash,
        batch: batch || '',
        department: department || '',
        role: role || 'junior',
        studentId: studentId || null,
        bloodGroup: bloodGroup || null,
        bio: bio || null,
        skills: skills || null,
        gender: gender || 'male',
        otp,
        otpExpiry,
      },
    });

    // Send OTP — REQUIRED to proceed
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
      // Delete the pending record since we couldn't send OTP
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      return res.status(500).json({
        message:
          'Failed to send verification email. Please check your email address and try again.',
        error: 'EMAIL_SEND_FAILED',
      });
    }
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================
// VERIFY EMAIL — creates User only after correct OTP
// ============================================================
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find pending registration (NOT in User table)
    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });

    if (!pending) {
      // Check if already verified
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

    // Check OTP
    if (pending.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Check expiry
    if (new Date() > pending.otpExpiry) {
      return res.status(400).json({
        message: 'OTP has expired. Please register again to get a new code.',
        expired: true,
      });
    }

    // ✅ OTP correct & not expired — NOW create the User
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

    // Delete pending record
    await prisma.pendingRegistration.delete({ where: { email } });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log(`✅ User created after OTP verify: ${email}`);

    res.json({
      message: '✅ Email verified! Welcome to MentorBridge.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar || null,
        department: newUser.department,
        batch: newUser.batch,
      },
    });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================
// LOGIN — normal, no OTP required
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Check if they have a pending (unverified) registration
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

    // User exists in User table = already verified, just login
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        department: user.department,
        batch: user.batch,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================
// GOOGLE LOGIN
// ============================================================
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

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Existing user — just login
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

    // NEW user — don't create account yet, return temp data
    // They must complete registration form first
    return res.status(200).json({
      message: 'Complete your registration',
      isNewUser: true,
      googleData: {
        googleId,
        email,
        name,
        avatar: picture,
      },
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    if (!transporter) {
      return res.status(503).json({
        message: 'Email service not configured. Cannot send reset OTP.',
      });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { email },
      data: { resetToken: otp, resetExpiry: expiry },
    });

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

// ============================================================
// VERIFY RESET OTP
// ============================================================
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

// ============================================================
// RESET PASSWORD
// ============================================================
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
  register, verifyEmail, login, googleLogin,
  forgotPassword, verifyResetOTP, resetPassword,
};
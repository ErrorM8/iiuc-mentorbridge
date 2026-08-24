const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Verify user actually exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, emailVerified: true }
    });

    if (!user) {
      return res.status(401).json({
        message: 'User not found. Please login again.',
        code: 'USER_NOT_FOUND'
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
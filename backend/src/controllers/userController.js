const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const avatarUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

const getAllUsers = async (req, res) => {
  try {
    const { department, batch, role } = req.query;
    const filters = {};
    if (department) filters.department = { contains: department, mode: 'insensitive' };
    if (batch) filters.batch = { contains: batch, mode: 'insensitive' };
    if (role) filters.role = role;

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true, name: true, email: true, batch: true,
        department: true, role: true, bio: true, skills: true,
        avatar: true, createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, name: true, email: true, batch: true,
        department: true, role: true, bio: true, skills: true,
        avatar: true, bloodGroup: true, gender: true, studentId: true,
        createdAt: true,
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, department, batch, bloodGroup, gender, studentId, bloodNotifications } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (department !== undefined) updateData.department = department;
    if (batch !== undefined) updateData.batch = batch;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (gender !== undefined) updateData.gender = gender;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (bloodNotifications !== undefined) updateData.bloodNotifications = bloodNotifications;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        department: true, batch: true, bio: true, skills: true,
        bloodGroup: true, gender: true, studentId: true,
        bloodNotifications: true, createdAt: true
      }
    });
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'mentorbridge/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
        (error, result) => { if (error) reject(error); else resolve(result); }
      ).end(req.file.buffer);
    });

    // Delete old avatar from Cloudinary
    const oldUser = await prisma.user.findUnique({ where: { id: req.userId }, select: { avatar: true } });
    if (oldUser?.avatar && oldUser.avatar.includes('cloudinary')) {
      try {
        const urlParts = oldUser.avatar.split('/');
        const publicId = `mentorbridge/avatars/${urlParts[urlParts.length - 1].split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) { console.log('Old avatar delete skipped'); }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: result.secure_url },
      select: { id: true, name: true, avatar: true }
    });

    res.json({ message: 'Avatar updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeAvatar = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: null },
      select: { id: true, name: true, avatar: true }
    });
    res.json({ message: 'Avatar removed', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, updateAvatar, removeAvatar, avatarUpload };
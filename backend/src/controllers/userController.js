const prisma = require('../prismaClient');

// Get all users
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
        id: true,
        name: true,
        email: true,
        batch: true,
        department: true,
        role: true,
        bio: true,
        skills: true,
        createdAt: true,
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        batch: true,
        department: true,
        role: true,
        bio: true,
        skills: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, batch, department } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, bio, skills, batch, department },
      select: {
        id: true,
        name: true,
        email: true,
        batch: true,
        department: true,
        role: true,
        bio: true,
        skills: true,
      }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile };
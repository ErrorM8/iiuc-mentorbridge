const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'test') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI ready for resources');
  }
} catch (e) {
  console.log('⚠️ Gemini not available:', e.message);
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  },
});

const DEFAULT_DEPARTMENTS = [
  'CSE', 'CCE', 'EEE', 'ETE', 'Civil Engineering', 'Pharmacy',
  'BBA', 'MBA', 'English', 'Arabic', 'LIS', 'Law',
  'Economics & Banking', 'QSIS', 'DIS', 'SHIS',
];

// ==================== GET DEPARTMENTS (auto-seed) ====================
const getDepartments = async (req, res) => {
  try {
    let departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });

    if (departments.length === 0) {
      console.log('🌱 Departments empty — seeding defaults...');
      for (const name of DEFAULT_DEPARTMENTS) {
        try {
          await prisma.department.upsert({
            where: { name },
            update: {},
            create: { name },
          });
        } catch (e) {
          console.error('Seed failed for', name, e.message);
        }
      }
      departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    }

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GET COURSES ====================
const getCourses = async (req, res) => {
  try {
    const { departmentId, examType } = req.query;
    const where = {};
    if (departmentId) where.departmentId = parseInt(departmentId);

    if (examType) {
      try {
        const courses = await prisma.course.findMany({
          where: { ...where, examType },
          orderBy: { name: 'asc' },
        });
        return res.json(courses);
      } catch (e) {
        console.log('examType filter failed, returning all:', e.message);
      }
    }

    const courses = await prisma.course.findMany({ where, orderBy: { name: 'asc' } });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== CREATE COURSE (folder) ====================
const createCourse = async (req, res) => {
  try {
    const { name, code, departmentId, examType } = req.body;
    if (!name || !departmentId) {
      return res.status(400).json({ message: 'Name and departmentId required' });
    }

    const dept = await prisma.department.findUnique({ where: { id: parseInt(departmentId) } });
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    try {
      const existing = await prisma.course.findFirst({
        where: { name, departmentId: parseInt(departmentId), examType: examType || null },
      });
      if (existing) return res.status(400).json({ message: 'Course folder already exists' });
    } catch {}

    let course;
    try {
      course = await prisma.course.create({
        data: {
          name,
          code: code || null,
          departmentId: parseInt(departmentId),
          examType: examType || null,
        },
      });
    } catch (e) {
      course = await prisma.course.create({
        data: { name, code: code || null, departmentId: parseInt(departmentId) },
      });
    }

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GET RESOURCES ====================
const getResources = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = {};
    if (courseId) where.courseId = parseInt(courseId);

    const resources = await prisma.resource.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== SEARCH ====================
const searchResources = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);

    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { course: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== UPLOAD ====================
const uploadResource = async (req, res) => {
  try {
    const { title, courseId } = req.body;
    if (!title || !courseId) return res.status(400).json({ message: 'Title and courseId required' });
    if (!req.file) return res.status(400).json({ message: 'PDF file required' });

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'mentorbridge/resources', format: 'pdf' },
        (error, result) => { if (error) reject(error); else resolve(result); }
      ).end(req.file.buffer);
    });

    const resource = await prisma.resource.create({
      data: {
        title,
        fileUrl: uploadResult.secure_url,
        fileType: 'pdf',
        courseId: parseInt(courseId),
        userId: req.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== AI SUMMARY ====================
const getSummary = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { title: true, fileUrl: true },
    });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (!genAI) {
      return res.json({
        summary: `📄 ${resource.title}\n\nAI summary unavailable. Please configure GEMINI_API_KEY.`,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are an academic assistant for IIUC students. The document title is: "${resource.title}". Based on the title, write a helpful 150-200 word academic summary: what it likely covers, key topics to focus on, and study tips.`;
    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ summary: 'Failed to generate AI summary. Please try again.' });
  }
};

// ==================== DELETE ====================
const deleteResource = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    await prisma.resource.delete({ where: { id: resource.id } });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDepartments, getCourses, createCourse, getResources,
  searchResources, uploadResource, getSummary, deleteResource, upload,
};
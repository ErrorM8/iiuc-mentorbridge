const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Groq = require('groq-sdk');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  }
});

// Auto AI Analysis after upload
const analyzeWithAI = async (buffer, title, courseCode) => {
  try {
    let text = `Document: ${title} for course ${courseCode}`;
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      text = pdfData.text.slice(0, 3000);
    } catch (e) { console.log('PDF parse skipped'); }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an academic assistant for IIUC students. Analyze this document for course ${courseCode} and provide a structured summary that can help students understand the material.`
        },
        {
          role: 'user',
          content: `Analyze this academic document titled "${title}" and provide:\n1. Brief Summary\n2. Key Topics Covered\n3. Important Points to Remember\n4. Study Tips\n\nContent:\n${text}`
        }
      ],
      max_tokens: 800,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    return 'AI analysis not available for this document.';
  }
};

// Get departments
const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get courses
const getCourses = async (req, res) => {
  try {
    const { departmentId, examType } = req.query;
    const courses = await prisma.course.findMany({
      where: { departmentId: parseInt(departmentId) },
      include: {
        _count: { select: { resources: { where: { examType } } } }
      },
      orderBy: { code: 'asc' }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create course
const createCourse = async (req, res) => {
  try {
    const { code, name, departmentId } = req.body;
    const existing = await prisma.course.findFirst({
      where: { code: code.toUpperCase(), departmentId: parseInt(departmentId) }
    });
    if (existing) return res.status(400).json({ message: `Course ${code.toUpperCase()} already exists in this department` });

    const course = await prisma.course.create({
      data: { code: code.toUpperCase(), name: name || code.toUpperCase(), departmentId: parseInt(departmentId) }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get resources
const getResources = async (req, res) => {
  try {
    const { courseId, examType } = req.query;
    const resources = await prisma.resource.findMany({
      where: { courseId: parseInt(courseId), examType },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload resource (auto AI analysis)
const uploadResource = async (req, res) => {
  try {
    const { courseId, examType, title } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Get course info for AI context
    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: `mentorbridge/${examType}` },
        (error, result) => { if (error) reject(error); else resolve(result); }
      ).end(req.file.buffer);
    });

    // Auto AI Analysis
    const aiSummary = await analyzeWithAI(req.file.buffer, title, course?.code || '');

    const resource = await prisma.resource.create({
      data: {
        title,
        fileUrl: uploadResult.secure_url,
        fileType: 'pdf',
        examType,
        aiSummary,
        courseId: parseInt(courseId),
        userId: req.userId
      },
      include: { user: { select: { id: true, name: true } } }
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get AI summary of a resource
const getResourceSummary = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { course: true }
    });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ summary: resource.aiSummary, title: resource.title, course: resource.course?.code });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete resource (only uploader)
const deleteResource = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    try {
      const urlParts = resource.fileUrl.split('/');
      const publicId = `mentorbridge/${resource.examType}/${urlParts[urlParts.length - 1]}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (e) { console.log('Cloudinary delete skipped'); }

    await prisma.resource.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search resources by course (for AI Mentor)
const searchResourcesByCourse = async (req, res) => {
  try {
    const { query } = req.query;
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { course: { code: { contains: query, mode: 'insensitive' } } },
          { course: { name: { contains: query, mode: 'insensitive' } } },
          { title: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        course: { include: { department: true } },
        user: { select: { name: true } }
      },
      take: 5
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Init departments
const initDepartments = async (req, res) => {
  try {
    const departments = [
      'CSE', 'CCE', 'EEE', 'ETE', 'Civil Engineering', 'Pharmacy',
      'BBA', 'MBA', 'English', 'Arabic', 'LIS', 'Law', 'Economics'
    ];
    for (const name of departments) {
      await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
    }
    res.json({ message: 'Departments initialized' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDepartments, getCourses, createCourse, getResources,
  uploadResource, getResourceSummary, deleteResource,
  searchResourcesByCourse, initDepartments, upload
};
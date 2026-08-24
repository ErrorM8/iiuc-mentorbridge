const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getDepartments, getCourses, createCourse,
  getResources, searchResources, uploadResource,
  getSummary, deleteResource, upload,
} = require('../controllers/resourceController');

router.get('/departments', authMiddleware, getDepartments);
router.get('/courses', authMiddleware, getCourses);
router.post('/courses', authMiddleware, createCourse);
router.get('/search', authMiddleware, searchResources);
router.get('/', authMiddleware, getResources);
router.post('/upload', authMiddleware, upload.single('file'), uploadResource);
router.get('/:id/summary', authMiddleware, getSummary);
router.delete('/:id', authMiddleware, deleteResource);

// Seed departments — run once
router.post('/seed-departments', authMiddleware, async (req, res) => {
  try {
    const departments = [
      'CSE','CCE','EEE','ETE','Civil Engineering','Pharmacy',
      'BBA','MBA','English','Arabic','LIS','Law',
      'Economics & Banking','QSIS','DIS','SHIS'
    ];
    for (const name of departments) {
      await prisma.department.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
    res.json({ message: '✅ Departments seeded!', count: departments.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getDepartments, getCourses, createCourse, getResources,
  uploadResource, getResourceSummary, deleteResource,
  searchResourcesByCourse, initDepartments, upload
} = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/departments', authMiddleware, getDepartments);
router.post('/departments/init', authMiddleware, initDepartments);
router.get('/courses', authMiddleware, getCourses);
router.post('/courses', authMiddleware, createCourse);
router.get('/search', authMiddleware, searchResourcesByCourse);
router.get('/', authMiddleware, getResources);
router.post('/upload', authMiddleware, upload.single('file'), uploadResource);
router.get('/:id/summary', authMiddleware, getResourceSummary);
router.delete('/:id', authMiddleware, deleteResource);

module.exports = router;
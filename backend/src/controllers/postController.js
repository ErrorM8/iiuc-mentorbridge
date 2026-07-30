const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

const createPost = async (req, res) => {
  try {
    const { content, type } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'mentorbridge/posts' },
            (error, result) => { if (error) reject(error); else resolve(result); }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const post = await prisma.post.create({
      data: {
        content: content || '',
        type: type || 'general',
        userId: req.userId,
        images: { create: imageUrls.map(url => ({ url })) }
      },
      include: {
        user: { select: { id: true, name: true, department: true, batch: true, avatar: true } },
        images: true,
        _count: { select: { likes: true, comments: true } }
      }
    });

    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, department: true, batch: true, avatar: true } },
        images: true,
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } }
      }
    });

    const total = await prisma.post.count();
    res.json({ posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { images: true }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    for (const img of post.images) {
      try {
        const urlParts = img.url.split('/');
        const publicId = `mentorbridge/posts/${urlParts[urlParts.length - 1].split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) { console.log('Image delete skipped'); }
    }

    await prisma.postImage.deleteMany({ where: { postId: parseInt(req.params.id) } });
    await prisma.like.deleteMany({ where: { postId: parseInt(req.params.id) } });
    await prisma.comment.deleteMany({ where: { postId: parseInt(req.params.id) } });
    await prisma.post.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const editPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    const updated = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: { content },
      include: {
        user: { select: { id: true, name: true, department: true, batch: true, avatar: true } },
        images: true,
        _count: { select: { likes: true, comments: true } }
      }
    });
    res.json({ message: 'Post updated', post: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: req.userId, postId } }
    });
    if (existing) {
      await prisma.like.delete({ where: { userId_postId: { userId: req.userId, postId } } });
      const count = await prisma.like.count({ where: { postId } });
      res.json({ liked: false, count });
    } else {
      await prisma.like.create({ data: { userId: req.userId, postId } });
      const count = await prisma.like.count({ where: { postId } });
      res.json({ liked: true, count });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(req.params.id), parentId: null },
      include: {
        user: { select: { id: true, name: true, department: true, batch: true, avatar: true } },
        reactions: true,
        replies: {
          include: {
            user: { select: { id: true, name: true, department: true, batch: true, avatar: true } },
            reactions: true,
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.userId,
        postId: parseInt(req.params.id),
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        user: { select: { id: true, name: true, department: true, batch: true, avatar: true } },
        reactions: true,
        replies: []
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reactToComment = async (req, res) => {
  try {
    const { emoji } = req.body;
    const commentId = parseInt(req.params.commentId);
    const existing = await prisma.commentReaction.findUnique({
      where: { userId_commentId: { userId: req.userId, commentId } }
    });
    if (existing) {
      if (existing.emoji === emoji) {
        await prisma.commentReaction.delete({ where: { userId_commentId: { userId: req.userId, commentId } } });
        return res.json({ removed: true });
      }
      const updated = await prisma.commentReaction.update({
        where: { userId_commentId: { userId: req.userId, commentId } },
        data: { emoji }
      });
      return res.json(updated);
    }
    const reaction = await prisma.commentReaction.create({
      data: { userId: req.userId, commentId, emoji }
    });
    res.json(reaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPost, getAllPosts, deletePost, editPost,
  toggleLike, getComments, addComment, reactToComment,
  uploadMiddleware
};
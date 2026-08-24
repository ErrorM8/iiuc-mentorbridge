const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const uploadToCloudinary = (buffer, folder) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    { resource_type: 'image', folder },
    (error, result) => { if (error) reject(error); else resolve(result); }
  ).end(buffer);
});

// Safe notification creator
const createNotif = async (data) => {
  try {
    if (data.userId === data.senderId) return; // Don't notify self
    await prisma.notification.create({ data });
  } catch (err) {
    console.error('Notif create failed (non-critical):', err.message);
  }
};

// ==================== GET ALL POSTS ====================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id:true, name:true, avatar:true, department:true, batch:true, role:true } },
        images: true,
        likes: { select: { userId:true } },
        _count: { select: { likes:true, comments:true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== CREATE POST ====================
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Content or images required' });
    }

    const post = await prisma.post.create({
      data: {
        content: content || null,
        type: type || 'general',
        userId: req.userId,
      }
    });

    if (req.files && req.files.length > 0) {
      try {
        const uploads = await Promise.all(
          req.files.map(f => uploadToCloudinary(f.buffer, 'mentorbridge/posts'))
        );
        await prisma.postImage.createMany({
          data: uploads.map(r => ({ url: r.secure_url, postId: post.id }))
        });
      } catch (imgErr) {
        console.error('Image upload failed:', imgErr.message);
      }
    }

    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        user: { select: { id:true, name:true, avatar:true, department:true, batch:true, role:true } },
        images: true,
        likes: { select: { userId:true } },
        _count: { select: { likes:true, comments:true } }
      }
    });

    res.status(201).json({ post: fullPost });
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== UPDATE POST ====================
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    const updated = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: { content },
      include: {
        user: { select: { id:true, name:true, avatar:true } },
        images: true,
        _count: { select: { likes:true, comments:true } }
      }
    });
    res.json({ post: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== DELETE POST ====================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    await prisma.commentReaction.deleteMany({ where: { comment: { postId: post.id } } });
    await prisma.comment.deleteMany({ where: { postId: post.id } });
    await prisma.like.deleteMany({ where: { postId: post.id } });
    await prisma.postImage.deleteMany({ where: { postId: post.id } });
    await prisma.notification.deleteMany({
      where: { OR: [
        { type:'like', message: { contains: post.id.toString() } },
        { type:'comment', message: { contains: post.id.toString() } }
      ]}
    });
    await prisma.post.delete({ where: { id: post.id } });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== TOGGLE LIKE ====================
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const existing = await prisma.like.findFirst({ where: { postId, userId: req.userId } });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { postId, userId: req.userId } });

      // Send notification to post owner
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId:true, content:true }
      });
      if (post && post.userId !== req.userId) {
        const liker = await prisma.user.findUnique({
          where: { id: req.userId }, select: { name:true }
        });
        await createNotif({
          userId: post.userId,
          senderId: req.userId,
          type: 'like',
          message: `${liker?.name} liked your post: "${post.content?.slice(0, 50) || 'photo'}"`
        });
      }
    }

    const count = await prisma.like.count({ where: { postId } });
    res.json({ liked: !existing, count });
  } catch (error) {
    console.error('Like error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== GET LIKES ====================
router.get('/:id/likes', authMiddleware, async (req, res) => {
  try {
    const likes = await prisma.like.findMany({
      where: { postId: parseInt(req.params.id) },
    });
    // Fetch users separately to avoid relation issues
    const likesWithUsers = await Promise.all(
      likes.map(async (like) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: like.userId },
            select: { id:true, name:true, avatar:true, department:true, batch:true }
          });
          return { ...like, user };
        } catch { return { ...like, user: null }; }
      })
    );
    res.json(likesWithUsers.filter(l => l.user));
  } catch (error) {
    console.error('Get likes error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== GET COMMENTS ====================
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(req.params.id), parentId: null },
      include: {
        user: { select: { id:true, name:true, avatar:true } },
        reactions: true,
        replies: {
          include: {
            user: { select: { id:true, name:true, avatar:true } },
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
});

// ==================== ADD COMMENT ====================
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content required' });

    const postId = parseInt(req.params.id);

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.userId,
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
        user: { select: { id:true, name:true, avatar:true } },
        reactions: true,
        replies: []
      }
    });

    // Notify post owner
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId:true, content:true }
    });

    if (post && post.userId !== req.userId) {
      const commenter = await prisma.user.findUnique({
        where: { id: req.userId }, select: { name:true }
      });
      await createNotif({
        userId: post.userId,
        senderId: req.userId,
        type: 'comment',
        message: `${commenter?.name} commented on your post: "${content.slice(0, 60)}"`
      });
    }

    // If reply — notify parent comment owner
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        select: { userId:true }
      });
      if (parentComment && parentComment.userId !== req.userId) {
        const replier = await prisma.user.findUnique({
          where: { id: req.userId }, select: { name:true }
        });
        await createNotif({
          userId: parentComment.userId,
          senderId: req.userId,
          type: 'comment',
          message: `${replier?.name} replied to your comment: "${content.slice(0, 60)}"`
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== REACT TO COMMENT ====================
router.post('/:id/comments/:commentId/react', authMiddleware, async (req, res) => {
  try {
    const { emoji } = req.body;
    const commentId = parseInt(req.params.commentId);

    const existing = await prisma.commentReaction.findFirst({
      where: { commentId, userId: req.userId }
    });

    if (existing) {
      if (existing.emoji === emoji) {
        await prisma.commentReaction.delete({ where: { id: existing.id } });
        return res.json({ removed: true, emoji });
      }
      const updated = await prisma.commentReaction.update({
        where: { id: existing.id },
        data: { emoji }
      });
      return res.json({ removed: false, reaction: updated });
    }

    const reaction = await prisma.commentReaction.create({
      data: { commentId, userId: req.userId, emoji }
    });

    // Notify comment owner
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId:true, content:true }
    });
    if (comment && comment.userId !== req.userId) {
      const reactor = await prisma.user.findUnique({
        where: { id: req.userId }, select: { name:true }
      });
      await createNotif({
        userId: comment.userId,
        senderId: req.userId,
        type: 'like',
        message: `${reactor?.name} reacted ${emoji} to your comment: "${comment.content?.slice(0, 50)}"`
      });
    }

    res.json({ removed: false, reaction });
  } catch (error) {
    console.error('React error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
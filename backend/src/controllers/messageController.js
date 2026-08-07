const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const isPdf = req.file.mimetype === 'application/pdf';
      const resourceType = isVideo ? 'video' : isPdf ? 'raw' : 'image';
      const folder = `mentorbridge/messages/${isVideo ? 'videos' : isPdf ? 'files' : 'images'}`;
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(req.file.buffer);
      });
      fileUrl = result.secure_url;
      fileType = req.file.mimetype.startsWith('video/') ? 'video' : isPdf ? 'pdf' : 'image';
    }

    if (!content && !fileUrl) return res.status(400).json({ message: 'Message or file required' });

    const message = await prisma.message.create({
      data: {
        content: content || null,
        fileUrl, fileType,
        senderId: req.userId,
        receiverId: parseInt(receiverId)
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Direct message — no connection required (for Blood Bank)
const sendDirectMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message required' });

    const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiverId) }, select: { id: true, name: true } });
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.userId,
        receiverId: parseInt(receiverId)
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: req.userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.message.updateMany({
      where: { senderId: parseInt(userId), receiverId: req.userId, read: false },
      data: { read: true }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getConversationList = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.userId }, { receiverId: req.userId }]
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const conversations = new Map();
    messages.forEach(msg => {
      const otherId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === req.userId ? msg.receiver : msg.sender;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, {
          user: otherUser,
          lastMessage: msg,
          unread: msg.receiverId === req.userId && !msg.read ? 1 : 0
        });
      } else {
        if (msg.receiverId === req.userId && !msg.read) conversations.get(otherId).unread++;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({ where: { receiverId: req.userId, read: false } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendMessage, sendDirectMessage, getConversation, getConversationList, getUnreadCount, upload };
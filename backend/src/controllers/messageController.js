const prisma = require('../prismaClient');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await prisma.message.create({
      data: { content, senderId: req.userId, receiverId: parseInt(receiverId) },
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
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
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
        const conv = conversations.get(otherId);
        if (msg.receiverId === req.userId && !msg.read) conv.unread++;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { receiverId: req.userId, read: false }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendMessage, getConversation, getConversationList, getUnreadCount };
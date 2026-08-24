const prisma = require('../prismaClient');

const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
    if (req.userId === parseInt(receiverId)) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId } }),
      prisma.user.findUnique({ where: { id: parseInt(receiverId) } }),
    ]);
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.connection.deleteMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: req.userId }
        ],
        status: 'rejected'
      }
    });

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: req.userId }
        ]
      }
    });
    if (existing) {
      return res.status(400).json({ message: 'Connection already exists', status: existing.status });
    }

    const connection = await prisma.connection.create({
      data: { senderId: req.userId, receiverId: parseInt(receiverId) }
    });

    try {
      await prisma.notification.create({
        data: {
          userId: parseInt(receiverId),
          senderId: req.userId,
          type: 'connection_request',
          message: `${sender.name} sent you a connection request`
        }
      });
    } catch (e) { console.error('Notification failed:', e.message); }

    res.status(201).json({ message: 'Request sent', connection });
  } catch (error) {
    console.error('Send request error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    await prisma.connection.deleteMany({
      where: { senderId: req.userId, receiverId: parseInt(receiverId), status: 'pending' }
    });
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await prisma.connection.findMany({
      where: { receiverId: req.userId, status: 'pending' },
      include: {
        sender: { select: { id:true, name:true, department:true, batch:true, role:true, avatar:true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await prisma.connection.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        sender: { select: { id:true, name:true, avatar:true } },
        receiver: { select: { id:true, name:true, avatar:true } }
      }
    });

    if (status === 'accepted') {
      try {
        await prisma.notification.create({
          data: {
            userId: connection.senderId,
            senderId: connection.receiverId,
            type: 'connection_accepted',
            message: `${connection.receiver.name} accepted your connection request`
          }
        });
      } catch (e) { console.error('Notification failed:', e.message); }
    }

    res.json({ message: `Request ${status}`, connection });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const disconnect = async (req, res) => {
  try {
    const { userId } = req.body;
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: req.userId }
        ]
      }
    });
    res.json({ message: 'Disconnected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: req.userId }
        ]
      }
    });
    if (!connection) return res.json({ status: 'none' });
    if (connection.status === 'accepted') return res.json({ status: 'connected', connectionId: connection.id });
    if (connection.status === 'rejected') return res.json({ status: 'none' });
    if (connection.senderId === req.userId) return res.json({ status: 'sent', connectionId: connection.id });
    return res.json({ status: 'received', connectionId: connection.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyConnections = async (req, res) => {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: req.userId, status: 'accepted' },
          { receiverId: req.userId, status: 'accepted' }
        ]
      },
      include: {
        sender: { select: { id:true, name:true, department:true, batch:true, avatar:true, role:true } },
        receiver: { select: { id:true, name:true, department:true, batch:true, avatar:true, role:true } }
      }
    });
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendRequest, cancelRequest, getMyRequests, updateRequest,
  disconnect, getConnectionStatus, getMyConnections
};
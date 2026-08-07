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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

const getItems = async (req, res) => {
  try {
    const { category, condition, search } = req.query;
    const where = { status: 'available' };
    if (category && category !== 'all') where.category = category;
    if (condition && condition !== 'all') where.condition = condition;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const items = await prisma.marketItem.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true, department: true } },
        images: true,
        _count: { select: { buyRequests: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await prisma.marketItem.findMany({
      where: { userId: req.userId },
      include: {
        images: true,
        buyRequests: {
          include: { buyer: { select: { id: true, name: true, avatar: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { title, description, price, condition, category } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'mentorbridge/market' },
            (error, result) => { if (error) reject(error); else resolve(result); }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const item = await prisma.marketItem.create({
      data: {
        title, description,
        price: parseFloat(price),
        condition, category,
        userId: req.userId,
        images: { create: imageUrls.map(url => ({ url })) }
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        images: true,
        _count: { select: { buyRequests: true } }
      }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await prisma.marketItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    await prisma.marketItemImage.deleteMany({ where: { itemId: parseInt(req.params.id) } });
    await prisma.buyRequest.deleteMany({ where: { itemId: parseInt(req.params.id) } });
    await prisma.marketItem.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendBuyRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const itemId = parseInt(req.params.id);

    const item = await prisma.marketItem.findUnique({
      where: { id: itemId },
      include: {
        user: { select: { id: true, name: true } },
        images: true
      }
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId === req.userId) return res.status(400).json({ message: 'Cannot buy your own item' });

    const existing = await prisma.buyRequest.findFirst({
      where: { itemId, buyerId: req.userId }
    });
    if (existing) return res.status(400).json({ message: 'Already sent a request' });

    const request = await prisma.buyRequest.create({
      data: { itemId, buyerId: req.userId, message },
      include: { buyer: { select: { id: true, name: true, avatar: true } } }
    });

    const buyer = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true }
    });

    // Auto message to seller with item details
    const autoMsg = `Hi! I want to buy your item:\n\n📦 ${item.title}\n💰 Price: ৳${item.price}\n📋 Condition: ${item.condition}${message ? `\n\n💬 "${message}"` : ''}\n\nCan we discuss this?`;

    await prisma.message.create({
      data: {
        content: autoMsg,
        senderId: req.userId,
        receiverId: item.userId
      }
    });

    // Notification to seller
    await prisma.notification.create({
      data: {
        userId: item.userId,
        senderId: req.userId,
        type: 'buy_request',
        message: `${buyer.name} wants to buy your "${item.title}" — check messages!`
      }
    });

    res.status(201).json({ ...request, sellerId: item.userId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markSold = async (req, res) => {
  try {
    const item = await prisma.marketItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    await prisma.marketItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'sold' }
    });
    res.json({ message: 'Marked as sold' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getItems, getMyItems, createItem, deleteItem, sendBuyRequest, markSold, upload };
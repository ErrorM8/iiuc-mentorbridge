const prisma = require('../prismaClient');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const addSellerToItem = async (item) => {
  try {
    const sellerId = item.userId;
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { id:true, name:true, avatar:true, department:true }
    });
    const images = await prisma.marketItemImage.findMany({ where: { itemId: item.id } });
    return { ...item, seller, sellerId, images };
  } catch { return { ...item, seller: null, images: [] }; }
};

const getItems = async (req, res) => {
  try {
    const items = await prisma.marketItem.findMany({ orderBy: { createdAt: 'desc' } });
    const result = await Promise.all(items.map(addSellerToItem));
    res.json(result);
  } catch (error) {
    console.error('Get items error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await prisma.marketItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    const result = await Promise.all(items.map(addSellerToItem));
    res.json(result);
  } catch (error) {
    console.error('Get my items error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { title, description, price, category, condition } = req.body;
    if (!title || !price) return res.status(400).json({ message: 'Title and price required' });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = await prisma.marketItem.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        category: category || 'Other',
        condition: condition || null,
        user: { connect: { id: req.userId } },
      }
    });

    if (req.files && req.files.length > 0) {
      try {
        const uploads = await Promise.all(
          req.files.map(file => new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { resource_type:'image', folder:'mentorbridge/market' },
              (err, result) => { if (err) reject(err); else resolve(result); }
            ).end(file.buffer);
          }))
        );
        await prisma.marketItemImage.createMany({
          data: uploads.map(r => ({ url: r.secure_url, itemId: item.id }))
        });
      } catch (imgErr) {
        console.error('Image upload failed:', imgErr.message);
      }
    }

    const fullItem = await addSellerToItem(item);
    res.status(201).json(fullItem);
  } catch (error) {
    console.error('Create item error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await prisma.marketItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    try { await prisma.buyRequest.deleteMany({ where: { itemId: item.id } }); } catch {}
    try { await prisma.marketItemImage.deleteMany({ where: { itemId: item.id } }); } catch {}
    await prisma.marketItem.delete({ where: { id: item.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const buyItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const item = await prisma.marketItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId === req.userId) return res.status(400).json({ message: 'Cannot buy your own item' });
    if (item.status === 'sold') return res.status(400).json({ message: 'Item already sold' });

    try { await prisma.buyRequest.create({ data: { itemId, buyerId: req.userId } }); } catch {}

    const buyer = await prisma.user.findUnique({ where: { id: req.userId }, select: { name:true } });

    try {
      await prisma.message.create({
        data: {
          content: `Hi! I'm interested in buying "${item.title}" (৳${item.price}). Is it still available?`,
          senderId: req.userId,
          receiverId: item.userId,
        }
      });
    } catch (e) { console.error('Auto-message failed:', e.message); }

    try {
      await prisma.notification.create({
        data: {
          userId: item.userId,
          senderId: req.userId,
          type: 'buy_request',
          message: `${buyer?.name} wants to buy "${item.title}" (৳${item.price}). Check your messages!`
        }
      });
    } catch (e) { console.error('Notification failed:', e.message); }

    res.json({ message: 'Buy request sent', sellerId: item.userId });
  } catch (error) {
    console.error('Buy error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markSold = async (req, res) => {
  try {
    const item = await prisma.marketItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    const updated = await prisma.marketItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'sold' }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getItems, getMyItems, createItem, deleteItem, buyItem, markSold, upload };
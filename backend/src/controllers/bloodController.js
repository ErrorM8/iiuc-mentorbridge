const prisma = require('../prismaClient');

// Blood Requests
const getRequests = async (req, res) => {
  try {
    const { bloodGroup } = req.query;
    const where = {};
    if (bloodGroup && bloodGroup !== 'all') where.bloodGroup = bloodGroup;

    const requests = await prisma.bloodRequest.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatar: true, department: true } } },
      orderBy: [{ urgent: 'desc' }, { createdAt: 'desc' }]
    });

    // Sort: active first, fulfilled at bottom
    const sorted = [
      ...requests.filter(r => r.status !== 'fulfilled'),
      ...requests.filter(r => r.status === 'fulfilled')
    ];

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { bloodGroup, patientName, hospital, location, contact, details, urgent } = req.body;

    const request = await prisma.bloodRequest.create({
      data: {
        bloodGroup, patientName, hospital, location, contact,
        details: details || null,
        urgent: urgent === 'true' || urgent === true,
        userId: req.userId
      },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });

    // Send notification to matching blood group donors
    const matchingDonors = await prisma.bloodDonor.findMany({
      where: { bloodGroup, available: true, userId: { not: req.userId } },
      select: { userId: true }
    });

    // Also notify users with matching blood group in profile
    const matchingUsers = await prisma.user.findMany({
      where: { bloodGroup, id: { not: req.userId } },
      select: { id: true }
    });

    const allIds = new Set([
      ...matchingDonors.map(d => d.userId),
      ...matchingUsers.map(u => u.id)
    ]);

    const requester = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });

    const notifications = Array.from(allIds).map(userId => ({
      userId,
      senderId: req.userId,
      type: 'blood_request',
      message: `🩸 ${urgent ? 'URGENT! ' : ''}${bloodGroup} blood needed at ${hospital}, ${location}. Posted by ${requester.name}. Click to view details.`
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    res.status(201).json({ ...request, notifiedCount: allIds.size });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const request = await prisma.bloodRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    await prisma.bloodRequest.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markFulfilled = async (req, res) => {
  try {
    const request = await prisma.bloodRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    await prisma.bloodRequest.update({ where: { id: parseInt(req.params.id) }, data: { status: 'fulfilled' } });
    res.json({ message: 'Marked as fulfilled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Blood Donors
const getDonors = async (req, res) => {
  try {
    const { bloodGroup, location } = req.query;
    const where = { available: true };
    if (bloodGroup && bloodGroup !== 'all') where.bloodGroup = bloodGroup;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    const donors = await prisma.bloodDonor.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatar: true, department: true, batch: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const registerDonor = async (req, res) => {
  try {
    const { bloodGroup, location, whatsapp, lastDonationDate, available } = req.body;
    const existing = await prisma.bloodDonor.findUnique({ where: { userId: req.userId } });

    const data = {
      bloodGroup, location, whatsapp,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      available: available !== false && available !== 'false',
      userId: req.userId
    };

    let donor;
    if (existing) {
      donor = await prisma.bloodDonor.update({
        where: { userId: req.userId }, data,
        include: { user: { select: { id: true, name: true, avatar: true } } }
      });
    } else {
      donor = await prisma.bloodDonor.create({
        data,
        include: { user: { select: { id: true, name: true, avatar: true } } }
      });
    }
    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyDonorProfile = async (req, res) => {
  try {
    const donor = await prisma.bloodDonor.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
    res.json(donor || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getRequests, createRequest, deleteRequest, markFulfilled, getDonors, registerDonor, getMyDonorProfile };
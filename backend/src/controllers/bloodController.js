const prisma = require('../prismaClient');

const getRequests = async (req, res) => {
  try {
    const { bloodGroup } = req.query;
    const where = {};
    if (bloodGroup && bloodGroup !== 'all') where.bloodGroup = bloodGroup;

    const requests = await prisma.bloodRequest.findMany({
      where,
      include: {
        user: { select: { id:true, name:true, avatar:true, department:true, batch:true } }
      },
      orderBy: [
        { status: 'asc' },
        { urgent: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(requests);
  } catch (error) {
    console.error('Get blood requests error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { bloodGroup, patientName, hospital, location, contact, details, urgent } = req.body;

    if (!bloodGroup || !patientName || !hospital || !location || !contact) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please login again.' });
    }

    const request = await prisma.bloodRequest.create({
      data: {
        bloodGroup, patientName, hospital, location, contact,
        details: details || null,
        urgent: urgent || false,
        userId: req.userId,
      },
      include: {
        user: { select: { id:true, name:true, avatar:true, department:true } }
      }
    });

    let notifiedCount = 0;
    try {
      const matchingUsers = await prisma.user.findMany({
        where: {
          bloodGroup,
          id: { not: req.userId },
          bloodNotifications: true
        },
        select: { id: true }
      });

      if (matchingUsers.length > 0) {
        await prisma.notification.createMany({
          data: matchingUsers.map(u => ({
            userId: u.id,
            senderId: req.userId,
            type: 'blood_request',
            message: `🩸 Urgent! ${bloodGroup} blood needed at ${hospital}, ${location}. Patient: ${patientName}. Contact: ${contact}`
          })),
          skipDuplicates: true,
        });
        notifiedCount = matchingUsers.length;
      }
    } catch (notifErr) {
      console.error('Blood notification failed:', notifErr.message);
    }

    res.status(201).json({ ...request, notifiedCount });
  } catch (error) {
    console.error('Create blood request error:', error.message);
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

const fulfillRequest = async (req, res) => {
  try {
    const request = await prisma.bloodRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    const updated = await prisma.bloodRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'fulfilled' }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDonors = async (req, res) => {
  try {
    const { bloodGroup, location } = req.query;
    const where = {};
    if (bloodGroup && bloodGroup !== 'all') where.bloodGroup = bloodGroup;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const donors = await prisma.bloodDonor.findMany({
      where,
      include: {
        user: { select: { id:true, name:true, avatar:true, department:true, batch:true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyDonorProfile = async (req, res) => {
  try {
    const donor = await prisma.bloodDonor.findFirst({
      where: { userId: req.userId }
    });
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const registerDonor = async (req, res) => {
  try {
    const { bloodGroup, location, whatsapp, lastDonationDate, available } = req.body;

    if (!bloodGroup || !location || !whatsapp) {
      return res.status(400).json({ message: 'Blood group, location and WhatsApp required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = await prisma.bloodDonor.findFirst({ where: { userId: req.userId } });

    let donor;
    if (existing) {
      donor = await prisma.bloodDonor.update({
        where: { id: existing.id },
        data: {
          bloodGroup,
          location,
          whatsapp,
          available: available !== undefined ? available : true,
          lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
        }
      });
    } else {
      donor = await prisma.bloodDonor.create({
        data: {
          bloodGroup,
          location,
          whatsapp,
          available: available !== undefined ? available : true,
          lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
          userId: req.userId,
        }
      });

      // Update user bloodGroup too
      await prisma.user.update({
        where: { id: req.userId },
        data: { bloodGroup }
      });
    }

    res.json(donor);
  } catch (error) {
    console.error('Register donor error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getRequests, createRequest, deleteRequest, fulfillRequest,
  getDonors, getMyDonorProfile, registerDonor
};
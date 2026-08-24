const prisma = require('../src/prismaClient');

async function cleanDB() {
  try { await prisma.bloodRequest.deleteMany(); } catch(e) {}
  try { await prisma.bloodDonor.deleteMany(); } catch(e) {}
  try { await prisma.buyRequest.deleteMany(); } catch(e) {}
  try { await prisma.marketItemImage.deleteMany(); } catch(e) {}
  try { await prisma.marketItem.deleteMany(); } catch(e) {}
  try { await prisma.resource.deleteMany(); } catch(e) {}
  try { await prisma.notification.deleteMany(); } catch(e) {}
  try { await prisma.message.deleteMany(); } catch(e) {}
  try { await prisma.commentReaction.deleteMany(); } catch(e) {}
  try { await prisma.comment.deleteMany(); } catch(e) {}
  try { await prisma.like.deleteMany(); } catch(e) {}
  try { await prisma.postImage.deleteMany(); } catch(e) {}
  try { await prisma.post.deleteMany(); } catch(e) {}
  try { await prisma.connection.deleteMany(); } catch(e) {}
  try { await prisma.pendingRegistration.deleteMany(); } catch(e) {}
  try { await prisma.user.deleteMany(); } catch(e) {}
}

module.exports = { cleanDB };
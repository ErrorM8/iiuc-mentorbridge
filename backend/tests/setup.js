const prisma = require('../src/prismaClient');

async function cleanDB() {
  await prisma.bloodRequest.deleteMany();
  await prisma.bloodDonor.deleteMany();
  await prisma.buyRequest.deleteMany();
  await prisma.marketItemImage.deleteMany();
  await prisma.marketItem.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.commentReaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.user.deleteMany();
}

module.exports = { cleanDB };
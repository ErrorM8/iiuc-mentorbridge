const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

const SECRET = 'mentorbridge_secret_key_2024';
let token, user1, user2;

beforeEach(async () => {
  await cleanDB();
  user1 = await prisma.user.create({ data: { name:'N1', email:'n1@g.com', password: await bcrypt.hash('p',10), batch:'57', department:'CSE', role:'junior', emailVerified:true } });
  user2 = await prisma.user.create({ data: { name:'N2', email:'n2@g.com', password: await bcrypt.hash('p',10), batch:'57', department:'CSE', role:'senior', emailVerified:true } });
  token = jwt.sign({ userId: user1.id }, SECRET, { expiresIn: '1d' });
  await prisma.notification.create({
    data: { userId: user1.id, senderId: user2.id, type: 'connection_request', message: 'Test notif', read: false }
  });
});

afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

describe('Notifications', () => {
  test('✅ Should get notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('✅ Should get unread count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test('✅ Should mark all as read', async () => {
    await request(app)
      .put('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.count).toBe(0);
  });

  test('✅ Should mark single notification as read', async () => {
    const notif = await prisma.notification.findFirst({ where: { userId: user1.id } });
    const res = await request(app)
      .put(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('❌ Should fail without token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});
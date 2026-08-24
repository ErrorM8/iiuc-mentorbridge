const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

const SECRET = process.env.JWT_SECRET || 'mentorbridge_secret_key_2024';
let token, user1, user2, notifId;

beforeAll(async () => { await cleanDB(); });
afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

beforeEach(async () => {
  await cleanDB();
  user1 = await prisma.user.create({
    data: { name: 'Notif User 1', email: 'notif1@test.com', password: await bcrypt.hash('p', 10), batch: '57', department: 'CSE', role: 'junior', emailVerified: true }
  });
  user2 = await prisma.user.create({
    data: { name: 'Notif User 2', email: 'notif2@test.com', password: await bcrypt.hash('p', 10), batch: '57', department: 'CSE', role: 'senior', emailVerified: true }
  });
  token = jwt.sign({ userId: user1.id }, SECRET, { expiresIn: '1d' });
  const notif = await prisma.notification.create({
    data: { userId: user1.id, senderId: user2.id, type: 'connection_request', message: 'Test notif', read: false }
  });
  notifId = notif.id;
});

describe('Notifications', () => {
  test('✅ get notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].type).toBe('connection_request');
  });

  test('✅ get unread count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test('✅ mark single notification as read', async () => {
    await request(app)
      .put(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.count).toBe(0);
  });

  test('✅ mark all notifications as read', async () => {
    await prisma.notification.create({
      data: { userId: user1.id, senderId: user2.id, type: 'like', message: 'Test 2', read: false }
    });
    await request(app)
      .put('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.count).toBe(0);
  });

  test('✅ like creates notification for post owner', async () => {
    const post = await prisma.post.create({
      data: { content: 'Like notify', type: 'general', userId: user1.id }
    });
    const t2 = jwt.sign({ userId: user2.id }, SECRET, { expiresIn: '1d' });
    await request(app)
      .post(`/api/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${t2}`);
    const notif = await prisma.notification.findFirst({
      where: { userId: user1.id, senderId: user2.id, type: 'like' }
    });
    expect(notif).not.toBeNull();
  });

  test('✅ comment creates notification for post owner', async () => {
    const post = await prisma.post.create({
      data: { content: 'Comment notify', type: 'general', userId: user1.id }
    });
    const t2 = jwt.sign({ userId: user2.id }, SECRET, { expiresIn: '1d' });
    await request(app)
      .post(`/api/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${t2}`)
      .send({ content: 'Nice!' });
    const notif = await prisma.notification.findFirst({
      where: { userId: user1.id, senderId: user2.id, type: 'comment' }
    });
    expect(notif).not.toBeNull();
  });

  test('❌ no auth token → 401', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

const SECRET = 'mentorbridge_secret_key_2024';
let token1, token2, user1, user2;

beforeEach(async () => {
  await cleanDB();
  user1 = await prisma.user.create({ data: { name:'User A', email:'a@g.com', password: await bcrypt.hash('p', 10), batch:'57', department:'CSE', role:'junior', emailVerified:true } });
  user2 = await prisma.user.create({ data: { name:'User B', email:'b@g.com', password: await bcrypt.hash('p', 10), batch:'57', department:'CSE', role:'senior', emailVerified:true } });
  token1 = jwt.sign({ userId: user1.id }, SECRET, { expiresIn: '1d' });
  token2 = jwt.sign({ userId: user2.id }, SECRET, { expiresIn: '1d' });
});

afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

describe('Connections', () => {
  test('✅ Should send connection request', async () => {
    const res = await request(app)
      .post('/api/connections/send')
      .set('Authorization', `Bearer ${token1}`)
      .send({ receiverId: user2.id });
    expect(res.status).toBe(201);
    expect(res.body.connection.status).toBe('pending');
  });

  test('❌ Should not send request to self', async () => {
    const res = await request(app)
      .post('/api/connections/send')
      .set('Authorization', `Bearer ${token1}`)
      .send({ receiverId: user1.id });
    expect(res.status).toBe(400);
  });

  test('✅ Should accept connection request', async () => {
    const conn = await prisma.connection.create({ data: { senderId: user1.id, receiverId: user2.id, status: 'pending' } });
    const res = await request(app)
      .put(`/api/connections/${conn.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ status: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.connection.status).toBe('accepted');
  });

  test('✅ Should get connection status — none', async () => {
    const res = await request(app)
      .get(`/api/connections/status/${user2.id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('none');
  });

  test('✅ Should cancel sent request', async () => {
    await prisma.connection.create({ data: { senderId: user1.id, receiverId: user2.id, status: 'pending' } });
    const res = await request(app)
      .post('/api/connections/cancel')
      .set('Authorization', `Bearer ${token1}`)
      .send({ receiverId: user2.id });
    expect(res.status).toBe(200);
  });

  test('✅ Should disconnect', async () => {
    await prisma.connection.create({ data: { senderId: user1.id, receiverId: user2.id, status: 'accepted' } });
    const res = await request(app)
      .post('/api/connections/disconnect')
      .set('Authorization', `Bearer ${token1}`)
      .send({ userId: user2.id });
    expect(res.status).toBe(200);
  });

  test('✅ Should get my connections', async () => {
    await prisma.connection.create({ data: { senderId: user1.id, receiverId: user2.id, status: 'accepted' } });
    const res = await request(app)
      .get('/api/connections/my')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});
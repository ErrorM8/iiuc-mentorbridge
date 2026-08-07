const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

const SECRET = 'mentorbridge_secret_key_2024';
let token, user;

beforeEach(async () => {
  await cleanDB();
  user = await prisma.user.create({
    data: { name:'Test', email:'t@g.com', password: await bcrypt.hash('p', 10), batch:'57', department:'CSE', role:'junior', emailVerified:true }
  });
  token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1d' });
});

afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

describe('Users', () => {
  test('✅ Should get all users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('✅ Should get user by ID', async () => {
    const res = await request(app).get(`/api/users/${user.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('t@g.com');
  });

  test('✅ Should update profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', bio: 'My bio' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
  });

  test('❌ Should return 404 for invalid user ID', async () => {
    const res = await request(app).get('/api/users/99999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('❌ Should fail without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('✅ Should filter users by department', async () => {
    await prisma.user.create({
      data: { name:'EEE User', email:'eee@g.com', password: await bcrypt.hash('p', 10), batch:'57', department:'EEE', role:'junior', emailVerified:true }
    });
    const res = await request(app)
      .get('/api/users?department=CSE')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.forEach(u => expect(u.department).toBe('CSE'));
  });
});
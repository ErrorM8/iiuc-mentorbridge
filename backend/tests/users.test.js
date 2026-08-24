const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

const SECRET = process.env.JWT_SECRET || 'mentorbridge_secret_key_2024';
let token, user;

beforeAll(async () => { await cleanDB(); });
afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

beforeEach(async () => {
  await cleanDB();
  user = await prisma.user.create({
    data: { name: 'Test User', email: 'test@test.com', password: await bcrypt.hash('pass123', 10), batch: '57', department: 'CSE', role: 'junior', emailVerified: true }
  });
  token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1d' });
});

describe('Users', () => {
  test('✅ get all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('✅ get user by ID', async () => {
    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
    expect(res.body).not.toHaveProperty('password');
  });

  test('✅ update profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', bio: 'My bio text', skills: 'React, Node' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
    expect(res.body.user.bio).toBe('My bio text');
  });

  test('✅ update blood group', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bloodGroup: 'B+' });
    expect(res.status).toBe(200);
    expect(res.body.user.bloodGroup).toBe('B+');
  });

  test('❌ get non-existent user → 404', async () => {
    const res = await request(app)
      .get('/api/users/9999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('❌ no auth token → 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('✅ filter users by role', async () => {
    await prisma.user.create({
      data: { name: 'Senior', email: 'senior@test.com', password: await bcrypt.hash('p', 10), batch: '50', department: 'CSE', role: 'senior', emailVerified: true }
    });
    const res = await request(app)
      .get('/api/users?role=senior')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.forEach(u => expect(u.role).toBe('senior'));
  });
});
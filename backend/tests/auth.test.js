const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

beforeEach(async () => { await cleanDB(); });
afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

describe('Auth — Register', () => {
  test('✅ Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User', email: 'test@gmail.com',
        password: 'password123', batch: '57',
        department: 'CSE', role: 'junior', gender: 'male'
      });
    expect([200, 201]).toContain(res.status);
  });

  test('❌ Should fail with duplicate verified email', async () => {
    await prisma.user.create({
      data: {
        name: 'Existing', email: 'exist@gmail.com',
        password: 'hashed', batch: '57',
        department: 'CSE', role: 'junior', emailVerified: true
      }
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New', email: 'exist@gmail.com', password: '123456', batch: '57', department: 'CSE', role: 'junior' });
    expect(res.status).toBe(400);
  });
});

describe('Auth — Login', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        name: 'Login User', email: 'login@gmail.com',
        password: await bcrypt.hash('password123', 10),
        batch: '57', department: 'CSE',
        role: 'junior', emailVerified: true
      }
    });
  });

  test('✅ Should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@gmail.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('❌ Should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@gmail.com', password: 'wrongpass' });
    expect(res.status).toBe(400);
  });

  test('❌ Should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@gmail.com', password: 'password123' });
    expect(res.status).toBe(400);
  });
});
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

beforeAll(async () => { await cleanDB(); });
afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanDB(); });

describe('Auth — Register', () => {
  test('❌ duplicate verified email → 400', async () => {
    await prisma.user.create({
      data: {
        name: 'Existing User', email: 'exist@test.com',
        password: await bcrypt.hash('pass123', 10),
        batch: '57', department: 'CSE', role: 'junior', emailVerified: true
      }
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New', email: 'exist@test.com', password: 'pass123', batch: '57', department: 'CSE', role: 'junior' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('❌ short password → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email: 'x@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('❌ missing name → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'y@test.com', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('❌ no email service → 503 or 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'new@test.com', password: 'password123', batch: '57', department: 'CSE', role: 'junior' });
    expect([201, 503]).toContain(res.status);
    if (res.status === 503) {
      expect(res.body.error).toBe('EMAIL_NOT_CONFIGURED');
    }
    if (res.status === 201) {
      const userInDB = await prisma.user.findUnique({ where: { email: 'new@test.com' } });
      expect(userInDB).toBeNull();
    }
  });
});

describe('Auth — OTP Verify', () => {
  test('✅ correct OTP → user created, pending deleted', async () => {
    const email = `otp_ok_${Date.now()}@test.com`;
    const hash = await bcrypt.hash('password123', 10);
    await prisma.pendingRegistration.create({
      data: {
        name: 'OTP User', email, passwordHash: hash,
        batch: '57', department: 'CSE', role: 'junior', gender: 'male',
        otp: '888888', otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email, otp: '888888' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user.emailVerified).toBe(true);
    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    expect(pending).toBeNull();
  });

  test('❌ wrong OTP → 400, user NOT created', async () => {
    const email = `otp_wrong_${Date.now()}@test.com`;
    const hash = await bcrypt.hash('password123', 10);
    await prisma.pendingRegistration.create({
      data: { name: 'Wrong OTP', email, passwordHash: hash, otp: '111111', otpExpiry: new Date(Date.now() + 10 * 60 * 1000) }
    });
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email, otp: '999999' });
    expect(res.status).toBe(400);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeNull();
  });

  test('❌ expired OTP → 400', async () => {
    const email = `otp_exp_${Date.now()}@test.com`;
    const hash = await bcrypt.hash('password123', 10);
    await prisma.pendingRegistration.create({
      data: { name: 'Expired', email, passwordHash: hash, otp: '222222', otpExpiry: new Date(Date.now() - 5000) }
    });
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email, otp: '222222' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  test('❌ no pending registration → 404', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'ghost@test.com', otp: '123456' });
    expect(res.status).toBe(404);
  });
});

describe('Auth — Login', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        name: 'Login User', email: 'login@test.com',
        password: await bcrypt.hash('password123', 10),
        batch: '57', department: 'CSE', role: 'junior', emailVerified: true
      }
    });
  });

  test('✅ correct credentials → token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@test.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('❌ wrong password → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('❌ unknown email → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('❌ missing fields → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com' });
    expect(res.status).toBe(400);
  });

  test('❌ no token on protected route → 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});
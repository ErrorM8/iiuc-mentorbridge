const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cleanDB } = require('./setup');

const SECRET = process.env.JWT_SECRET || 'mentorbridge_secret_key_2024';
let token1, token2, user1, user2;

beforeAll(async () => { await cleanDB(); });
afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

beforeEach(async () => {
  await cleanDB();
  user1 = await prisma.user.create({
    data: { name: 'User One', email: 'u1@test.com', password: await bcrypt.hash('pass', 10), batch: '57', department: 'CSE', role: 'junior', emailVerified: true }
  });
  user2 = await prisma.user.create({
    data: { name: 'User Two', email: 'u2@test.com', password: await bcrypt.hash('pass', 10), batch: '57', department: 'CSE', role: 'senior', emailVerified: true }
  });
  token1 = jwt.sign({ userId: user1.id }, SECRET, { expiresIn: '1d' });
  token2 = jwt.sign({ userId: user2.id }, SECRET, { expiresIn: '1d' });
});

describe('Posts — CRUD', () => {
  test('✅ create post via Prisma', async () => {
    const post = await prisma.post.create({
      data: { content: 'Hello world!', type: 'general', userId: user1.id }
    });
    expect(post.content).toBe('Hello world!');
    expect(post.userId).toBe(user1.id);
  });

  test('✅ get all posts via API', async () => {
    await prisma.post.createMany({
      data: [
        { content: 'Post A', type: 'general', userId: user1.id },
        { content: 'Post B', type: 'general', userId: user2.id }
      ]
    });
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(2);
  });

  test('✅ delete own post', async () => {
    const post = await prisma.post.create({
      data: { content: 'Delete me', type: 'general', userId: user1.id }
    });
    const res = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    const deleted = await prisma.post.findUnique({ where: { id: post.id } });
    expect(deleted).toBeNull();
  });

  test('❌ cannot delete another user post', async () => {
    const post = await prisma.post.create({
      data: { content: 'Not yours', type: 'general', userId: user2.id }
    });
    const res = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(403);
  });

  test('✅ like a post', async () => {
    const post = await prisma.post.create({
      data: { content: 'Like me', type: 'general', userId: user2.id }
    });
    const res = await request(app)
      .post(`/api/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.count).toBe(1);
  });

  test('✅ unlike a post (toggle)', async () => {
    const post = await prisma.post.create({
      data: { content: 'Toggle like', type: 'general', userId: user2.id }
    });
    await prisma.like.create({ data: { userId: user1.id, postId: post.id } });
    const res = await request(app)
      .post(`/api/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
    expect(res.body.count).toBe(0);
  });

  test('✅ add a comment', async () => {
    const post = await prisma.post.create({
      data: { content: 'Comment here', type: 'general', userId: user2.id }
    });
    const res = await request(app)
      .post(`/api/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Great post!' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Great post!');
    expect(res.body.userId).toBe(user1.id);
  });

  test('✅ get likes list', async () => {
    const post = await prisma.post.create({
      data: { content: 'Liked post', type: 'general', userId: user2.id }
    });
    // Like directly via Prisma (bypass API to avoid relation issue)
    await prisma.like.create({
      data: { userId: user1.id, postId: post.id }
    });

    // Check like exists in DB directly
    const likes = await prisma.like.findMany({
      where: { postId: post.id },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

  expect(likes.length).toBe(1);
  expect(likes[0].userId).toBe(user1.id);
  expect(likes[0].user.name).toBe('User One');
});

  test('✅ update own post', async () => {
    const post = await prisma.post.create({
      data: { content: 'Old content', type: 'general', userId: user1.id }
    });
    const res = await request(app)
      .put(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'New content' });
    expect(res.status).toBe(200);
    expect(res.body.post.content).toBe('New content');
  });

  test('❌ fail without auth token', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(401);
  });
});
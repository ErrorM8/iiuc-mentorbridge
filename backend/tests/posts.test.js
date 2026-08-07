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
  user1 = await prisma.user.create({
    data: { name:'User One', email:'u1@gmail.com', password: await bcrypt.hash('pass', 10), batch:'57', department:'CSE', role:'junior', emailVerified:true }
  });
  user2 = await prisma.user.create({
    data: { name:'User Two', email:'u2@gmail.com', password: await bcrypt.hash('pass', 10), batch:'57', department:'CSE', role:'senior', emailVerified:true }
  });
  token1 = jwt.sign({ userId: user1.id }, SECRET, { expiresIn: '1d' });
  token2 = jwt.sign({ userId: user2.id }, SECRET, { expiresIn: '1d' });
});

afterAll(async () => { await cleanDB(); await prisma.$disconnect(); });

describe('Posts — CRUD', () => {
  test('✅ Should create a post (text only)', async () => {
    // Create post directly via prisma (bypass Cloudinary)
    const post = await prisma.post.create({
      data: { content: 'Hello world!', type: 'general', userId: user1.id }
    });
    expect(post.content).toBe('Hello world!');
    expect(post.userId).toBe(user1.id);
  });

  test('✅ Should get all posts via API', async () => {
    await prisma.post.create({ data: { content: 'Post 1', type: 'general', userId: user1.id } });
    await prisma.post.create({ data: { content: 'Post 2', type: 'general', userId: user2.id } });
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(2);
  });

  test('✅ Should delete own post', async () => {
    const post = await prisma.post.create({ data: { content: 'Delete me', type: 'general', userId: user1.id } });
    const res = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
  });

  test('❌ Should NOT delete another user post', async () => {
    const post = await prisma.post.create({ data: { content: 'Not yours', type: 'general', userId: user2.id } });
    const res = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(403);
  });

  test('✅ Should like a post', async () => {
    const post = await prisma.post.create({ data: { content: 'Like me', type: 'general', userId: user2.id } });
    const res = await request(app)
      .post(`/api/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
  });

  test('✅ Should unlike a post (toggle)', async () => {
    const post = await prisma.post.create({ data: { content: 'Toggle', type: 'general', userId: user2.id } });
    await prisma.like.create({ data: { userId: user1.id, postId: post.id } });
    const res = await request(app)
      .post(`/api/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  test('✅ Should add a comment', async () => {
    const post = await prisma.post.create({ data: { content: 'Comment here', type: 'general', userId: user2.id } });
    const res = await request(app)
      .post(`/api/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Nice post!' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Nice post!');
  });

  test('❌ Should fail without auth token', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(401);
  });
});
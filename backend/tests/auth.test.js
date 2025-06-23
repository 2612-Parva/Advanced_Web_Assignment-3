// /tests/auth.test.js

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

const testUser = {
  fullName: 'Test User',
  email: 'testuser@example.com',
  password: 'Test@1234',
  role: 'doctor',
  securityQuestion: 'Your fav color?',
  securityAnswer: 'Blue'
};

let token;

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not allow duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should login the user and return a token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
      securityAnswer: testUser.securityAnswer
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should deny login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'Wrong@1234',
      securityAnswer: testUser.securityAnswer
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid password/i);
  });

  it('should deny login with wrong security answer', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
      securityAnswer: 'WrongAnswer'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid security answer/i);
  });

  it('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should deny access to protected route with no token', async () => {
    const res = await request(app).get('/api/auth/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

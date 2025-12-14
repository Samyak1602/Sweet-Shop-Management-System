import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import { generateToken } from '../src/utils/jwt.js';

describe('Protected Route Integration Tests', () => {
  let validToken;
  let userId;
  let testUser;

  beforeAll(async () => {
    const testMongoUri =
      process.env.MONGODB_TEST_URI ||
      'mongodb://localhost:27017/sweet-shop-test';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  });

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Protected Route User',
      email: 'protected@test.com',
      password: 'SecurePass123!',
    });

    userId = testUser._id;
    validToken = generateToken({
      id: testUser._id,
      email: testUser.email,
      role: testUser.role,
    });
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    if (collections.users) {
      await collections.users.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/test/protected', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'protected@test.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/not authorized|token/i);
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|invalid|expired/i);
    });

    it('should reject access with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', validToken) // Missing "Bearer "
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject access with expired token', async () => {
      const expiredToken = generateToken(
        {
          id: testUser._id,
          email: testUser.email,
          role: testUser.role,
        },
        '0s' // Immediately expired
      );

      // Wait a moment to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|invalid|expired/i);
    });

    it('should attach user object to request', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'Protected Route User');
      expect(response.body.user).toHaveProperty('email', 'protected@test.com');
      expect(response.body.user).toHaveProperty('role');
    });

    it('should reject token for deleted user', async () => {
      // Delete the user
      await User.findByIdAndDelete(userId);

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|user not found/i);
    });
  });

  describe('GET /api/test/public', () => {
    it('should access public route without token', async () => {
      const response = await request(app)
        .get('/api/test/public')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should access public route with token', async () => {
      const response = await request(app)
        .get('/api/test/public')
        .set('Authorization', `Bearer ${validToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});

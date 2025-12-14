import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';

// Test user data
const validUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'StrongPass123!',
};

const weakPasswordUser = {
  name: 'Weak User',
  email: 'weakuser@example.com',
  password: '123',
};

describe('Authentication Tests', () => {
  // Setup: Connect to test database before all tests
  beforeAll(async () => {
    // Use a test database
    const testMongoUri =
      process.env.MONGODB_TEST_URI ||
      'mongodb://localhost:27017/sweet-shop-test';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  });

  // Cleanup: Clear database after each test
  afterEach(async () => {
    // Clear users collection after each test to ensure clean state
    const collections = mongoose.connection.collections;
    if (collections.users) {
      await collections.users.deleteMany({});
    }
  });

  // Cleanup: Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', validUser.email);
      expect(response.body.user).toHaveProperty('name', validUser.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail registration if email already exists', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(validUser);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email.*already.*exists/i);
    });

    it('should fail registration if password is weak', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/password/i);
    });

    it('should fail registration if required fields are missing', async () => {
      const incompleteUser = {
        email: 'incomplete@example.com',
        // missing name and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail registration with invalid email format', async () => {
      const invalidEmailUser = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'StrongPass123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should login successfully with correct credentials', async () => {
      const loginCredentials = {
        email: validUser.email,
        password: validUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', validUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return JWT token on successful login', async () => {
      const loginCredentials = {
        email: validUser.email,
        password: validUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
      
      // Verify JWT token format (basic check)
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should fail login with incorrect password', async () => {
      const wrongCredentials = {
        email: validUser.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(wrongCredentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/invalid.*credentials/i);
      expect(response.body).not.toHaveProperty('token');
    });

    it('should fail login with non-existent email', async () => {
      const nonExistentUser = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentUser)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/invalid.*credentials/i);
      expect(response.body).not.toHaveProperty('token');
    });

    it('should fail login if required fields are missing', async () => {
      const incompleteCredentials = {
        email: validUser.email,
        // missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteCredentials)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should fail login with invalid email format', async () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: validUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).not.toHaveProperty('token');
    });
  });

  describe('JWT Token Validation', () => {
    it('should include user ID in JWT token payload', async () => {
      // Register and login
      await request(app).post('/api/auth/register').send(validUser);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      const token = loginResponse.body.token;
      expect(token).toBeDefined();

      // Decode token (without verification for testing purposes)
      const tokenPayload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(tokenPayload).toHaveProperty('id');
      expect(tokenPayload).toHaveProperty('email', validUser.email);
    });

    it('should set token expiration', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      const token = loginResponse.body.token;
      const tokenPayload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(tokenPayload).toHaveProperty('exp');
      expect(tokenPayload).toHaveProperty('iat');
      expect(tokenPayload.exp).toBeGreaterThan(tokenPayload.iat);
    });
  });
});

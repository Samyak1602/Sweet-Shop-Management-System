import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Sweet from '../src/models/Sweet.js';
import { generateToken } from '../src/utils/jwt.js';

describe('Sweet CRUD API Tests', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let sweetId;

  const validSweet = {
    name: 'Gulab Jamun',
    category: 'Traditional',
    price: 250,
    quantity: 50,
    description: 'Delicious Indian sweet',
  };

  beforeAll(async () => {
    const testMongoUri =
      process.env.MONGODB_TEST_URI ||
      'mongodb://localhost:27017/sweet-shop-test';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  });

  beforeEach(async () => {
    // Create regular user
    const user = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'UserPass123!',
      role: 'user',
    });
    userId = user._id;
    userToken = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
    });
    adminId = admin._id;
    adminToken = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    if (collections.users) {
      await collections.users.deleteMany({});
    }
    if (collections.sweets) {
      await collections.sweets.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/sweets', () => {
    it('should not create sweet without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send(validSweet)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|token/i);
    });

    it('should create sweet with valid token', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validSweet)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', validSweet.name);
      expect(response.body.data).toHaveProperty('category', validSweet.category);
      expect(response.body.data).toHaveProperty('price', validSweet.price);
      expect(response.body.data).toHaveProperty('quantity', validSweet.quantity);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should fail to create sweet without required fields', async () => {
      const incompleteSweet = {
        name: 'Test Sweet',
        // missing category, price, quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(incompleteSweet)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail to create sweet with invalid price', async () => {
      const invalidSweet = {
        ...validSweet,
        price: -10, // Invalid: negative price
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidSweet)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/price/i);
    });

    it('should fail to create sweet with zero price', async () => {
      const invalidSweet = {
        ...validSweet,
        price: 0, // Invalid: must be > 0
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidSweet)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/price/i);
    });

    it('should fail to create sweet with negative quantity', async () => {
      const invalidSweet = {
        ...validSweet,
        quantity: -5, // Invalid: negative quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidSweet)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity/i);
    });

    it('should create sweet with admin token', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSweet)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', validSweet.name);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create test sweets
      await Sweet.create([
        {
          name: 'Rasgulla',
          category: 'Milk-based',
          price: 200,
          quantity: 30,
        },
        {
          name: 'Barfi',
          category: 'Milk-based',
          price: 300,
          quantity: 20,
        },
        {
          name: 'Ladoo',
          category: 'Traditional',
          price: 150,
          quantity: 40,
        },
      ]);
    });

    it('should fetch all sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should return sweets with all required fields', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      const sweet = response.body.data[0];
      expect(sweet).toHaveProperty('name');
      expect(sweet).toHaveProperty('category');
      expect(sweet).toHaveProperty('price');
      expect(sweet).toHaveProperty('quantity');
      expect(sweet).toHaveProperty('_id');
      expect(sweet).toHaveProperty('createdAt');
      expect(sweet).toHaveProperty('updatedAt');
    });

    it('should return empty array when no sweets exist', async () => {
      await Sweet.deleteMany({});

      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should fetch sweets with authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('GET /api/sweets/:id', () => {
    beforeEach(async () => {
      const sweet = await Sweet.create(validSweet);
      sweetId = sweet._id;
    });

    it('should fetch single sweet by id', async () => {
      const response = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', validSweet.name);
      expect(response.body.data).toHaveProperty('_id', sweetId.toString());
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/sweets/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app)
        .get('/api/sweets/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    beforeEach(async () => {
      const sweet = await Sweet.create(validSweet);
      sweetId = sweet._id;
    });

    it('should update sweet with valid token', async () => {
      const updateData = {
        name: 'Updated Gulab Jamun',
        price: 280,
        quantity: 60,
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('price', updateData.price);
      expect(response.body.data).toHaveProperty('quantity', updateData.quantity);
    });

    it('should not update sweet without authentication', async () => {
      const updateData = { name: 'Updated Sweet' };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|token/i);
    });

    it('should return 404 when updating non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Updated Sweet' };

      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should fail to update with invalid price', async () => {
      const invalidUpdate = { price: -50 };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidUpdate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should partially update sweet', async () => {
      const partialUpdate = { quantity: 100 };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data).toHaveProperty('quantity', 100);
      expect(response.body.data).toHaveProperty('name', validSweet.name); // Unchanged
    });

    it('should update sweet with admin token', async () => {
      const updateData = { price: 500 };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data).toHaveProperty('price', 500);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    beforeEach(async () => {
      const sweet = await Sweet.create(validSweet);
      sweetId = sweet._id;
    });

    it('should not allow non-admin to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|forbidden/i);

      // Verify sweet still exists
      const sweet = await Sweet.findById(sweetId);
      expect(sweet).not.toBeNull();
    });

    it('should allow admin to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');

      // Verify sweet is deleted
      const sweet = await Sweet.findById(sweetId);
      expect(sweet).toBeNull();
    });

    it('should not delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|token/i);

      // Verify sweet still exists
      const sweet = await Sweet.findById(sweetId);
      expect(sweet).not.toBeNull();
    });

    it('should return 404 when deleting non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app)
        .delete('/api/sweets/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Authorization Tests', () => {
    beforeEach(async () => {
      const sweet = await Sweet.create(validSweet);
      sweetId = sweet._id;
    });

    it('should allow user to create sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Kaju Katli',
          category: 'Dry Fruit',
          price: 500,
          quantity: 25,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow user to update sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 75 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to create sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jalebi',
          category: 'Traditional',
          price: 180,
          quantity: 50,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 350 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should only allow admin to delete sweet', async () => {
      // User attempt
      await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Admin attempt
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

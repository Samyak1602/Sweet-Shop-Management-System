import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Sweet from '../src/models/Sweet.js';
import { generateToken } from '../src/utils/jwt.js';

describe('Sweet Inventory Operations Tests', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let sweetId;

  const testSweet = {
    name: 'Test Sweet',
    category: 'Traditional',
    price: 250,
    quantity: 50,
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
      email: 'user@inventory.test',
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
      email: 'admin@inventory.test',
      password: 'AdminPass123!',
      role: 'admin',
    });
    adminId = admin._id;
    adminToken = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    // Create test sweet
    const sweet = await Sweet.create(testSweet);
    sweetId = sweet._id;
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

  describe('POST /api/sweets/:id/purchase', () => {
    it('should decrease quantity when purchasing', async () => {
      const purchaseAmount = 10;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: purchaseAmount })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('quantity', 40); // 50 - 10
      expect(response.body).toHaveProperty('message');

      // Verify in database
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(40);
    });

    it('should handle multiple purchases correctly', async () => {
      // First purchase
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 })
        .expect(200);

      // Second purchase
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 15 })
        .expect(200);

      expect(response.body.data.quantity).toBe(25); // 50 - 10 - 15

      // Verify in database
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(25);
    });

    it('should not allow purchase if quantity is zero', async () => {
      // First, reduce quantity to zero
      await Sweet.findByIdAndUpdate(sweetId, { quantity: 0 });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/out of stock|not available|insufficient/i);

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(0);
    });

    it('should not allow purchase if requested quantity exceeds available', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 100 }) // More than available (50)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/insufficient|not enough|exceeds/i);

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });

    it('should not allow purchase without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 10 })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|token/i);

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });

    it('should fail if quantity is not provided', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({}) // Missing quantity
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity.*required/i);
    });

    it('should fail if quantity is negative', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: -5 })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity|positive|greater than/i);
    });

    it('should fail if quantity is zero', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity|positive|greater than/i);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should allow admin to purchase', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 })
        .expect(200);

      expect(response.body.data.quantity).toBe(40);
    });

    it('should update inStock status when quantity reaches zero', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 50 }) // Purchase all
        .expect(200);

      expect(response.body.data.quantity).toBe(0);
      expect(response.body.data.inStock).toBe(false);
    });

    it('should handle decimal quantities appropriately', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10.5 })
        .expect('Content-Type', /json/);

      // Should either accept or reject based on business logic
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should increase quantity when restocking', async () => {
      const restockAmount = 30;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: restockAmount })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('quantity', 80); // 50 + 30
      expect(response.body).toHaveProperty('message');

      // Verify in database
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(80);
    });

    it('should not allow regular user to restock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 30 })
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|forbidden/i);

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });

    it('should not allow restock without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send({ quantity: 30 })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized|token/i);

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });

    it('should handle multiple restocks correctly', async () => {
      // First restock
      await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 })
        .expect(200);

      // Second restock
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 })
        .expect(200);

      expect(response.body.data.quantity).toBe(80); // 50 + 20 + 10

      // Verify in database
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(80);
    });

    it('should restock item with zero quantity', async () => {
      // Set quantity to zero
      await Sweet.findByIdAndUpdate(sweetId, { quantity: 0, inStock: false });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 25 })
        .expect(200);

      expect(response.body.data.quantity).toBe(25);
      expect(response.body.data.inStock).toBe(true);
    });

    it('should fail if quantity is not provided', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing quantity
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity.*required/i);
    });

    it('should fail if quantity is negative', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -10 })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity|positive|greater than/i);
    });

    it('should fail if quantity is zero', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/quantity|positive|greater than/i);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 30 })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should update inStock status when restocking', async () => {
      // Set out of stock
      await Sweet.findByIdAndUpdate(sweetId, { quantity: 0, inStock: false });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body.data.inStock).toBe(true);
    });
  });

  describe('Combined Purchase and Restock Operations', () => {
    it('should handle purchase followed by restock', async () => {
      // Purchase
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 30 })
        .expect(200);

      // Restock
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 40 })
        .expect(200);

      expect(response.body.data.quantity).toBe(60); // 50 - 30 + 40
    });

    it('should handle restock followed by purchase', async () => {
      // Restock
      await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(200);

      // Purchase
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body.data.quantity).toBe(80); // 50 + 50 - 20
    });

    it('should maintain correct quantity through multiple operations', async () => {
      // Purchase 10
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      // Restock 20
      await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 });

      // Purchase 15
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 15 });

      // Restock 5
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.data.quantity).toBe(50); // 50 - 10 + 20 - 15 + 5

      // Verify in database
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });
  });
});

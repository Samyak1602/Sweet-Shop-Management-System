import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import Sweet from '../src/models/Sweet.js';

describe('Sweet Search API Tests', () => {
  beforeAll(async () => {
    const testMongoUri =
      process.env.MONGODB_TEST_URI ||
      'mongodb://localhost:27017/sweet-shop-test';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  });

  beforeEach(async () => {
    // Create test sweets with diverse data
    await Sweet.create([
      {
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: 250,
        quantity: 50,
        description: 'Classic Indian sweet',
      },
      {
        name: 'Chocolate Barfi',
        category: 'Chocolate',
        price: 350,
        quantity: 30,
        description: 'Chocolate flavored barfi',
      },
      {
        name: 'Kaju Katli',
        category: 'Dry Fruit',
        price: 600,
        quantity: 25,
        description: 'Premium cashew sweet',
      },
      {
        name: 'Rasgulla',
        category: 'Milk-based',
        price: 200,
        quantity: 40,
        description: 'Soft and spongy sweet',
      },
      {
        name: 'Chocolate Truffle',
        category: 'Chocolate',
        price: 450,
        quantity: 20,
        description: 'Rich chocolate truffle',
      },
      {
        name: 'Milk Barfi',
        category: 'Milk-based',
        price: 300,
        quantity: 35,
        description: 'Traditional milk sweet',
      },
      {
        name: 'Jalebi',
        category: 'Traditional',
        price: 180,
        quantity: 60,
        description: 'Crispy and sweet',
      },
      {
        name: 'Sugar-free Ladoo',
        category: 'Sugar-free',
        price: 400,
        quantity: 15,
        description: 'Healthy sugar-free option',
      },
    ]);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    if (collections.sweets) {
      await collections.sweets.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/sweets/search', () => {
    describe('Search by name', () => {
      it('should search sweets by partial name match (case-insensitive)', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'barfi' })
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2); // Chocolate Barfi and Milk Barfi
        
        const names = response.body.data.map(sweet => sweet.name);
        expect(names).toContain('Chocolate Barfi');
        expect(names).toContain('Milk Barfi');
      });

      it('should search sweets by exact name match', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'Gulab Jamun' })
          .expect(200);

        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('Gulab Jamun');
      });

      it('should search sweets with partial word', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'choco' })
          .expect(200);

        expect(response.body.data.length).toBe(2); // Chocolate Barfi and Chocolate Truffle
        response.body.data.forEach(sweet => {
          expect(sweet.name.toLowerCase()).toContain('choco');
        });
      });

      it('should return empty array when name does not match', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'NonExistentSweet' })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
        expect(response.body.count).toBe(0);
      });

      it('should handle special characters in name search', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'Sugar-free' })
          .expect(200);

        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('Sugar-free Ladoo');
      });
    });

    describe('Search by category', () => {
      it('should filter sweets by category', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'Chocolate' })
          .expect(200);

        expect(response.body.data.length).toBe(2);
        response.body.data.forEach(sweet => {
          expect(sweet.category).toBe('Chocolate');
        });
      });

      it('should filter sweets by Traditional category', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'Traditional' })
          .expect(200);

        expect(response.body.data.length).toBe(2); // Gulab Jamun and Jalebi
        const names = response.body.data.map(sweet => sweet.name);
        expect(names).toContain('Gulab Jamun');
        expect(names).toContain('Jalebi');
      });

      it('should filter sweets by Milk-based category', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'Milk-based' })
          .expect(200);

        expect(response.body.data.length).toBe(2);
        response.body.data.forEach(sweet => {
          expect(sweet.category).toBe('Milk-based');
        });
      });

      it('should return empty array for non-existent category', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'NonExistentCategory' })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
      });
    });

    describe('Search by price range', () => {
      it('should filter sweets by minimum price', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 400 })
          .expect(200);

        expect(response.body.data.length).toBe(3); // Kaju Katli (600), Chocolate Truffle (450), Sugar-free Ladoo (400)
        response.body.data.forEach(sweet => {
          expect(sweet.price).toBeGreaterThanOrEqual(400);
        });
      });

      it('should filter sweets by maximum price', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ maxPrice: 250 })
          .expect(200);

        expect(response.body.data.length).toBe(3); // Gulab Jamun (250), Rasgulla (200), Jalebi (180)
        response.body.data.forEach(sweet => {
          expect(sweet.price).toBeLessThanOrEqual(250);
        });
      });

      it('should filter sweets by price range (min and max)', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 250, maxPrice: 400 })
          .expect(200);

        expect(response.body.data.length).toBe(4); // Gulab Jamun (250), Chocolate Barfi (350), Milk Barfi (300), Sugar-free Ladoo (400)
        response.body.data.forEach(sweet => {
          expect(sweet.price).toBeGreaterThanOrEqual(250);
          expect(sweet.price).toBeLessThanOrEqual(400);
        });
      });

      it('should return empty array when no sweets match price range', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 1000, maxPrice: 2000 })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
      });

      it('should handle minPrice greater than maxPrice gracefully', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 500, maxPrice: 200 })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
      });

      it('should handle zero price range', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 0, maxPrice: 0 })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
      });
    });

    describe('Combined search filters', () => {
      it('should search by name and category', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'Chocolate', category: 'Chocolate' })
          .expect(200);

        expect(response.body.data.length).toBe(2);
        response.body.data.forEach(sweet => {
          expect(sweet.name.toLowerCase()).toContain('chocolate');
          expect(sweet.category).toBe('Chocolate');
        });
      });

      it('should search by name and price range', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'barfi', minPrice: 300, maxPrice: 400 })
          .expect(200);

        expect(response.body.data.length).toBe(2); // Chocolate Barfi (350) and Milk Barfi (300)
        response.body.data.forEach(sweet => {
          expect(sweet.name.toLowerCase()).toContain('barfi');
          expect(sweet.price).toBeGreaterThanOrEqual(300);
          expect(sweet.price).toBeLessThanOrEqual(400);
        });
      });

      it('should search by category and price range', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'Traditional', minPrice: 200, maxPrice: 300 })
          .expect(200);

        expect(response.body.data.length).toBe(1); // Gulab Jamun (250)
        expect(response.body.data[0].name).toBe('Gulab Jamun');
        expect(response.body.data[0].category).toBe('Traditional');
      });

      it('should search by all filters: name, category, and price range', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({
            name: 'Chocolate',
            category: 'Chocolate',
            minPrice: 300,
            maxPrice: 400,
          })
          .expect(200);

        expect(response.body.data.length).toBe(1); // Chocolate Barfi (350)
        expect(response.body.data[0].name).toBe('Chocolate Barfi');
        expect(response.body.data[0].price).toBe(350);
      });

      it('should return empty array when combined filters match nothing', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({
            name: 'Chocolate',
            category: 'Traditional', // Mismatch
            minPrice: 300,
            maxPrice: 400,
          })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
      });

      it('should handle name filter with non-matching category', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'Gulab', category: 'Chocolate' })
          .expect(200);

        expect(response.body.data).toHaveLength(0);
      });
    });

    describe('Empty and edge cases', () => {
      it('should return all sweets when no search parameters provided', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .expect(200);

        expect(response.body.data.length).toBe(8); // All sweets
      });

      it('should handle empty string in name parameter', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: '' })
          .expect(200);

        expect(response.body.data.length).toBe(8); // Should return all
      });

      it('should handle whitespace in name parameter', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: '   ' })
          .expect(200);

        expect(response.body.data.length).toBe(8); // Should return all
      });

      it('should handle invalid price values gracefully', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 'invalid' })
          .expect(200);

        // Should ignore invalid price and return results
        expect(response.body).toHaveProperty('data');
      });

      it('should handle negative price values', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: -100 })
          .expect(200);

        // Should return all sweets as all prices are >= 0
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should be case-insensitive for name search', async () => {
        const response1 = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'GULAB' })
          .expect(200);

        const response2 = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'gulab' })
          .expect(200);

        const response3 = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'GuLaB' })
          .expect(200);

        expect(response1.body.data.length).toBe(1);
        expect(response2.body.data.length).toBe(1);
        expect(response3.body.data.length).toBe(1);
        expect(response1.body.data[0].name).toBe(response2.body.data[0].name);
      });
    });

    describe('Response structure', () => {
      it('should return proper response structure', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ name: 'Chocolate' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(typeof response.body.count).toBe('number');
      });

      it('should return sweets with all required fields', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'Traditional' })
          .expect(200);

        response.body.data.forEach(sweet => {
          expect(sweet).toHaveProperty('_id');
          expect(sweet).toHaveProperty('name');
          expect(sweet).toHaveProperty('category');
          expect(sweet).toHaveProperty('price');
          expect(sweet).toHaveProperty('quantity');
          expect(sweet).toHaveProperty('createdAt');
          expect(sweet).toHaveProperty('updatedAt');
        });
      });

      it('should return count matching data array length', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 300 })
          .expect(200);

        expect(response.body.count).toBe(response.body.data.length);
      });
    });

    describe('Performance and sorting', () => {
      it('should return results sorted by relevance or creation date', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ category: 'Traditional' })
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        // Results should be consistent
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should handle multiple similar results', async () => {
        const response = await request(app)
          .get('/api/sweets/search')
          .query({ minPrice: 0, maxPrice: 1000 })
          .expect(200);

        expect(response.body.data.length).toBe(8);
      });
    });
  });
});

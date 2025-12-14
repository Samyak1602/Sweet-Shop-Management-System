import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin details from command line arguments or use defaults
    const name = process.argv[2] || 'Admin User';
    const email = process.argv[3] || 'admin@sweetshop.com';
    const password = process.argv[4] || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('Admin user already exists with this email!');
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Name: ${existingAdmin.name}`);
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        // If password is provided, update it (will be hashed by pre-save hook)
        if (process.argv[4]) {
          existingAdmin.password = password;
        }
        await existingAdmin.save();
        console.log('Existing user updated to admin role!');
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Name: ${existingAdmin.name}`);
        if (process.argv[4]) {
          console.log(`Password has been updated to: ${password}`);
        }
        process.exit(0);
      }
    }

    // Create new admin user
    // Note: We pass plain password - the User model's pre-save hook will hash it
    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password: password, // Plain password - will be hashed by pre-save hook
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();


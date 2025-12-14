import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin email and new password from command line arguments
    const email = process.argv[2] || 'admin@sweetshop.com';
    const newPassword = process.argv[3] || 'admin123';

    // Find the admin user
    const admin = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!admin) {
      console.error(`User with email ${email} not found!`);
      console.log('Creating new admin user instead...');
      
      // Create new admin user
      const newAdmin = await User.create({
        name: 'Admin User',
        email: email.toLowerCase(),
        password: newPassword, // Will be hashed by pre-save hook
        role: 'admin',
      });

      console.log('Admin user created successfully!');
      console.log(`Email: ${newAdmin.email}`);
      console.log(`Password: ${newPassword}`);
      process.exit(0);
    }

    // Reset password (will be hashed by pre-save hook)
    admin.password = newPassword;
    admin.role = 'admin'; // Ensure role is admin
    await admin.save();

    console.log('Admin password reset successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();


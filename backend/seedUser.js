import userModel from "./models/userModel.js";
import mongoose from "mongoose";
import 'dotenv/config';

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const sampleUsers = [
      {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '9876543210',
        password: 'password123',
        address: { line1: 'Sector 21, Noida', line2: 'UP, India' },
        gender: 'Male',
        dob: '1990-01-01'
      }
    ];
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ email: 'testuser@example.com' });
    if (!existingUser) {
      await userModel.insertMany(sampleUsers);
      console.log('✅ Sample user created successfully');
    } else {
      console.log('ℹ️  User already exists');
    }
    
    process.exit(0);
  } catch(error) {
    console.error('❌ Error seeding user data:', error);
    process.exit(1);
  }
}

seedUsers();

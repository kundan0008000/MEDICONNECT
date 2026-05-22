import ambulanceModel from "./models/ambulanceModel.js";
import mongoose from "mongoose";
import 'dotenv/config';

const seedAmbulances = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing ambulance data for user123
    await ambulanceModel.deleteMany({ userId: 'user123' });

    const sampleData = [
      {
        userId: 'user123',
        patientName: 'Rajesh Kumar',
        location: 'Sector 21, Noida',
        contactNumber: '9876543210',
        description: 'Emergency - Severe chest pain',
        requestDate: Date.now() - 7200000,
        status: 'completed',
        estimatedTime: '15 mins'
      },
      {
        userId: 'user123',
        patientName: 'Rajesh Kumar',
        location: 'Sector 22, Noida',
        contactNumber: '9876543210',
        description: 'Accident victim - need immediate assistance',
        requestDate: Date.now() - 3600000,
        status: 'accepted',
        estimatedTime: '10 mins'
      },
      {
        userId: 'user123',
        patientName: 'Rajesh Kumar',
        location: 'Sector 23, Noida',
        contactNumber: '9876543210',
        description: 'Patient with high fever - urgent transportation needed',
        requestDate: Date.now(),
        status: 'pending',
        estimatedTime: '20 mins'
      }
    ];
    
    await ambulanceModel.insertMany(sampleData);
    console.log('✅ Sample ambulance data inserted successfully');
    process.exit(0);
  } catch(error) {
    console.error('❌ Error seeding ambulance data:', error);
    process.exit(1);
  }
}

seedAmbulances();

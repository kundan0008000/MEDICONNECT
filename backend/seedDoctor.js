import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import doctorModel from "./models/doctorModel.js";

dotenv.config();

const seedDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database Connected");

    // Check if doctor already exists
    const existingDoctor = await doctorModel.findOne({
      email: "doctor@example.com",
    });

    if (existingDoctor) {
      console.log("⚠️  Doctor already exists! Deleting old one...");
      await doctorModel.deleteOne({ email: "doctor@example.com" });
      console.log("✅ Old doctor deleted");
    }

    // Hash password with salt
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);
    console.log("✅ Password hashed successfully");

    // Create default doctor
    const doctorData = {
      name: "Dr. Raj Kumar",
      email: "doctor@example.com",
      password: hashedPassword,
      image: "https://via.placeholder.com/200",
      speciality: "Cardiology",
      degree: "MD",
      experience: "10 years",
      about: "Experienced Cardiologist with 10 years of practice. Specialized in cardiac care and consultation.",
      available: true,
      fees: 500,
      slots_booked: {},
      address: {
        line1: "123 Medical Street",
        line2: "New Delhi, India",
      },
      date: Date.now(),
    };

    console.log("📝 Creating doctor document...");
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    console.log("✅ Doctor Added Successfully!");
    console.log("📧 Email: doctor@example.com");
    console.log("🔑 Password: password123");
    console.log("✨ You can now login with these credentials");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding doctor:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  }
};

seedDoctor();

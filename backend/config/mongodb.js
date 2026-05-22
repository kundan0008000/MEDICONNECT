import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("Database Connected"));
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error("Database Connection Error:", error.message);
        process.exit(1);
    }
}

export default connectDB;

// Do not use '@' symbol in your database user's password else it will show an error.
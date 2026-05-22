import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    patientName: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    description: { type: String, required: true },
    requestDate: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
    estimatedTime: { type: String, default: '15 mins' },
}, { minimize: false })

const ambulanceModel = mongoose.models.ambulance || mongoose.model("ambulance", ambulanceSchema);
export default ambulanceModel;

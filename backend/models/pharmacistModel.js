import mongoose from "mongoose";

const pharmacistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    pharmacy: { type: String, required: true },
    specialization: { type: String, default: 'General Pharmacy' },
    available: { type: Boolean, default: true },
    address: { type: Object, default: { line1: '', line2: '' } },
    image: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    about: { type: String, default: '' },
    department: { type: String, default: 'Pharmacy' },
    date: { type: Number, required: true },
}, { minimize: false });

const pharmacistModel = mongoose.models.pharmacist || mongoose.model("pharmacist", pharmacistSchema);
export default pharmacistModel;

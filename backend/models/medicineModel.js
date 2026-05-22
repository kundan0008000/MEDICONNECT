import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, default: 0 },
    stockCount: { type: Number, default: 100 }, // Available stock
    dosage: { type: String, default: "" }, // e.g., "500mg", "10ml"
    manufacturer: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    requiresPrescription: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // Discount percentage
    date: { type: Number, required: true },
}, { minimize: false })

const medicineModel = mongoose.models.medicine || mongoose.model("medicine", medicineSchema);
export default medicineModel;

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['appointment', 'medicine', 'ambulance', 'prescription', 'message', 'alert'], default: 'message' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    description: { type: String },
    isRead: { type: Boolean, default: false },
    icon: { type: String, default: '📢' },
    link: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Number, required: true },
    expiresAt: { type: Number }
}, { minimize: false })

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default notificationModel;

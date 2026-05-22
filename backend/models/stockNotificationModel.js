import mongoose from "mongoose";

const stockNotificationSchema = new mongoose.Schema({
    medicineId: { type: String, required: true },
    medicineName: { type: String, required: true },
    previousQuantity: { type: Number, required: true },
    currentQuantity: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 20 },
    status: { 
        type: String, 
        enum: ['normal', 'low_stock', 'out_of_stock', 'restocked'],
        default: 'normal'
    },
    pharmacistId: { type: String },
    pharmacy: { type: String },
    notificationType: {
        type: String,
        enum: ['stock_low', 'stock_out', 'restocked', 'stock_update'],
        default: 'stock_update'
    },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number },
}, { minimize: false });

const stockNotificationModel = mongoose.models.stockNotification || mongoose.model("stockNotification", stockNotificationSchema);
export default stockNotificationModel;

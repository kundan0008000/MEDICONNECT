import express from 'express';
import medicineModel from '../models/medicineModel.js';
import stockNotificationModel from '../models/stockNotificationModel.js';
import smsHelper from '../utils/smsHelper.js';
import notificationHelper from '../utils/notificationHelper.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

/**
 * Get all medicines with stock status
 */
router.get('/medicines-stock', authAdmin, async (req, res) => {
    try {
        const medicines = await medicineModel.find({}).sort({ date: -1 });
        
        const medicinesWithStatus = medicines.map(med => ({
            _id: med._id,
            name: med.name,
            category: med.category,
            price: med.price,
            stockCount: med.stockCount,
            quantity: med.quantity,
            image: med.image,
            status: med.stockCount === 0 ? 'out_of_stock' : med.stockCount <= 20 ? 'low_stock' : 'normal',
            inStock: med.inStock
        }));

        res.json({ success: true, medicines: medicinesWithStatus });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Update medicine stock
 */
router.post('/update-stock', authAdmin, async (req, res) => {
    try {
        const { medicineId, quantity, operation } = req.body; // operation: 'add' or 'subtract'

        if (!medicineId || quantity === undefined) {
            return res.json({ success: false, message: 'Medicine ID and quantity are required' });
        }

        const medicine = await medicineModel.findById(medicineId);
        if (!medicine) {
            return res.json({ success: false, message: 'Medicine not found' });
        }

        const previousQuantity = medicine.stockCount;
        let newQuantity = previousQuantity;

        if (operation === 'add') {
            newQuantity = previousQuantity + quantity;
        } else if (operation === 'subtract') {
            newQuantity = Math.max(0, previousQuantity - quantity);
        } else {
            return res.json({ success: false, message: 'Invalid operation. Use "add" or "subtract"' });
        }

        // Update medicine stock
        medicine.stockCount = newQuantity;
        medicine.inStock = newQuantity > 0;
        await medicine.save();

        // Determine notification type
        let notificationType = 'stock_update';
        let status = 'normal';
        
        if (newQuantity === 0) {
            notificationType = 'stock_out';
            status = 'out_of_stock';
        } else if (newQuantity <= 20) {
            notificationType = 'stock_low';
            status = 'low_stock';
        } else if (previousQuantity <= 20 && newQuantity > 20) {
            notificationType = 'restocked';
            status = 'normal';
        }

        // Create stock notification
        const notification = new stockNotificationModel({
            medicineId: String(medicineId),
            medicineName: medicine.name,
            previousQuantity,
            currentQuantity: newQuantity,
            lowStockThreshold: 20,
            status,
            notificationType,
            message: `${medicine.name} stock updated from ${previousQuantity} to ${newQuantity}`,
            pharmacy: req.body.pharmacy || 'Main Pharmacy',
            createdAt: Date.now()
        });

        await notification.save();

        // Send alert if low stock or out of stock
        if (notificationType === 'stock_low' || notificationType === 'stock_out') {
            // TODO: Send SMS to pharmacist when implemented
            // await smsHelper.sendStockAlertSMS(pharmacistPhone, pharmacistName, medicine.name, newQuantity);
            
            // Send notification to all pharmacists
            await notificationHelper.sendToPharmacists({
                type: 'stock_alert',
                title: notificationType === 'stock_out' ? 'Stock Out Alert' : 'Low Stock Alert',
                message: `${medicine.name} stock is ${notificationType === 'stock_out' ? 'out of stock' : 'low'} (${newQuantity} units)`,
                medicineId: String(medicineId)
            });
        }

        res.json({ 
            success: true, 
            message: 'Stock updated successfully',
            medicine: {
                _id: medicine._id,
                name: medicine.name,
                previousQuantity,
                currentQuantity: newQuantity,
                status
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get stock notifications
 */
router.get('/stock-notifications', authAdmin, async (req, res) => {
    try {
        const { limit = 20, skip = 0, status } = req.query;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const notifications = await stockNotificationModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await stockNotificationModel.countDocuments(query);

        res.json({ 
            success: true, 
            notifications,
            total,
            page: Math.ceil(skip / limit) + 1,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Mark stock notification as read
 */
router.post('/mark-notification-read', authAdmin, async (req, res) => {
    try {
        const { notificationId } = req.body;

        if (!notificationId) {
            return res.json({ success: false, message: 'Notification ID is required' });
        }

        await stockNotificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true, updatedAt: Date.now() },
            { new: true }
        );

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get stock statistics
 */
router.get('/stock-stats', authAdmin, async (req, res) => {
    try {
        const medicines = await medicineModel.find({});

        const stats = {
            totalMedicines: medicines.length,
            inStock: medicines.filter(m => m.inStock).length,
            outOfStock: medicines.filter(m => !m.inStock).length,
            lowStock: medicines.filter(m => m.stockCount <= 20 && m.stockCount > 0).length,
            totalValue: medicines.reduce((sum, m) => sum + (m.price * m.stockCount), 0),
            lowStockMedicines: medicines
                .filter(m => m.stockCount <= 20)
                .map(m => ({
                    name: m.name,
                    stockCount: m.stockCount,
                    price: m.price
                }))
                .sort((a, b) => a.stockCount - b.stockCount)
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Batch stock update
 */
router.post('/batch-update-stock', authAdmin, async (req, res) => {
    try {
        const { updates } = req.body; // Array of { medicineId, quantity, operation }

        if (!Array.isArray(updates)) {
            return res.json({ success: false, message: 'Updates must be an array' });
        }

        const results = [];

        for (const update of updates) {
            const { medicineId, quantity, operation } = update;
            
            const medicine = await medicineModel.findById(medicineId);
            if (!medicine) {
                results.push({ medicineId, success: false, message: 'Medicine not found' });
                continue;
            }

            const previousQuantity = medicine.stockCount;
            let newQuantity = previousQuantity;

            if (operation === 'add') {
                newQuantity = previousQuantity + quantity;
            } else if (operation === 'subtract') {
                newQuantity = Math.max(0, previousQuantity - quantity);
            }

            medicine.stockCount = newQuantity;
            medicine.inStock = newQuantity > 0;
            await medicine.save();

            results.push({
                medicineId,
                success: true,
                previousQuantity,
                newQuantity
            });
        }

        res.json({ success: true, message: 'Batch update completed', results });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default router;

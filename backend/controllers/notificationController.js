import notificationModel from "../models/notificationModel.js";

// Send notification
const sendNotification = async (req, res) => {
    try {
        const { userId, type, title, message, description, icon, link, data } = req.body;

        if (!userId || !title || !message) {
            return res.json({ success: false, message: "Missing required fields: userId, title, message" });
        }

        const notification = new notificationModel({
            userId: String(userId),
            type: type || 'alert',
            title,
            message,
            description: description || '',
            icon: icon || '📢',
            link: link || '',
            data: data || {},
            isRead: false,
            createdAt: Date.now()
        });

        await notification.save();
        console.log(`✅ Notification sent to ${userId}: ${title}`);
        res.json({ success: true, message: "Notification sent", notification });
    } catch (error) {
        console.error(`❌ Notification error: ${error.message}`);
        res.json({ success: false, message: error.message });
    }
};

// Get all notifications for user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        const notifications = await notificationModel.find({ userId: String(userId) }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        const count = await notificationModel.countDocuments({ userId: String(userId), isRead: false });
        res.json({ success: true, unreadCount: count });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        await notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        await notificationModel.updateMany({ userId: String(userId), isRead: false }, { isRead: true });
        res.json({ success: true, message: "All marked as read" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.body;
        await notificationModel.findByIdAndDelete(notificationId);
        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        await notificationModel.deleteMany({ userId: String(userId) });
        res.json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all notifications in system (Admin only)
const getAllNotifications = async (req, res) => {
    try {
        const { limit = 100, page = 1, type } = req.body;
        const skip = (page - 1) * limit;

        let query = {};
        if (type) {
            query.type = type;
        }

        const notifications = await notificationModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await notificationModel.countDocuments(query);

        res.json({
            success: true,
            notifications,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get notification statistics (Admin only)
const getNotificationStats = async (req, res) => {
    try {
        const total = await notificationModel.countDocuments();
        const unread = await notificationModel.countDocuments({ isRead: false });
        const byType = await notificationModel.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const stats = {
            total,
            unread,
            read: total - unread,
            byType: byType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    sendNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getAllNotifications,
    getNotificationStats
};

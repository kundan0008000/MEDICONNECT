import notificationModel from "../models/notificationModel.js";
import pharmacistModel from "../models/pharmacistModel.js";

// Helper function to send notifications internally (without HTTP)
export const sendNotificationHelper = async (userId, type, title, message, description = "", icon = "📢", link = "", data = {}) => {
    try {
        // Validate inputs
        if (!userId) {
            console.warn("⚠️ sendNotificationHelper: Missing userId");
            return null;
        }
        if (!title || !message) {
            console.warn("⚠️ sendNotificationHelper: Missing title or message");
            return null;
        }

        // Convert userId to string to ensure consistency
        const userIdStr = String(userId);

        const notificationData = {
            userId: userIdStr,
            type: type || 'alert',
            title,
            message,
            description: description || "",
            icon: icon || '📢',
            link: link || "",
            data: data || {},
            createdAt: Date.now(),
            isRead: false
        };

        const notification = new notificationModel(notificationData);
        await notification.save();
        
        console.log(`✅ Notification sent to ${userIdStr}: ${title}`);
        return notification;
    } catch (error) {
        console.error(`❌ Failed to send notification - Error: ${error.message}`);
        console.error(`   Details: userId=${userId}, title=${title}`);
        return null;
    }
};

/**
 * Send notifications to all pharmacists
 */
export const sendToPharmacists = async (notificationData) => {
    try {
        const pharmacists = await pharmacistModel.find({});
        
        const notifications = [];
        for (const pharmacist of pharmacists) {
            const notification = await sendNotificationHelper(
                String(pharmacist._id),
                notificationData.type || 'alert',
                notificationData.title,
                notificationData.message,
                notificationData.description || "",
                notificationData.icon || '📢',
                notificationData.link || "",
                notificationData.data || {}
            );
            if (notification) {
                notifications.push(notification);
            }
        }

        console.log(`✅ Notifications sent to ${notifications.length} pharmacists`);
        return notifications;
    } catch (error) {
        console.error(`❌ Failed to send pharmacist notifications: ${error.message}`);
        return [];
    }
};

/**
 * Send SMS notification wrapper
 */
export const sendSMSNotification = async (phone, message) => {
    try {
        console.log(`📱 SMS to ${phone}: ${message}`);
        // TODO: Integrate with SMS service
        return { success: true };
    } catch (error) {
        console.error(`❌ SMS send error: ${error.message}`);
        return { success: false, error: error.message };
    }
};

export default {
    sendNotificationHelper,
    sendToPharmacists,
    sendSMSNotification
};

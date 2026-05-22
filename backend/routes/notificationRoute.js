import express from 'express';
import { 
    sendNotification, 
    getUserNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    getAllNotifications,
    getNotificationStats
} from '../controllers/notificationController.js';
import authUser from '../middleware/authUser.js';
import authAdmin from '../middleware/authAdmin.js';

const notificationRouter = express.Router();

// User routes
notificationRouter.post("/send", authUser, sendNotification)
notificationRouter.post("/get-notifications", authUser, getUserNotifications)
notificationRouter.post("/unread-count", authUser, getUnreadCount)
notificationRouter.post("/mark-read", authUser, markAsRead)
notificationRouter.post("/mark-all-read", authUser, markAllAsRead)
notificationRouter.post("/delete", authUser, deleteNotification)
notificationRouter.post("/clear-all", authUser, clearAllNotifications)

// Admin routes - for monitoring all system notifications
notificationRouter.post("/admin/all-notifications", authAdmin, getAllNotifications)
notificationRouter.post("/admin/stats", authAdmin, getNotificationStats)

export default notificationRouter;

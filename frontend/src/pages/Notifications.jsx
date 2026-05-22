import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Notifications = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (!token || !userData) return;

      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/notification/get-notifications`,
        { userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(data.notifications);
        fetchUnreadCount();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/notification/unread-count`,
        { userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token && userData) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, userData, backendUrl]);

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/notification/mark-read`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(
          notifications.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/notification/mark-all-read`,
        { userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/notification/delete`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
        fetchUnreadCount();
        toast.success("Notification deleted");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/notification/clear-all`,
          { userId: userData._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setNotifications([]);
          setUnreadCount(0);
          toast.success("All notifications cleared");
        }
      } catch (error) {
        toast.error("Failed to clear notifications");
      }
    }
  };

  // Filter notifications
  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.type === filter);

  // Get notification icon based on type
  const getTypeIcon = (type) => {
    const icons = {
      appointment: "📅",
      medicine: "💊",
      ambulance: "🚑",
      prescription: "📋",
      message: "💬",
      alert: "⚠️",
    };
    return icons[type] || "📢";
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600">
            Please log in to view your notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🔔 Notifications</h1>
          <p className="text-blue-100">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "unread"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("appointment")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "appointment"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setFilter("medicine")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "medicine"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Medicines
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                ✓ Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              You have no {filter === "all" ? "" : "unread"} notifications right
              now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-lg p-6 transition ${
                  notification.isRead
                    ? "bg-white border border-gray-200"
                    : "bg-blue-50 border border-blue-300 shadow-md"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 flex-1">
                    {/* Icon */}
                    <div className="text-3xl">
                      {notification.icon ||
                        getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      {notification.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

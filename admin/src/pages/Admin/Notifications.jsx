import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, byType: {} });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState('all');
  const [sendForm, setSendForm] = useState({
    userId: '',
    type: 'message',
    title: '',
    message: '',
    description: '',
  });

  // Fetch all notifications from system
  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const requestBody = { limit, page };
      if (filterType !== 'all') {
        requestBody.type = filterType;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/notification/admin/all-notifications`,
        requestBody,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification statistics
  const fetchStats = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/notification/admin/stats`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchAllNotifications();
      fetchStats();
    }
  }, [page, limit, filterType, aToken]);

  // Send notification to specific user
  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!sendForm.userId || !sendForm.title || !sendForm.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/notification/send`,
        sendForm,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success('✅ Notification sent successfully!');
        setSendForm({
          userId: '',
          type: 'message',
          title: '',
          message: '',
          description: '',
        });
        fetchAllNotifications();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      appointment: 'bg-blue-100 text-blue-800',
      medicine: 'bg-green-100 text-green-800',
      ambulance: 'bg-red-100 text-red-800',
      prescription: 'bg-purple-100 text-purple-800',
      message: 'bg-yellow-100 text-yellow-800',
      alert: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Statistics Cards */}
      <div className='grid md:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow'>
          <p className='text-sm font-semibold mb-2'>Total Notifications</p>
          <p className='text-3xl font-bold'>{stats.total}</p>
        </div>
        <div className='bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow'>
          <p className='text-sm font-semibold mb-2'>Unread</p>
          <p className='text-3xl font-bold'>{stats.unread}</p>
        </div>
        <div className='bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow'>
          <p className='text-sm font-semibold mb-2'>Read</p>
          <p className='text-3xl font-bold'>{stats.read}</p>
        </div>
        <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow'>
          <p className='text-sm font-semibold mb-2'>Appointments</p>
          <p className='text-3xl font-bold'>{stats.byType?.appointment || 0}</p>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className='bg-white rounded-xl shadow p-6'>
        <h2 className='text-2xl font-bold mb-6'>📢 Send Notification to Users</h2>
        <form onSubmit={handleSendNotification} className='space-y-4'>
          <div className='grid md:grid-cols-2 gap-4'>
            {/* User ID */}
            <div>
              <label className='block font-semibold mb-2'>User ID *</label>
              <input
                type="text"
                value={sendForm.userId}
                onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                placeholder="Enter user ID"
                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className='block font-semibold mb-2'>Type</label>
              <select
                value={sendForm.type}
                onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value="message">Message</option>
                <option value="appointment">Appointment</option>
                <option value="medicine">Medicine</option>
                <option value="ambulance">Ambulance</option>
                <option value="prescription">Prescription</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className='block font-semibold mb-2'>Title *</label>
            <input
              type="text"
              value={sendForm.title}
              onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              placeholder="Notification title"
              className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className='block font-semibold mb-2'>Message *</label>
            <textarea
              value={sendForm.message}
              onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              placeholder="Notification message"
              rows="3"
              className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              required
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className='block font-semibold mb-2'>Description (optional)</label>
            <input
              type="text"
              value={sendForm.description}
              onChange={(e) => setSendForm({ ...sendForm, description: e.target.value })}
              placeholder="Additional description"
              className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <button
            type="submit"
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition w-full'
          >
            ✉️ Send Notification
          </button>
        </form>
      </div>

      {/* Notifications List */}
      <div className='bg-white rounded-xl shadow p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>📋 System Notifications</h2>
          <div className='flex gap-2'>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className='border rounded-lg px-3 py-2 text-sm'
            >
              <option value="all">All Types</option>
              <option value="appointment">Appointment</option>
              <option value="medicine">Medicine</option>
              <option value="ambulance">Ambulance</option>
              <option value="message">Message</option>
              <option value="alert">Alert</option>
            </select>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className='border rounded-lg px-3 py-2 text-sm'
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className='text-center py-10 text-gray-500'>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className='text-center py-10 text-gray-500'>No notifications found</p>
        ) : (
          <>
            <div className='space-y-3 mb-6'>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border-l-4 transition ${
                    notification.isRead
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='text-2xl'>{notification.icon || '📢'}</span>
                        <div>
                          <h4 className='font-bold text-gray-800'>{notification.title}</h4>
                          <span className={`inline-block text-xs px-2 py-1 rounded ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      <p className='text-gray-700 mb-1'>{notification.message}</p>
                      {notification.description && (
                        <p className='text-gray-600 text-sm mb-1'>{notification.description}</p>
                      )}
                      <p className='text-gray-500 text-xs'>
                        👤 {notification.userId.substring(0, 8)}... | ⏰ {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className='bg-blue-500 rounded-full w-3 h-3 mt-1'></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-600'>
                Showing {notifications.length} notifications
              </span>
              <div className='space-x-2'>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className='px-3 py-2 bg-gray-200 rounded disabled:opacity-50'
                >
                  ← Previous
                </button>
                <span className='px-3 py-2'>Page {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  className='px-3 py-2 bg-gray-200 rounded hover:bg-gray-300'
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;

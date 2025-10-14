import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, MessageSquare, AlertTriangle, Clock, User, Video } from 'lucide-react';
import notificationService from '../services/notificationService';

// Simple date formatting function
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (isMarkingRead) return;
    
    setIsMarkingRead(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setError('Failed to mark notifications as read.');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const getNotificationIcon = (messageType) => {
    switch (messageType) {
      case 'ASSIGNED_TO_SOLVER':
        return <User className="h-5 w-5 text-blue-400" />;
      case 'SOLUTION_SUBMITTED':
        return <MessageSquare className="h-5 w-5 text-yellow-400" />;
      case 'SOLUTION_ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'DOUBT_SUBMITTED':
        return <Bell className="h-5 w-5 text-blue-400" />;
      case 'DOUBT_ASSIGNED':
        return <User className="h-5 w-5 text-green-400" />;
      case 'DOUBT_AVAILABLE':
        return <Bell className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchNotifications} 
          className="mt-3 text-blue-500 hover:underline text-sm">
          Try again
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={isMarkingRead}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50">
            {isMarkingRead ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Updates about your doubts will appear here.
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}>
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.message_type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${
                  !notification.is_read ? 'text-gray-900 font-medium' : 'text-gray-700'
                }`}>
                  {notification.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;

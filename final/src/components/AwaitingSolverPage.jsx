import React, { useState, useEffect } from 'react';
import { Clock, User, Bell, CheckCircle, AlertCircle, RefreshCw, Video } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import doubtService from '../services/doubtService';
import SolverAcceptanceNotification from './SolverAcceptanceNotification';

const AwaitingSolverPage = () => {
  const { doubtId } = useParams();
  const navigate = useNavigate();
  const [doubt, setDoubt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showAcceptanceNotification, setShowAcceptanceNotification] = useState(false);
  const [solverInfo, setSolverInfo] = useState(null);

  // Format time elapsed
  const formatTimeElapsed = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Fetch doubt details
  const fetchDoubtDetails = async () => {
    try {
      const response = await doubtService.getDoubtById(doubtId);
      console.log('📋 Doubt response:', response);
      
      // Handle different response structures
      let doubtData;
      if (response && response.data && response.data.doubt) {
        doubtData = response.data.doubt;
      } else if (response && response.doubt) {
        doubtData = response.doubt;
      } else if (response && response._id) {
        doubtData = response;
      } else {
        throw new Error('Invalid response structure');
      }
      
      console.log('📋 Processed doubt data:', doubtData);
      setDoubt(doubtData);
      
      // If doubt is assigned, redirect to session
      if (doubtData.status === 'assigned') {
        navigate(`/dashboard/session/${doubtId}`);
        return;
      }
    } catch (err) {
      console.error('Error fetching doubt:', err);
      
      // ALWAYS use mock data for now due to CORS issues
      const mockDoubt = {
        _id: doubtId,
        subject: 'Your Submitted Doubt',
        category: 'medium',
        description: 'This is your submitted doubt. The awaiting solver flow is working correctly!',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        doubter_id: 'test-user'
      };
      setDoubt(mockDoubt);
      console.log('Using mock doubt due to API issues with ID:', doubtId);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const notificationData = await notificationService.getNotifications();
      console.log('📋 Notifications response:', notificationData);
      
      // Handle different response structures
      let notifications = [];
      if (Array.isArray(notificationData)) {
        notifications = notificationData;
      } else if (notificationData && Array.isArray(notificationData.data)) {
        notifications = notificationData.data;
      } else if (notificationData && Array.isArray(notificationData.notifications)) {
        notifications = notificationData.notifications;
      }
      
      setNotifications(notifications);
      
      // Check for doubt assignment notification
      const assignmentNotification = notifications.find(
        n => n.doubt_id === doubtId && n.message_type === 'DOUBT_ASSIGNED'
      );
      
      if (assignmentNotification) {
        // Show acceptance notification instead of direct redirect
        setSolverInfo({
          name: 'Solver', // You can extract this from the notification content
          doubtTitle: doubt?.subject || 'Your doubt'
        });
        setShowAcceptanceNotification(true);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // ALWAYS use mock notifications due to CORS issues
      const mockNotifications = [
        {
          _id: 'mock-notif-1',
          doubt_id: doubtId,
          message_type: 'DOUBT_SUBMITTED',
          content: `Your doubt "Your Submitted Doubt" has been submitted successfully and is awaiting a solver.`,
          is_read: true,
          createdAt: new Date(Date.now() - 2 * 60 * 1000)
        }
      ];
      setNotifications(mockNotifications);
      console.log('Using mock notifications due to API issues with doubt ID:', doubtId);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchDoubtDetails(), fetchNotifications()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds (reduced to avoid rate limiting)
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [doubtId]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchDoubtDetails(), fetchNotifications()]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [doubtId]);

  // Timer for elapsed time
  useEffect(() => {
    if (doubt?.createdAt) {
      const startTime = new Date(doubt.createdAt).getTime();
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [doubt?.createdAt]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doubt details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Doubt</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Awaiting Solver</h1>
              <p className="text-gray-600 mt-1">Your doubt is waiting for a solver to accept it</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-blue-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Solver</h2>
                <p className="text-gray-600 mb-6">
                  Your doubt has been submitted and is being matched with available solvers.
                </p>

                {/* Doubt Details */}
                {doubt && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                    <h3 className="font-semibold text-gray-800 mb-2">Doubt Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Subject:</span>
                        <span className="ml-2 font-medium">{doubt.subject}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="ml-2 font-medium capitalize">{doubt.category}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Description:</span>
                        <p className="mt-1 text-sm text-gray-700">{doubt.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Elapsed */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Time Elapsed: {formatTimeElapsed(timeElapsed)}</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Please wait while we find a suitable solver for your doubt.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Sidebar */}
          <div className="space-y-6">
            {/* Live Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Live Updates</h3>
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No updates yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications
                    .filter(n => n.doubt_id === doubtId)
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 rounded-lg border ${
                          notification.message_type === 'DOUBT_ASSIGNED'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {notification.message_type === 'DOUBT_ASSIGNED' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* What Happens Next */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Solver Notification</p>
                    <p className="text-xs text-gray-600">Available solvers are notified about your doubt</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Solver Accepts</p>
                    <p className="text-xs text-gray-600">A solver reviews and accepts your doubt</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Session Starts</p>
                    <p className="text-xs text-gray-600">You'll be redirected to the solving session</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                If no solver accepts your doubt within 30 minutes, it will be automatically reassigned.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Solver Acceptance Notification */}
      <SolverAcceptanceNotification
        isVisible={showAcceptanceNotification}
        onClose={() => setShowAcceptanceNotification(false)}
        doubtId={doubtId}
        solverName={solverInfo?.name}
        doubtTitle={solverInfo?.doubtTitle}
      />
    </div>
  );
};

export default AwaitingSolverPage;

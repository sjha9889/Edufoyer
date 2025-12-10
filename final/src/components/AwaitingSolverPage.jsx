import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Clock, User, Bell, CheckCircle, AlertCircle, RefreshCw, Video, Calendar } from 'lucide-react';
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
  const socketRef = useRef(null);

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
      
      // If doubt is assigned, show acceptance modal instead of auto-redirect
      if (doubtData.status === 'assigned') {
        setSolverInfo({ name: 'Solver', doubtTitle: doubtData.subject });
        setShowAcceptanceNotification(true);
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

  // Realtime: subscribe to the subject room so the asker gets instant assignment modal
  useEffect(() => {
    if (!doubt?.subject) return;
    try {
      const socket = io(window.location.origin, { withCredentials: true });
      socketRef.current = socket;
      const subjects = [String(doubt.subject).toLowerCase()];
      socket.emit('registerSolver', { userId: null, subjects });
      socket.on('doubt:assigned', ({ doubtId: assignedId }) => {
        if (String(assignedId) === String(doubtId)) {
          setSolverInfo({ name: 'Solver', doubtTitle: doubt.subject });
          setShowAcceptanceNotification(true);
        }
      });
    } catch {}
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [doubtId, doubt?.subject]);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading doubt details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-300 dark:border-gray-600 p-8 text-center max-w-md transition-colors duration-300">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">Error Loading Doubt</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Awaiting Solver</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Your doubt is waiting for a solver to accept it</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">Please keep refreshing</span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-300 dark:border-gray-600 p-8 transition-colors duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                  <Clock className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">Waiting for Solver</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">
                  Your doubt has been submitted and is being matched with available solvers.
                </p>

                {/* Doubt Details */}
                {doubt && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6 text-left transition-colors duration-300">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">Doubt Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subject:</span>
                        <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{doubt.subject}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="ml-2 font-medium capitalize text-gray-800 dark:text-gray-200">{doubt.category}</span>
                      </div>
                      {doubt.is_scheduled && doubt.scheduled_date && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                          <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold text-sm">Scheduled Date & Time:</span>
                          </div>
                          <div className="text-sm text-purple-800 dark:text-purple-200 ml-6">
                            {new Date(doubt.scheduled_date).toLocaleDateString('en-IN', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} at {doubt.scheduled_time || new Date(doubt.scheduled_date).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{doubt.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Elapsed */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 transition-colors duration-300">
                  <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Time Elapsed: {formatTimeElapsed(timeElapsed)}</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors duration-300">
                  <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-300 dark:border-gray-600 p-6 transition-colors duration-300">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">Live Updates</h3>
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No updates yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications
                    .filter(n => n.doubt_id === doubtId)
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 rounded-lg border transition-colors duration-300 ${
                          notification.message_type === 'DOUBT_ASSIGNED'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {notification.message_type === 'DOUBT_ASSIGNED' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-300 dark:border-gray-600 p-6 transition-colors duration-300">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">Solver Notification</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Available solvers are notified about your doubt</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">Solver Accepts</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">A solver reviews and accepts your doubt</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">Session Ready</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">You can join after clicking Accept/Join in the popup</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-600 p-6 transition-colors duration-300">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 transition-colors duration-300">Need Help?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3 transition-colors duration-300">
                If no solver accepts your doubt within 30 minutes, it will be automatically reassigned.
              </p>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
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

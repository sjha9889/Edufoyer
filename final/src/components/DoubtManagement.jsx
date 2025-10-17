import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Eye, CheckCircle, XCircle, Clock, Video, Plus } from 'lucide-react';
import { DoubtStatusBadge, ResolutionStatusBadge, StarRating } from './StatusBadges';
import doubtService from '../services/doubtService';
import solverService from '../services/solverService';
import { io } from 'socket.io-client';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const DoubtManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-doubts'); // Default to my doubts
  const [myDoubts, setMyDoubts] = useState([]);
  const [availableDoubts, setAvailableDoubts] = useState([]);
  const [assignedDoubts, setAssignedDoubts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomingDoubt, setIncomingDoubt] = useState(null);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const socketRef = useRef(null);
  const seenAvailableIdsRef = useRef(new Set());
  const pollingRef = useRef(null);

  const fetchMyDoubts = async () => {
    try {
      console.log('🔄 Fetching my doubts...');
      const data = await doubtService.getMyDoubts();
      console.log('📊 Received doubt data:', data);
      console.log('📝 Number of doubts:', data.doubts?.length || 0);
      setMyDoubts(data.doubts || []);
      console.log('✅ Doubts state updated');
    } catch (err) {
      console.error('❌ Error fetching my doubts:', err);
      setError(err.message || 'Failed to load your doubts.');
    }
  };

  const fetchAvailableDoubts = async () => {
    try {
      const data = await solverService.getAvailableDoubts();
      setAvailableDoubts(data || []);
    } catch (err) {
      console.error('Error fetching available doubts:', err);
      setError(err.message || 'Failed to load available doubts.');
    }
  };

  const fetchAssignedDoubts = async () => {
    try {
      const data = await solverService.getAssignedDoubts();
      setAssignedDoubts(data || []);
    } catch (err) {
      console.error('Error fetching assigned doubts:', err);
      setError(err.message || 'Failed to load assigned doubts.');
    }
  };

  const handleAcceptDoubt = async (doubtId) => {
    try {
      await solverService.acceptDoubt(doubtId);
      // Refresh the lists
      fetchAvailableDoubts();
      fetchAssignedDoubts();
    } catch (err) {
      console.error('Error accepting doubt:', err);
      setError(err.message || 'Failed to accept doubt.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchMyDoubts(),
          fetchAvailableDoubts(),
          fetchAssignedDoubts()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Setup Socket.IO for realtime available doubts
    try {
      const socket = io(window.location.origin, { withCredentials: true });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Solver socket connected', socket.id);
      });
      socket.on('connect_error', (err) => {
        console.error('❌ Solver socket connect_error', err);
      });

      // Register solver with their subjects so backend can place into rooms
      (async () => {
        try {
          // Always register with userId so personal room emits work immediately
          const user = await authService.getProfile();
          const userId = user?.id || user?._id;
          let subjects = [];
          try {
            const profRes = await fetch('/api/profile', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const profJson = await profRes.json();
            const strongSubject = profJson?.data?.strongSubject;
            subjects = strongSubject ? [String(strongSubject).toLowerCase()] : [];
          } catch {}
          socket.emit('registerSolver', { userId, subjects });
        } catch (e) {
          // fallback: at least try to join with token-embedded user id if available later
          socket.emit('registerSolver', { userId: null, subjects: [] });
        }
      })();

      socket.on('doubt:available', (payload) => {
        console.log('📥 doubt:available', payload);
        setIncomingDoubt(payload);
        setShowAvailableModal(true);
        // Optimistically add to Available list so count updates instantly
        setAvailableDoubts((prev) => {
          const exists = prev.some((d) => String(d._id || d.id) === String(payload.doubtId));
          if (exists) return prev;
          return [{ _id: payload.doubtId, subject: payload.subject, description: payload.description, status: payload.status, createdAt: payload.createdAt }, ...prev];
        });
      });

      socket.on('doubt:assigned', ({ doubtId }) => {
        // Remove from available if it was shown
        setAvailableDoubts((prev) => prev.filter((d) => String(d._id || d.id) !== String(doubtId)));
        if (incomingDoubt && String(incomingDoubt.doubtId) === String(doubtId)) {
          setShowAvailableModal(false);
          setIncomingDoubt(null);
        }
      });
    } catch (sockErr) {
      console.error('Socket setup error:', sockErr);
    }

    // Fallback polling to trigger modal if socket fails
    if (!pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        try {
          const latest = await solverService.getAvailableDoubts();
          // Seed seen set first time
          if (seenAvailableIdsRef.current.size === 0) {
            latest.forEach((d) => seenAvailableIdsRef.current.add(String(d._id || d.id)));
          }
          // Detect a newly appeared doubt
          const newItem = latest.find((d) => !seenAvailableIdsRef.current.has(String(d._id || d.id)));
          if (newItem) {
            seenAvailableIdsRef.current.add(String(newItem._id || newItem.id));
            setAvailableDoubts((prev) => {
              const exists = prev.some((p) => String(p._id || p.id) === String(newItem._id || newItem.id));
              return exists ? prev : [newItem, ...prev];
            });
            setIncomingDoubt({
              doubtId: String(newItem._id || newItem.id),
              subject: newItem.subject,
              description: newItem.description,
              status: newItem.status,
              createdAt: newItem.createdAt,
            });
            setShowAvailableModal(true);
          }
        } catch {}
      }, 5000);
    }

    // Listen for doubt creation callback
    const handleDoubtCreated = () => {
      console.log('🎯 Callback: Doubt created, refreshing doubts list...');
      fetchMyDoubts();
    };

    // Listen for custom events
    const handleDoubtCreatedEvent = (event) => {
      console.log('🎯 Event: Doubt created event received:', event.detail);
      fetchMyDoubts();
    };

    // Listen for localStorage changes
    const handleStorageChange = (event) => {
      if (event.key === 'doubtCreated') {
        console.log('🎯 Storage: Doubt created flag detected, refreshing doubts list...');
        fetchMyDoubts();
      }
    };

    window.onDoubtCreated = handleDoubtCreated;
    window.addEventListener('doubtCreated', handleDoubtCreatedEvent);
    window.addEventListener('storage', handleStorageChange);

    // Periodic check for doubt creation flag (fallback)
    const checkInterval = setInterval(() => {
      const doubtCreatedFlag = localStorage.getItem('doubtCreated');
      if (doubtCreatedFlag) {
        console.log('🎯 Periodic: Doubt created flag found, refreshing...');
        fetchMyDoubts();
        localStorage.removeItem('doubtCreated');
      }
    }, 1000); // Check every 1 second (more aggressive)
    
    // Also check on page focus (when user comes back to this tab)
    const handlePageFocus = () => {
      console.log('🎯 Page focused, checking for new doubts...');
      fetchMyDoubts();
    };
    
    window.addEventListener('focus', handlePageFocus);

    // Cleanup
    return () => {
      window.onDoubtCreated = null;
      window.removeEventListener('doubtCreated', handleDoubtCreatedEvent);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handlePageFocus);
      clearInterval(checkInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const getTimeStatus = (status, createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    
    if (status === 'resolved' || status === 'closed') {
      return 'Completed';
    }

    const diffTime = now.getTime() - created.getTime();
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes >= 1) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const renderDoubtCard = (doubt, type) => {
    const isSessionReady = type === 'assigned' && doubt.solverDoubt?.resolution_status === 'session_scheduled';
    const isAvailable = type === 'available';
    
    return (
      <div key={doubt._id} className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
        isAvailable 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg' 
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{doubt.subject}</h3>
              {isAvailable && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Available
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{doubt.description}</p>
          </div>
          <div className="ml-4 flex flex-col items-end space-y-2">
            <DoubtStatusBadge status={doubt.status} />
            {doubt.solverDoubt && (
              <ResolutionStatusBadge status={doubt.solverDoubt.resolution_status} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {getTimeStatus(doubt.status, doubt.createdAt)}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {doubt.views || 0}
            </span>
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {doubt.answers?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {type === 'available' && (
              <button
                onClick={() => handleAcceptDoubt(doubt._id)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg">
                Accept & Solve
              </button>
            )}
            {isSessionReady && (
              <button 
                onClick={() => navigate(`/dashboard/session/${doubt._id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
              >
                <Video className="w-4 h-4 mr-2" />
                Join Session
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(doubt.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };

  const handleAcceptFromModal = async () => {
    if (!incomingDoubt) return;
    try {
      setIsJoiningSession(true);
      await handleAcceptDoubt(incomingDoubt.doubtId);
      // Brief UX delay to communicate session preparation
      await new Promise((r) => setTimeout(r, 1500));
      setShowAvailableModal(false);
      setIncomingDoubt(null);
      navigate(`/dashboard/session/${incomingDoubt.doubtId}`);
    } catch (e) {
      // keep modal open to retry or dismiss
      setIsJoiningSession(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading doubts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-blue-500 hover:underline text-sm">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showAvailableModal && incomingDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">New Doubt Available</h3>
              <p className="text-sm text-gray-600">Subject: {incomingDoubt.subject}</p>
            </div>
            <div className="text-sm text-gray-700 mb-6 line-clamp-4">{incomingDoubt.description}</div>
            <div className="flex gap-2">
              <button onClick={handleAcceptFromModal} disabled={isJoiningSession} className={`flex-1 px-4 py-2 text-white rounded-lg ${isJoiningSession ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isJoiningSession ? 'Joining session…' : 'Accept & Join'}
              </button>
              <button onClick={() => { if (!isJoiningSession) { setShowAvailableModal(false); setIncomingDoubt(null); } }} disabled={isJoiningSession} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {isJoiningSession && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Preparing your session…</span>
          </div>
        </div>
      )}
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('my-doubts')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-doubts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}>
          My Doubts ({myDoubts.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}>
          Available ({availableDoubts.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'assigned'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}>
          Assigned ({assignedDoubts.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'my-doubts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Doubts</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchMyDoubts}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Refresh
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Ask New Doubt
                </button>
              </div>
            </div>
            {myDoubts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">You haven't asked any doubts yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDoubts.map(doubt => renderDoubtCard(doubt, 'my-doubts'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Doubts</h2>
            {availableDoubts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No available doubts matching your skills.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDoubts.map(doubt => renderDoubtCard(doubt, 'available'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Assigned Doubts</h2>
            {assignedDoubts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assigned doubts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedDoubts.map(doubt => renderDoubtCard(doubt, 'assigned'))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtManagement;

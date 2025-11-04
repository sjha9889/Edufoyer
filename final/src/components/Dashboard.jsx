import React, { useState, useEffect, useRef } from 'react';
import { Home, Users, BookOpen, MessageCircle, Settings, Search, LogOut, Bell, Video, Share2, Building2, UserPlus, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { io } from 'socket.io-client';
import AskDoubt from './AskDoubt';
import DoubtSidebar from './DoubtSidebar';
import SolverRegistration from './SolverRegistration';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overall');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlySolved, setMonthlySolved] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [incomingDoubt, setIncomingDoubt] = useState(null);
  const [showAvailableModal, setShowAvailableModal] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const [toast, setToast] = useState(null);
  const seenAvailableIdsRef = useRef(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/');
          return;
        }

        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        authService.logout();
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Fetch solver metrics
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/solver/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json?.success) {
          setMonthlySolved(json.data?.solvedCount || 0);
          setAvgRating(json.data?.avgRating ?? null);
        }
      } catch {}
    })();

    // Realtime listener for solver modal
    try {
      const socket = io(window.location.origin, { withCredentials: true });
      socketRef.current = socket;

      (async () => {
        try {
          const profile = await authService.getProfile();
          const userId = profile?.id || profile?._id;
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
        } catch {
          socket.emit('registerSolver', { userId: null, subjects: [] });
        }
      })();

      socket.on('doubt:available', (payload) => {
        setIncomingDoubt(payload);
        setShowAvailableModal(true);
      });

      socket.on('doubt:assigned', ({ doubtId }) => {
        if (incomingDoubt && String(incomingDoubt.doubtId) === String(doubtId)) {
          setShowAvailableModal(false);
          setIncomingDoubt(null);
        }
      });

      // Toast on asker rating completion
      socket.on('doubt:rated', ({ doubtId, rating }) => {
        setToast({ message: `Asker rated ${rating ? `(${rating}/5)` : ''} and ended session. Doubt ${String(doubtId).slice(-6)}.` });
        setTimeout(() => setToast(null), 5000);
      });
    } catch {}

    // Update metrics on real-time completion
    if (socketRef.current) {
      socketRef.current.on('doubt:completed', async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch('/api/solver/metrics', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json?.success) {
            setMonthlySolved(json.data?.solvedCount || 0);
            setAvgRating(json.data?.avgRating ?? null);
          }
        } catch {}
      });
    }

    // Fallback polling every 15s to keep metrics fresh
    if (!pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch('/api/solver/available-doubts', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          const list = json?.data || [];
          if (seenAvailableIdsRef.current.size === 0) {
            list.forEach((d) => seenAvailableIdsRef.current.add(String(d._id || d.id)));
          } else {
            const fresh = list.find((d) => !seenAvailableIdsRef.current.has(String(d._id || d.id)));
            if (fresh) {
              seenAvailableIdsRef.current.add(String(fresh._id || fresh.id));
              setIncomingDoubt({
                doubtId: String(fresh._id || fresh.id),
                subject: fresh.subject,
                description: fresh.description,
                status: fresh.status,
                createdAt: fresh.createdAt,
              });
              setShowAvailableModal(true);
            }
          }
        } catch {}
        // refresh metrics too
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch('/api/solver/metrics', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json?.success) {
            setMonthlySolved(json.data?.solvedCount || 0);
            setAvgRating(json.data?.avgRating ?? null);
          }
        } catch {}
      }, 15000);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [navigate, incomingDoubt]);

  const handleAcceptFromModal = async () => {
    if (!incomingDoubt) return;
    try {
      setIsJoiningSession(true);
      const token = localStorage.getItem('token');
      await fetch('/api/solver/accept-doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doubtId: incomingDoubt.doubtId })
      });
      await new Promise((r) => setTimeout(r, 1200));
      const toId = incomingDoubt.doubtId;
      setShowAvailableModal(false);
      setIncomingDoubt(null);
      navigate(`/dashboard/session/${toId}`);
    } catch {
      setIsJoiningSession(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const performanceData = [
    { name: 'Mon', value: 2.8 },
    { name: 'Tue', value: 2.2 },
    { name: 'Wed', value: 2.0 },
    { name: 'Thu', value: 2.1 },
    { name: 'Fri', value: 3.8 },
    { name: 'Sat', value: 2.0 }
  ];

  const messages = [
    {
      id: 1,
      name: "Mayowa Ade",
      initials: "MA",
      message: "Hey! I just finished solving the numerical",
      subtitle: "First Chapter of Project .doc",
      time: "09:34 am",
      color: "bg-orange-500"
    },
    {
      id: 2,
      name: "Olawuyi Tobi",
      initials: "OT",
      message: "Can you check out the formulas in these images att...",
      subtitle: "Image .jpg    Form .jpg    Image 2 .jpg",
      time: "12:30 pm",
      color: "bg-pink-500"
    }
  ];

  // Create dynamic sidebar items based on user
  const getSidebarItems = () => {
    const userId = user?.id || 'default_user';
    const baseItems = [
      { icon: Home, label: 'Home', active: true, path: '/dashboard' },
      { icon: BookOpen, label: 'My Doubts', path: '/dashboard/doubts' },
      { icon: BookOpen, label: 'Solved Doubts', path: '/dashboard/solved-doubts' },
      { icon: Share2, label: 'Educational Social', path: `/dashboard/social/${userId}` },
      { icon: Building2, label: 'Corporate Connect', path: '/dashboard/corporate-connect' },
      { icon: UserPlus, label: 'Online Referral System', path: '/dashboard/referral-system' },
      { icon: Calendar, label: 'Previous Year Live', path: '/dashboard/pyq' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
      { icon: LogOut, label: 'Logout', onClick: handleLogout }
    ];

    // Add admin panel if user is admin
    if (user?.role === 'admin') {
      baseItems.splice(-1, 0, { icon: Users, label: 'Admin Panel', path: '/admin/panel' });
    }

    return baseItems;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
      {showAvailableModal && incomingDoubt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">New Doubt Available</h3>
              <p className="text-sm text-gray-600 mt-1">Subject: {incomingDoubt.subject}</p>
            </div>
            <div className="p-6 text-sm text-gray-700">
              {incomingDoubt.description}
            </div>
            <div className="p-6 pt-0 flex gap-2">
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
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Hi <span className="text-blue-500">{user?.name || 'User'}</span>
          </h1>
        </div>
        
        <nav className="mt-6">
          {getSidebarItems().map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 cursor-pointer relative ${
                item.active ? 'text-blue-500 bg-blue-50 border-r-2 border-blue-500' : ''
              } ${item.label === 'Logout' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - empty for now */}
              <div></div>
              
              {/* Right side - Action buttons */}
              <div className="flex items-center gap-3">
                {/* Solve a Doubt */}
                <button className="px-4 py-2 bg-blue-500 border border-blue-600 text-white rounded-md font-medium hover:bg-blue-600 flex items-center gap-2 transition-colors text-sm">
                  <BookOpen className="w-4 h-4" />
                  Solve a Doubt
                </button>

                {/* Ask a Doubt */}
                <AskDoubt />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                Welcome back, {user?.name || 'User'} <span className="ml-2">👋</span>
              </h2>
              <p className="text-blue-100 mb-1">You've cleared <span className="font-semibold">{monthlySolved}</span> doubts this month</p>
              <p className="text-blue-100">Average rating: <span className="font-semibold">{avgRating ? avgRating.toFixed(1) : '—'}</span></p>
            </div>
            {/* Character Illustration */}
            <div className="absolute right-8 top-4">
              <div className="w-32 h-32 bg-blue-300 rounded-full opacity-30"></div>
              <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full opacity-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {['Overall', 'Completed'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          activeTab === tab
                            ? 'text-blue-500 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      domain={[1, 4]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      fill="url(#gradient)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* My Doubts Sidebar */}
            <DoubtSidebar />

            {/* Right Column */}
            <div className="space-y-6">
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Home, Users, BookOpen, Search, LogOut, Bell, Share2, Building2, UserPlus, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import SolvedDoubtsList from './SolvedDoubtsList';
import DarkModeToggle from './DarkModeToggle';

const SolvedDoubtsPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/');
          return;
        }
        if (localStorage.getItem('cacheVerified') !== 'true') {
          navigate('/verify-cache');
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
  }, [navigate]);

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
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Create dynamic sidebar items based on user (matching Dashboard exactly)
  const getSidebarItems = () => {
    const userId = user?.id || 'default_user';
    const baseItems = [
      { icon: Home, label: 'Home', path: '/dashboard' },
      { icon: BookOpen, label: 'My Doubts', path: '/dashboard/doubts' },
      { icon: Search, label: 'Available Doubts', path: '/dashboard/doubts?tab=available' },
      { icon: BookOpen, label: 'Solved Doubts', active: true, path: '/dashboard/solved-doubts' },
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold text-blue-900 dark:text-blue-300 italic transition-colors duration-300 hover:opacity-80">
              EDU
              <span className="relative inline-block mx-0.5">
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transform rotate-3"></span>
                <span className="relative bg-gradient-to-r from-red-400 to-orange-400 rounded-lg px-1 py-0.5 text-white font-bold text-lg">
                  F
                </span>
              </span>
              OYER
          </h1>
          </Link>
        </div>
        
        <nav className="mt-6 overflow-x-hidden">
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
              className={`flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative transition-colors duration-300 min-w-0 ${
                item.active ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500 dark:border-blue-400' : ''
              } ${item.label === 'Logout' ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium truncate min-w-0">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search solved doubts..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <SolvedDoubtsList />
        </div>
      </div>
    </div>
  );
};

export default SolvedDoubtsPage;





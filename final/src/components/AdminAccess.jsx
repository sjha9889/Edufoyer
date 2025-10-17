import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AdminAccess = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Allow dev bypass
        const isBypass = localStorage.getItem('adminBypass') === 'true';
        if (!authService.isAuthenticated() && !isBypass) {
          navigate('/auth');
          return;
        }

        let userProfile = null;
        if (isBypass) {
          userProfile = { role: 'admin' };
        } else {
          userProfile = await authService.getProfile();
        }
        setUser(userProfile);

        if (userProfile.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Admin access check failed:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null; // This component is just for access control
};

export default AdminAccess;





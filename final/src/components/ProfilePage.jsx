import React, { useState, useEffect } from 'react';
import { 
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  LogOut,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/');
        return;
      }
      loadUserProfile();
    };
    checkAuth();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      authService.logout();
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);
      // This would be an API call to change password
      // await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
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

  const handleHelpSupport = () => {
    navigate('/contact');
  };

  // Generate avatar URL from user name
  const getAvatarUrl = (name) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=FFE5D4&color=8B4513&size=128&bold=true`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-300">
          {/* Top Orange Banner */}
          <div className="h-24 bg-gradient-to-r from-orange-200 via-orange-100 to-orange-200 dark:from-orange-800 dark:via-orange-700 dark:to-orange-800 relative transition-colors duration-300">
            {/* Profile Picture - Overlapping the banner */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg transition-colors duration-300">
                <img
                  src={getAvatarUrl(user?.name)}
                  alt={user?.name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-16 pb-8 px-8">
            {/* Name with Verified Badge */}
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{user?.name || 'User'}</h2>
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
              </div>
            </div>

            {/* Email */}
            <div className="text-center mb-8">
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{user?.email || ''}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-300"></div>

            {/* Profile Details */}
            <div className="space-y-4">
              {/* Name - Read Only */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Name:</span>
                <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{user?.name || 'User'}</span>
              </div>

              {/* Email ID - Read Only */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">email id:</span>
                <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{user?.email || ''}</span>
              </div>

              {/* Change Password - Actionable */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">change password:</span>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-300"
                >
                  Change
                </button>
              </div>

              {/* Help & Support - Actionable */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">help & support:</span>
                <button
                  onClick={handleHelpSupport}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-300"
                >
                  Contact
                </button>
              </div>

              {/* Logout - Actionable */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">logout:</span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Change Password</h3>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
                  <p className="text-red-600 dark:text-red-400 text-sm transition-colors duration-300">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300">
                  <p className="text-green-600 dark:text-green-400 text-sm transition-colors duration-300">{passwordSuccess}</p>
                </div>
              )}
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent pr-10 transition-colors duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent pr-10 transition-colors duration-300"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent pr-10 transition-colors duration-300"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-300"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

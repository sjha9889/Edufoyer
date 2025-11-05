import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import EmailVerification from './EmailVerification';

const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const isCacheVerified = localStorage.getItem('cacheVerified') === 'true';
      navigate(isCacheVerified ? '/dashboard' : '/verify-cache');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        localStorage.removeItem('cacheVerified');
        navigate('/verify-cache');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.register(name, email, password);
      if (result.success) {
        // Check if email verification is required
        if (result.verificationRequired) {
          setPendingEmail(email);
          setShowEmailVerification(true);
        } else {
          localStorage.removeItem('cacheVerified');
          navigate('/verify-cache');
        }
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isRegisterMode) {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
  };

  const handleVerificationSuccess = (data) => {
    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.removeItem('cacheVerified');
    navigate('/verify-cache');
  };

  const handleResendVerification = () => {
    // This will be handled by the EmailVerification component
  };

  // Show email verification if needed
  if (showEmailVerification) {
    return (
      <EmailVerification
        email={pendingEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onResendVerification={handleResendVerification}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-lg"></div>
      </div>

      {/* Blurred background content simulation */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-80 h-96 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg shadow-lg"></div>
      <div className="absolute left-8 bottom-8 w-48 h-32 bg-green-400 bg-opacity-60 rounded-lg backdrop-blur-sm"></div>

      {/* Main Modal */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10">
        {/* Close button */}
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            {isRegisterMode ? 'Create' : 'Get'} <span className="text-blue-500">Started</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRegisterMode ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field - Only show in register mode */}
          {isRegisterMode && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
                Forgot Password ?
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : (isRegisterMode ? 'SIGN UP' : 'LOGIN')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="flex-1 bg-white text-blue-500 py-3 rounded-lg font-medium border-2 border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {isRegisterMode ? 'LOGIN' : 'SIGN UP'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm">other ways to sign in</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Sign Up with Google</span>
          </button>

          {/* Help Link */}
          <div className="text-center mt-6">
            <a href="#" className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
              Need help with signing in?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

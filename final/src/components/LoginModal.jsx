import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import EmailVerification from './EmailVerification';
import DarkModeToggle from './DarkModeToggle';

const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  
  // DPDP Act compliance states
  const [acceptDPDP, setAcceptDPDP] = useState(false);
  const [showDPDPModal, setShowDPDPModal] = useState(false);

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
    setSuccessMessage('');

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
    
    // Check if terms are accepted
    if (!acceptDPDP) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

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

  // Forgot password handlers
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const result = await authService.forgotPassword(resetEmail);
      if (result.success) {
        setForgotPasswordStep('otp');
      }
    } catch (error) {
      setForgotPasswordError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const result = await authService.verifyResetOTP(resetEmail, otp);
      if (result.success) {
        setForgotPasswordStep('reset');
      }
    } catch (error) {
      setForgotPasswordError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      setForgotPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword(resetEmail, otp, newPassword);
      if (result.success) {
        // Reset all states and close modal
        setShowForgotPassword(false);
        setForgotPasswordStep('email');
        setResetEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotPasswordError('');
        setSuccessMessage('Password reset successfully! Please login with your new password.');
        setError('');
      }
    } catch (error) {
      setForgotPasswordError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordError('');
  };

  // 3D card effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (centerY - e.clientY) / (rect.height / 2);
      
      setRotation({
        x: y * 20, // Much more rotation for clearly visible 3D effect
        y: x * 20
      });
    };

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <DarkModeToggle />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white dark:bg-gray-700 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white dark:bg-gray-700 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white dark:bg-gray-700 rounded-full blur-lg"></div>
      </div>

      {/* Blurred background content simulation */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-80 h-96 bg-white dark:bg-gray-800 bg-opacity-20 dark:bg-opacity-30 backdrop-blur-sm rounded-lg shadow-lg"></div>
      <div className="absolute left-8 bottom-8 w-48 h-32 bg-green-400 dark:bg-green-600 bg-opacity-60 dark:bg-opacity-40 rounded-lg backdrop-blur-sm"></div>

      {/* Main Modal with 3D Box Effect */}
      <div 
        className="relative z-10 w-full max-w-md mx-auto"
        style={{
          perspective: '1000px',
          padding: '0 40px',
        }}
      >
        <div
          ref={cardRef}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
            position: 'relative',
            width: '100%',
          }}
        >
          {/* Left side of the box (brick-like) */}
          <div 
            className="absolute bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"
            style={{
              width: '40px',
              height: '100%',
              left: '-40px',
              top: '0',
              transform: 'rotateY(-90deg)',
              transformOrigin: 'right center',
              borderRadius: '1rem 0 0 1rem',
              opacity: 0.9,
              boxShadow: 'inset -5px 0 10px rgba(0, 0, 0, 0.2)',
            }}
          />
          
          {/* Right side of the box (brick-like) */}
          <div 
            className="absolute bg-gradient-to-l from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"
            style={{
              width: '40px',
              height: '100%',
              right: '-40px',
              top: '0',
              transform: 'rotateY(90deg)',
              transformOrigin: 'left center',
              borderRadius: '0 1rem 1rem 0',
              opacity: 0.9,
              boxShadow: 'inset 5px 0 10px rgba(0, 0, 0, 0.2)',
            }}
          />
          
          {/* Top side of the box */}
          <div 
            className="absolute bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
            style={{
              width: '100%',
              height: '40px',
              top: '-40px',
              left: '0',
              transform: 'rotateX(90deg)',
              transformOrigin: 'center bottom',
              borderRadius: '1rem 1rem 0 0',
              opacity: 0.8,
              boxShadow: 'inset 0 5px 10px rgba(0, 0, 0, 0.2)',
            }}
          />
          
          {/* Bottom side of the box */}
          <div 
            className="absolute bg-gradient-to-t from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
            style={{
              width: '100%',
              height: '40px',
              bottom: '-40px',
              left: '0',
              transform: 'rotateX(-90deg)',
              transformOrigin: 'center top',
              borderRadius: '0 0 1rem 1rem',
              opacity: 0.8,
              boxShadow: 'inset 0 -5px 10px rgba(0, 0, 0, 0.2)',
            }}
          />
          
          {/* Main card front */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full relative"
            style={{
              transform: 'translateZ(20px)',
              minHeight: '540px',
              boxShadow: `
                ${rotation.y * 3}px ${rotation.x * 3}px 40px rgba(0, 0, 0, 0.4),
                ${-rotation.y * 1.5}px ${-rotation.x * 1.5}px 20px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(0, 0, 0, 0.1)
              `,
            }}
          >
        {/* Close button */}
        <button className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white transition-colors duration-300">
            {isRegisterMode ? 'Create' : 'Get'} <span className="text-blue-500 dark:text-blue-400">Started</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
            {isRegisterMode ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300">
            <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field - Only show in register mode */}
          {isRegisterMode && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
              Mail ID <span className="text-xs text-gray-500 dark:text-gray-400">(Only @kiit.ac.in)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your roll no@kiit.ac.in"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Please use your official KIIT email address to register
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotPassword(true);
                  setForgotPasswordStep('email');
                  setForgotPasswordError('');
                }}
                className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                Forgot Password ?
              </button>
            </div>
          </div>

          {/* DPDP Act Compliance Checkbox - Only in Register Mode */}
          {isRegisterMode && (
            <div className="mt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptDPDP}
                  onChange={(e) => setAcceptDPDP(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDPDPModal(true);
                    }}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline font-medium"
                  >
                    Terms & Privacy Policy
                  </button>
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading || (isRegisterMode && !acceptDPDP)}
              className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : (isRegisterMode ? 'SIGN UP' : 'LOGIN')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
                setSuccessMessage('');
                setEmail('');
                setPassword('');
                setName('');
                setAcceptDPDP(false);
              }}
              className="flex-1 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400 py-3 rounded-lg font-medium border-2 border-blue-500 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
            >
              {isRegisterMode ? 'LOGIN' : 'SIGN UP'}
            </button>
          </div>

        </form>
        </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={handleCloseForgotPassword}
              className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white transition-colors duration-300">
                Reset Password
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
                {forgotPasswordStep === 'email' && 'Enter your email to receive OTP'}
                {forgotPasswordStep === 'otp' && 'Enter the OTP sent to your email'}
                {forgotPasswordStep === 'reset' && 'Enter your new password'}
              </p>
            </div>

            {/* Error Message */}
            {forgotPasswordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
                <p className="text-red-600 dark:text-red-400 text-sm">{forgotPasswordError}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {forgotPasswordStep === 'email' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your university email"
                    required
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseForgotPassword}
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {forgotPasswordStep === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
                    OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Enter the 6-digit OTP sent to {resetEmail}
                  </p>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep('email');
                      setOtp('');
                      setForgotPasswordError('');
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading || otp.length !== 6}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {forgotPasswordStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep('otp');
                      setNewPassword('');
                      setConfirmPassword('');
                      setForgotPasswordError('');
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DPDP Act Terms & Privacy Policy Modal */}
      {showDPDPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] relative flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setShowDPDPModal(false)}
              className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-6 pr-10">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-black dark:text-white transition-colors duration-300">
                  DPDP Act Terms & Privacy Policy
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                Digital Personal Data Protection Act, 2023
              </p>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 mb-6">
              <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    1. Introduction
                  </h3>
                  <p className="leading-relaxed">
                    This Privacy Policy applies to the use of the EduFoyer platform (the "Service"). Eduackhos Pvt Ltd ("we", "us", "our") collects, stores, and processes your personal data in accordance with the Digital Personal Data Protection Act, 2023.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    2. Data Collection and Processing
                  </h3>
                  <p className="leading-relaxed mb-2">
                    By signing up for EduFoyer, you consent to the collection, storage, and processing of your personal data, including but not limited to your:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>University affiliation</li>
                    <li>Academic information</li>
                    <li>Usage and activity data</li>
                  </ul>
                  <p className="leading-relaxed mt-2">
                    This data is collected to provide educational services, facilitate doubt-solving sessions, manage your account, and improve the platform.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    3. Purpose of Data Processing
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Your personal data will be processed for the following purposes:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Creating and managing your account</li>
                    <li>Providing educational services and doubt-solving sessions</li>
                    <li>Matching students with appropriate peer solvers</li>
                    <li>Processing payments and wallet transactions</li>
                    <li>Sending important updates and notifications</li>
                    <li>Enhancing user experience and improving our services</li>
                    <li>Complying with legal and regulatory obligations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    4. Data Sharing and Disclosure
                  </h3>
                  <p className="leading-relaxed mb-2">
                    We may share your personal data with:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Authorized peer solvers and educators for service delivery</li>
                    <li>Payment processors for transaction-related activities</li>
                    <li>Third-party service providers who support platform operations</li>
                    <li>Legal or regulatory authorities when required by law</li>
                  </ul>
                  <p className="leading-relaxed mt-2">
                    We do not sell your personal data to any third party.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    5. Data Security
                  </h3>
                  <p className="leading-relaxed">
                    We implement appropriate technical and organizational measures to safeguard your personal data from unauthorized access, alteration, disclosure, or destruction. However, no method of data transmission over the internet is completely secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    6. Your Rights Under the DPDP Act
                  </h3>
                  <p className="leading-relaxed mb-2">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Request deletion of your personal data</li>
                    <li>Withdraw consent for data processing</li>
                    <li>File a complaint with the Data Protection Board of India</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    7. Data Retention
                  </h3>
                  <p className="leading-relaxed mb-2">
                    We retain your personal data for only as long as necessary to:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Fulfill the purposes outlined in this policy</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes</li>
                    <li>Enforce our terms and agreements</li>
                  </ul>
                  <p className="leading-relaxed mt-2">
                    You may request deletion of your data at any time.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    8. Cookies and Tracking
                  </h3>
                  <p className="leading-relaxed mb-2">
                    We use cookies and similar technologies to:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Enhance platform functionality</li>
                    <li>Analyze usage behavior</li>
                    <li>Improve user experience</li>
                  </ul>
                  <p className="leading-relaxed mt-2">
                    You may manage or disable cookies through your browser settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    9. Contact Information
                  </h3>
                  <p className="leading-relaxed mb-2">
                    For questions, concerns, or requests related to your personal data, please contact:
                  </p>
                  <p className="leading-relaxed mt-2">
                    <strong>Email:</strong> edufoyer2025@gmail.com<br />
                    <strong>Address:</strong> Jacobpura, Sector 52, Gurugram, Haryana, India
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    10. Acceptance of Policy
                  </h3>
                  <p className="leading-relaxed">
                    By checking the acceptance box or continuing to use the EduFoyer platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree, please refrain from using the Service.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDPDPModal(false);
                  setAcceptDPDP(true);
                }}
                className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg"
              >
                Accept & Continue
              </button>
              <button
                onClick={() => setShowDPDPModal(false)}
                className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;

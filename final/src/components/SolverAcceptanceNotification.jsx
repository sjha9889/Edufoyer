import React, { useState } from 'react';
import { CheckCircle, Video, User, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SolverAcceptanceNotification = ({ 
  isVisible, 
  onClose, 
  doubtId, 
  solverName, 
  doubtTitle,
  sessionUrl 
}) => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSession = async () => {
    setIsJoining(true);
    try {
      // Navigate to session page
      navigate(`/dashboard/session/${doubtId}`);
    } catch (error) {
      console.error('Error joining session:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Solver Found!</h3>
                <p className="text-green-100 text-sm">Your doubt has been accepted</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {solverName || 'A Solver'} has accepted your doubt
            </h4>
            <p className="text-gray-600">
              "{doubtTitle}" is ready to be solved
            </p>
          </div>

          {/* Session Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-700 mb-2">
              <Video className="w-4 h-4" />
              <span className="font-medium">Session Details</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>Session is ready to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3" />
                <span>Solver: {solverName || 'Available'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleJoinSession}
              disabled={isJoining}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Joining Session...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Join Session Now</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Join Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              💡 You can also join the session from your dashboard anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolverAcceptanceNotification;




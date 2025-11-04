import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { CheckCircle, Star, Clock } from 'lucide-react';
import livekitService from '../services/livekitService';
import doubtService from '../services/doubtService';
import authService from '../services/authService';

// A compact LiveKit meeting page built for React (Vite) + Node backend
// - Requires: VITE_LIVEKIT_URL in final/.env
// - Backend route: POST /api/livekit/generate-token (protected)

const LiveKitMeeting = () => {
  const { doubtId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [completing, setCompleting] = useState(false);
  const [isDoubter, setIsDoubter] = useState(false);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
  const [remainingSecs, setRemainingSecs] = useState(null);

  const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

  // Simple auth guard: ensure a JWT exists in localStorage (skip for email links)
  useEffect(() => {
    const isEmailJoin = new URLSearchParams(window.location.search).get('email') === 'true';
    if (isEmailJoin) return;
    const jwt = localStorage.getItem('token');
    if (!jwt) {
      window.location.href = `/?next=${encodeURIComponent(`/dashboard/session/${doubtId || ''}`)}`;
    }
  }, [doubtId]);

  // Fetch a LiveKit token for this doubt
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const isEmailJoin = new URLSearchParams(window.location.search).get('email') === 'true';
        const res = isEmailJoin
          ? await livekitService.generateTokenForEmailJoin(doubtId)
          : await livekitService.generateToken(doubtId);
        if (!res?.success || !res?.token) {
          throw new Error(res?.message || 'Failed to generate LiveKit token');
        }
        setToken(res.token);
        setRoomName(res.roomName || `doubt-session-${doubtId}`);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (doubtId) fetchToken();
  }, [doubtId]);

  // Determine if current user is the doubter (asker) to allow rating
  useEffect(() => {
    const determineRole = async () => {
      try {
        const [user, doubt] = await Promise.all([
          authService.getProfile(),
          doubtService.getDoubtById(doubtId)
        ]);
        const currentUserId = user?.id || user?._id;
        const doubterId = doubt?.doubter_id || doubt?.doubter?._id;
        setIsDoubter(String(currentUserId) === String(doubterId));

        // Setup session timer based on category
        const category = doubt?.category || 'medium';
        const minutes = category === 'small' ? 20 : category === 'medium' ? 30 : 60;
        setRemainingSecs(minutes * 60);
      } catch {
        setIsDoubter(false);
      }
    };
    if (doubtId) determineRole();
  }, [doubtId]);

  // Countdown timer
  useEffect(() => {
    if (remainingSecs == null) return;
    if (remainingSecs <= 0) return;
    const t = setInterval(() => setRemainingSecs((s) => (s != null ? s - 1 : s)), 1000);
    return () => clearInterval(t);
  }, [remainingSecs]);

  // Auto prompt rating when timer reaches zero
  useEffect(() => {
    if (remainingSecs === 0 && isDoubter && !hasSubmittedRating) {
      setShowCompletionModal(true);
    }
  }, [remainingSecs, isDoubter, hasSubmittedRating]);

  // Ensure built-in LiveKit Leave button redirects (solver) or opens rating (asker without rating)
  useEffect(() => {
    const onLeaveClick = (e) => {
      try {
        if (isDoubter && !hasSubmittedRating) {
          // Block asker from leaving until rating
          e.stopPropagation();
          e.preventDefault();
          setShowCompletionModal(true);
          return false;
        }
        // Solver or asker after rating → redirect
        setTimeout(() => navigate('/dashboard'), 0);
      } catch {}
    };

    const bindIfPresent = () => {
      const btn = document.querySelector('[data-lk-leave], button[title="Leave"], [aria-label="Leave"]');
      if (btn) {
        // Remove any previous handler to avoid duplicates
        btn.removeEventListener('click', onLeaveClick, true);
        btn.addEventListener('click', onLeaveClick, true);
        return true;
      }
      return false;
    };

    // Try now and also observe for future mounts
    bindIfPresent();
    const observer = new MutationObserver(() => bindIfPresent());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const btn = document.querySelector('[data-lk-leave], button[title="Leave"], [aria-label="Leave"]');
      if (btn) btn.removeEventListener('click', onLeaveClick, true);
    };
  }, [isDoubter, hasSubmittedRating, navigate]);

  const handleCompleteDoubt = async () => {
    try {
      setCompleting(true);
      // Student submits feedback instead of solver completing
      await doubtService.submitFeedback(doubtId, { rating, comment });
      setHasSubmittedRating(true);
      
      // Show success message and redirect to main dashboard
      alert('Doubt completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>Initializing session…</div>
      </div>
    );
  }

  if (error || !LIVEKIT_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Session Error</h2>
          <p className="text-gray-300 mb-4">{error || 'LiveKit URL not configured'}</p>
          <button
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => navigate('/dashboard/doubts')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>Waiting for token…</div>
      </div>
    );
  }

  return (
    <div data-lk-theme="default" className="h-screen bg-black relative">
      <LiveKitRoom
        token={token}
        serverUrl={LIVEKIT_URL}
        connectOptions={{ autoSubscribe: true }}
        audio
        video
        onError={(e) => setError(e?.message || 'LiveKit error')}
        onDisconnected={() => {
          // If asker leaves without rating, prompt rating. Otherwise redirect to dashboard
          if (isDoubter && !hasSubmittedRating) {
            setShowCompletionModal(true);
          } else {
            navigate('/dashboard');
          }
        }}
        className="h-full"
      >
        <VideoConference />
      </LiveKitRoom>

      {/* Session timer top-left */}
      {remainingSecs != null && remainingSecs > 0 && (
        <div className="absolute top-4 left-4 z-50 bg-black/70 text-white px-3 py-1 rounded flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{Math.floor(remainingSecs/60)}:{String(remainingSecs%60).padStart(2,'0')}</span>
        </div>
      )}
      
      {/* Rating button visible only to asker */}
      {isDoubter && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowCompletionModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            Rate & Complete
          </button>
        </div>
      )}

      {/* Intercept built-in Leave: block askers until rating, redirect solvers */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          const tryBind = () => {
            const btn = document.querySelector('[data-lk-leave], button[title="Leave"], [aria-label="Leave"]');
            if (!btn || btn.getAttribute('data-nav-bound')) return;
            btn.setAttribute('data-nav-bound','1');
            btn.addEventListener('click', function(e){
              try {
                const isDoubter = ${JSON.stringify(true)} && ${isDoubter ? 'true' : 'false'};
                const hasRated = ${hasSubmittedRating ? 'true' : 'false'};
                if (isDoubter && !hasRated) {
                  e.stopPropagation();
                  e.preventDefault();
                  const evt = new CustomEvent('EF_RATE_PROMPT');
                  window.dispatchEvent(evt);
                  return false;
                } else {
                  setTimeout(function(){ window.history.pushState({}, '', '/dashboard'); window.location.assign('/dashboard'); }, 0);
                }
              } catch(_) {}
            }, true);
          };
          const obs = new MutationObserver(tryBind);
          obs.observe(document.body, { childList: true, subtree: true });
          tryBind();
        })();
      ` }} />

      {/* Completion Modal */}
      {isDoubter && showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Doubt Session</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate the session (1-5)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any feedback about the session..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={completing}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteDoubt}
                disabled={completing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {completing ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveKitMeeting;





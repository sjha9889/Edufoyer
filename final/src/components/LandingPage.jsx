import React, { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, ArrowRight, Users, Video, MessageCircle, Clock, Star, CheckCircle, Zap, MessageSquare, Mail, Gift, Phone, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import RatingFeedbackForm from './RatingFeedbackForm';
import DarkModeToggle from './DarkModeToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [publicRatings, setPublicRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchPublicRatings();
  }, []);

  const fetchPublicRatings = async () => {
    try {
      const response = await fetch('/api/rating/public?limit=3');
      
      if (!response.ok) {
        console.warn('Failed to fetch ratings:', response.status, response.statusText);
        setPublicRatings([]);
        setAverageRating(0);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.warn('Empty response from ratings API');
        setPublicRatings([]);
        setAverageRating(0);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse ratings response:', parseError);
        setPublicRatings([]);
        setAverageRating(0);
        return;
      }

      if (data.success) {
        setPublicRatings(data.data || []);
        setAverageRating(data.stats?.averageRating || 0);
      } else {
        setPublicRatings([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setPublicRatings([]);
      setAverageRating(0);
    }
  };

  const handleButtonClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInOutDelayed {
          0%, 20% { opacity: 0; transform: translateY(20px); }
          40%, 80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        
        @keyframes fadeInOutDelayed2 {
          0%, 40% { opacity: 0; transform: translateY(20px); }
          60%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out infinite;
        }
        
        .animate-fade-in-out-delayed {
          animation: fadeInOutDelayed 4s ease-in-out infinite;
        }
        
        .animate-fade-in-out-delayed-2 {
          animation: fadeInOutDelayed2 5s ease-in-out infinite;
        }
      `}</style>
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 dark:opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 dark:opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full opacity-20 dark:opacity-10 animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 dark:opacity-10 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 dark:bg-pink-800 rounded-full opacity-15 dark:opacity-10 animate-pulse delay-3000"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-cyan-200 dark:bg-cyan-800 rounded-full opacity-20 dark:opacity-10 animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Logo and Navigation - Fixed/Sticky */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 italic transition-colors duration-300 hover:opacity-80">
                  EDU
                  <span className="relative inline-block mx-1">
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transform rotate-3"></span>
                    <span className="relative bg-gradient-to-r from-red-400 to-orange-400 rounded-lg px-1 py-0.5 text-white font-bold text-xl md:text-2xl">
                      F
                    </span>
                  </span>
                  OYER
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  to="/about"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </nav>
              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center gap-2">
                <Link
                  to="/about"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300 px-2"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300 px-2"
                >
                  Contact
                </Link>
              </div>
              {/* Dark Mode Toggle Button */}
              <DarkModeToggle className="p-2 md:p-3" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 pt-20 md:pt-24">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6 md:space-y-8">
              {/* Main Heading */}
              <div className="relative">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4 leading-tight animate-fade-in-out transition-colors duration-300">
                  Learn together and
                </h2>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6 leading-tight animate-fade-in-out-delayed">
                  Earn together
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full animate-fade-in-out-delayed-2"></div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 dark:bg-blue-600 rounded-full opacity-60 dark:opacity-40 animate-fade-in-out"></div>
                <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-purple-400 dark:bg-purple-600 rounded-full opacity-60 dark:opacity-40 animate-fade-in-out-delayed"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-green-400 dark:bg-green-600 rounded-full opacity-60 dark:opacity-40 animate-fade-in-out-delayed-2"></div>
              </div>

              {/* Platform Description */}
              <div className="space-y-3 md:space-y-4">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                  We are providing <span className="font-semibold text-blue-600 dark:text-blue-400">peer-to-peer live 24*7 real-time doubt solving platform</span> that connects students with expert solvers instantly.
                </p>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                  Join thousands of students and educators in our interactive learning community where knowledge meets opportunity.
                </p>
              </div>

              {/* Primary Action Buttons - Prominent and Visible */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                <button
                  onClick={handleButtonClick}
                  className="group bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 shadow-lg"
                >
                  <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Ask Doubt</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleButtonClick}
                  className="group bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 shadow-lg"
                >
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Solve Doubt</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2">
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
                  <Video className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Live Sessions</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Peer Learning</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
                  <Gift className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Receive Incentives</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Instant Help</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Elements */}
            <div className="relative">
              {/* Main Visual Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Interactive Learning</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Connect with peers and experts in real-time</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">5K+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">1K+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Solvers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">10K+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Doubts Solved</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-4 rounded-xl shadow-lg transform -rotate-6 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setShowRatingForm(true)}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} Rating` : '4.9 Rating'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings & Feedback Section */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">What Our Users Say</h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Read feedback from our community</p>
              </div>
              <button
                onClick={() => setShowRatingForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Share Your Feedback
              </button>
            </div>

            {/* Public Ratings Display */}
            {publicRatings.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {publicRatings.map((rating) => (
                  <div
                    key={rating._id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating.rating
                              ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3 transition-colors duration-300">{rating.feedback}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{rating.user_name}</p>
                      {rating.is_featured && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium transition-colors duration-300">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="mt-16 text-center">
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Verified Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span>Instant Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
              Join our community of learners and educators. Get instant help with your doubts and earn by helping others.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          {/* Footer Content */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 italic">
                  EDU
                  <span className="relative inline-block mx-1">
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transform rotate-3"></span>
                    <span className="relative bg-gradient-to-r from-red-400 to-orange-400 rounded-lg px-1 py-0.5 text-white font-bold text-xl">
                      F
                    </span>
                  </span>
                  OYER
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Empowering students through peer-to-peer learning and real-time doubt solving.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Links</h3>
              <div className="flex flex-col gap-3">
                <Link
                  to="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 w-fit"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 w-fit"
                >
                  Contact Us
                </Link>
                <a
                  href="mailto:edufoyer2025@gmail.com"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 w-fit flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Support
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <a
                  href="mailto:edufoyer2025@gmail.com"
                  className="flex items-center gap-3 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">edufoyer2025@gmail.com</span>
                </a>
                <a
                  href="tel:+919065343339"
                  className="flex items-center gap-3 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">9065343339</span>
                </a>
                <a
                  href="tel:+919211249724"
                  className="flex items-center gap-3 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">9211249724</span>
                </a>
                <div className="flex items-start gap-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Jacobpura, Sector 52, Gurugram, Haryana, India- 122022</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold text-gray-800 dark:text-gray-200">Eduackhos Pvt Ltd.</span> All rights reserved.
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-6 text-xs md:text-sm text-gray-500 dark:text-gray-500">
              <span>Made with ❤️ for students</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Rating Feedback Form Modal */}
      <RatingFeedbackForm 
        isOpen={showRatingForm}
        onClose={() => {
          setShowRatingForm(false);
          fetchPublicRatings(); // Refresh ratings after submission
        }}
      />
    </div>
  );
};

export default LandingPage;

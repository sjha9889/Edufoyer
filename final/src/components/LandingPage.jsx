import React from 'react';
import { HelpCircle, BookOpen, ArrowRight, Users, Video, MessageCircle, Clock, Star, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-orange-200 rounded-full opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-15 animate-pulse delay-3000"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Logo - Fixed/Sticky */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-blue-900 italic">
                EDU
                <span className="relative inline-block mx-1">
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transform rotate-3"></span>
                  <span className="relative bg-gradient-to-r from-red-400 to-orange-400 rounded-lg px-1 py-0.5 text-white font-bold text-2xl">
                    F
                  </span>
                </span>
                OYER
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12 pt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Main Heading */}
              <div className="relative">
                <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight animate-fade-in-out">
                  Learn together and
                </h2>
                <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 leading-tight animate-fade-in-out-delayed">
                  Earn together
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-fade-in-out-delayed-2"></div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full opacity-60 animate-fade-in-out"></div>
                <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-purple-400 rounded-full opacity-60 animate-fade-in-out-delayed"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-green-400 rounded-full opacity-60 animate-fade-in-out-delayed-2"></div>
              </div>

              {/* Platform Description */}
              <div className="space-y-4">
                <p className="text-xl text-gray-700 leading-relaxed">
                  We are providing <span className="font-semibold text-blue-600">peer-to-peer live 24*7 real-time doubt solving platform</span> that connects students with expert solvers instantly.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Join thousands of students and educators in our interactive learning community where knowledge meets opportunity.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Live Sessions</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Peer Learning</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Real-time Chat</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Instant Help</span>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleButtonClick}
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 min-w-[200px]"
                >
                  <HelpCircle className="w-6 h-6" />
                  <span>Ask Doubt</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleButtonClick}
                  className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 min-w-[200px]"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Solve Doubt</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Side - Visual Elements */}
            <div className="relative">
              {/* Main Visual Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Interactive Learning</h3>
                  <p className="text-gray-600">Connect with peers and experts in real-time</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">10K+</div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">5K+</div>
                      <div className="text-xs text-gray-500">Solvers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">50K+</div>
                      <div className="text-xs text-gray-500">Doubts Solved</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg transform rotate-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Live Now</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-4 rounded-xl shadow-lg transform -rotate-6">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 text-center">
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Verified Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Instant Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our community of learners and educators. Get instant help with your doubts and earn by helping others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Settings, 
  Search, 
  LogOut, 
  Bell, 
  Video, 
  Share2,
  TrendingUp,
  Heart,
  Camera,
  Star,
  Globe,
  Plus,
  ChevronDown,
  MoreHorizontal,
  ThumbsUp,
  Send,
  Paperclip,
  Smile,
  Bookmark,
  MoreVertical,
  Gift,
  ArrowUp,
  ArrowRight,
  User,
  Zap,
  HelpCircle,
  ChevronRight,
  ArrowRight as ArrowRightIcon,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';
import socialService from '../services/socialService';
import userDashboardService from '../services/userDashboardService';
import StoriesPage from './StoriesPage';
import FriendsPage from './FriendsPage';
import UserProfilePage from './UserProfilePage';

const SocialDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', images: [] });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userDashboard, setUserDashboard] = useState(null);
  const [personalizedContent, setPersonalizedContent] = useState([]);
  const [studyRecommendations, setStudyRecommendations] = useState([]);
  const [userStudyGroups, setUserStudyGroups] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          navigate('/');
          return;
        }

        // Get user data from auth service
        const userData = authService.getCurrentUser();
        if (!userData) {
          navigate('/');
          return;
        }
        
        setUser(userData);
        

        // Use userId from URL parameter or fallback to userData.id
        const currentUserId = userId || userData.id || 'default_user';
        console.log('Using user ID from URL:', currentUserId);
        
        // If no userId in URL, redirect to user-specific URL
        if (!userId && userData.id) {
          console.log('No userId in URL, redirecting to user-specific URL');
          navigate(`/dashboard/social/${userData.id}`, { replace: true });
          return;
        }
        
        // Load user-specific dashboard data
        const dashboardData = userDashboardService.getUserDashboard(currentUserId);
        setUserDashboard(dashboardData);
        setPersonalizedContent(dashboardData.personalizedContent);
        setStudyRecommendations(dashboardData.studyRecommendations);
        setFriendSuggestions(dashboardData.friendSuggestions);
        setUserStudyGroups(userDashboardService.getUserStudyGroups(dashboardData.user));
        setUserNotifications(userDashboardService.getUserNotifications(dashboardData.user));
        
        // Load posts, stories, and friend suggestions
        await loadPosts();
        await loadStories();
        await loadFriendSuggestions();
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debug stories state changes
  useEffect(() => {
    console.log('Stories state updated:', stories);
  }, [stories]);

  // Reload stories when switching to feed page
  useEffect(() => {
    if (currentPage === 'feed') {
      console.log('Switched to feed page, reloading stories...');
      loadStories();
    }
  }, [currentPage]);

  // Reload stories when user ID changes
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('User ID changed, reloading stories...');
      loadStories();
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also reload when component mounts
    loadStories();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadPosts = async () => {
    try {
      // Get user ID from URL parameter or localStorage
      const currentUserId = userId || localStorage.getItem('userId') || user?.id || 'user_' + Math.random().toString(36).substr(2, 9);
      console.log('Loading posts for user ID from URL:', currentUserId);
      
      // Create user-specific posts
      const userPosts = getUserSpecificPosts(currentUserId);
      console.log('User-specific posts:', userPosts);
      setPosts(userPosts);
      
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    }
  };

  // Function to generate user-specific posts
  const getUserSpecificPosts = (userId) => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const postTemplates = [
      {
        author: { name: 'CS_Mentor', title: 'Computer Science Professor', avatar: 'https://ui-avatars.com/api/?name=CS+Mentor&background=blue500&color=fff' },
        content: 'Just finished an amazing React tutorial! The hooks concept is revolutionary for state management.',
        hashtags: ['#react', '#javascript', '#programming', '#webdev'],
        subject: 'Programming'
      },
      {
        author: { name: 'Math_Teacher', title: 'Mathematics Professor', avatar: 'https://ui-avatars.com/api/?name=Math+Teacher&background=green500&color=fff' },
        content: 'Solved a complex calculus problem today. Integration techniques are getting clearer!',
        hashtags: ['#calculus', '#mathematics', '#integration', '#learning'],
        subject: 'Mathematics'
      },
      {
        author: { name: 'Physics_Prof', title: 'Physics Professor', avatar: 'https://ui-avatars.com/api/?name=Physics+Prof&background=purple500&color=fff' },
        content: 'Quantum mechanics is mind-bending! The double-slit experiment never gets old.',
        hashtags: ['#physics', '#quantum', '#science', '#research'],
        subject: 'Physics'
      },
      {
        author: { name: 'Bio_Researcher', title: 'Biology Researcher', avatar: 'https://ui-avatars.com/api/?name=Bio+Researcher&background=green500&color=fff' },
        content: 'Molecular biology techniques are advancing rapidly. CRISPR is changing everything!',
        hashtags: ['#biology', '#molecular', '#research', '#crispr'],
        subject: 'Biology'
      },
      {
        author: { name: 'Business_Expert', title: 'Business Consultant', avatar: 'https://ui-avatars.com/api/?name=Business+Expert&background=orange500&color=fff' },
        content: 'Marketing strategies for 2024 are evolving. Digital transformation is key!',
        hashtags: ['#business', '#marketing', '#strategy', '#digital'],
        subject: 'Business'
      }
    ];
    
    const selectedPosts = [];
    const numPosts = Math.abs(hash) % 2 + 1; // 1-2 posts per user
    
    for (let i = 0; i < numPosts; i++) {
      const postIndex = (Math.abs(hash) + i) % postTemplates.length;
      const template = postTemplates[postIndex];
      selectedPosts.push({
        id: `post_${userId}_${i}`,
        author: template.author,
        content: template.content,
        hashtags: template.hashtags,
        subject: template.subject,
        image: `https://via.placeholder.com/600x400?text=${template.subject}`,
        likes: Math.abs(hash + i) % 50 + 10,
        comments: Math.abs(hash + i) % 20 + 5,
        shares: Math.abs(hash + i) % 30 + 3,
        saved: Math.abs(hash + i) % 15 + 2,
        liked: false,
        isSaved: false
      });
    }
    
    return selectedPosts;
  };

  const loadStories = async () => {
    try {
      // Get user ID from URL parameter or localStorage or generate one
      const currentUserId = userId || localStorage.getItem('userId') || user?.id || 'user_' + Math.random().toString(36).substr(2, 9);
      console.log('Loading stories for user ID from URL:', currentUserId);
      
      // Store user ID in localStorage for consistency
      if (!localStorage.getItem('userId') || userId) {
        localStorage.setItem('userId', currentUserId);
      }
      
      // Create user-specific mock data based on user ID
      const userStories = getUserSpecificStories(currentUserId);
      console.log('User-specific stories:', userStories);
      setStories(userStories);
      
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    }
  };

  // Function to generate user-specific stories
  const getUserSpecificStories = (userId) => {
    console.log('Generating stories for user:', userId);
    
    // Create different stories based on user ID hash
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    console.log('User hash:', hash);
    
    // Different story sets for different users
    const userStorySets = {
      'user1': [
        { name: 'Alex_CS', avatar: 'https://ui-avatars.com/api/?name=Alex&background=blue500&color=fff', color: 'border-blue-500', content: 'React hooks are amazing!', subject: 'Programming' },
        { name: 'Sarah_Dev', avatar: 'https://ui-avatars.com/api/?name=Sarah&background=green500&color=fff', color: 'border-green-500', content: 'Just built my first API!', subject: 'Web Development' },
        { name: 'Mike_Code', avatar: 'https://ui-avatars.com/api/?name=Mike&background=purple500&color=fff', color: 'border-purple-500', content: 'JavaScript async/await rocks!', subject: 'JavaScript' }
      ],
      'user2': [
        { name: 'Emma_Math', avatar: 'https://ui-avatars.com/api/?name=Emma&background=green500&color=fff', color: 'border-green-500', content: 'Calculus derivatives are clear now!', subject: 'Mathematics' },
        { name: 'David_Stats', avatar: 'https://ui-avatars.com/api/?name=David&background=blue500&color=fff', color: 'border-blue-500', content: 'Statistics probability solved!', subject: 'Statistics' },
        { name: 'Lisa_Algebra', avatar: 'https://ui-avatars.com/api/?name=Lisa&background=orange500&color=fff', color: 'border-orange-500', content: 'Linear algebra matrices!', subject: 'Linear Algebra' }
      ],
      'user3': [
        { name: 'John_Physics', avatar: 'https://ui-avatars.com/api/?name=John&background=purple500&color=fff', color: 'border-purple-500', content: 'Quantum mechanics is mind-blowing!', subject: 'Physics' },
        { name: 'Anna_Quantum', avatar: 'https://ui-avatars.com/api/?name=Anna&background=red500&color=fff', color: 'border-red-500', content: 'Double-slit experiment!', subject: 'Quantum Physics' },
        { name: 'Tom_Mechanics', avatar: 'https://ui-avatars.com/api/?name=Tom&background=green500&color=fff', color: 'border-green-500', content: 'Classical mechanics!', subject: 'Mechanics' }
      ],
      'user4': [
        { name: 'Maria_Bio', avatar: 'https://ui-avatars.com/api/?name=Maria&background=green500&color=fff', color: 'border-green-500', content: 'DNA replication process!', subject: 'Biology' },
        { name: 'Carl_Genetics', avatar: 'https://ui-avatars.com/api/?name=Carl&background=blue500&color=fff', color: 'border-blue-500', content: 'Genetics inheritance patterns!', subject: 'Genetics' },
        { name: 'Sofia_Molecular', avatar: 'https://ui-avatars.com/api/?name=Sofia&background=purple500&color=fff', color: 'border-purple-500', content: 'Molecular biology techniques!', subject: 'Molecular Biology' }
      ],
      'user5': [
        { name: 'James_Business', avatar: 'https://ui-avatars.com/api/?name=James&background=orange500&color=fff', color: 'border-orange-500', content: 'Marketing strategies 2024!', subject: 'Business' },
        { name: 'Rachel_Finance', avatar: 'https://ui-avatars.com/api/?name=Rachel&background=green500&color=fff', color: 'border-green-500', content: 'Financial analysis methods!', subject: 'Finance' },
        { name: 'Kevin_Entrepreneur', avatar: 'https://ui-avatars.com/api/?name=Kevin&background=blue500&color=fff', color: 'border-blue-500', content: 'Startup success stories!', subject: 'Entrepreneurship' }
      ]
    };
    
    // Get stories for specific user or generate based on hash
    let selectedStories = [];
    
    if (userStorySets[userId]) {
      selectedStories = userStorySets[userId];
    } else {
      // Fallback for other user IDs
      const allStories = Object.values(userStorySets).flat();
      const numStories = Math.abs(hash) % 3 + 2;
      
      for (let i = 0; i < numStories; i++) {
        const storyIndex = (Math.abs(hash) + i) % allStories.length;
        selectedStories.push(allStories[storyIndex]);
      }
    }
    
    // Add user-specific IDs and timestamps
    const finalStories = selectedStories.map((story, index) => ({
      id: `story_${userId}_${index}`,
      name: story.name,
      avatar: story.avatar,
      color: story.color,
      content: story.content,
      subject: story.subject,
      createdAt: new Date(Date.now() - index * 3600000) // 1 hour apart
    }));
    
    console.log('Final stories for', userId, ':', finalStories);
    return finalStories;
  };

  const loadFriendSuggestions = async () => {
    try {
      const response = await socialService.getFriendSuggestions();
      setFriendSuggestions(response.data || []);
    } catch (error) {
      console.error('Error loading friend suggestions:', error);
      // Mock data for testing
      setFriendSuggestions([
        { name: 'Julia Smith', username: '@juliasmith', avatar: 'https://via.placeholder.com/40' },
        { name: 'Vermillion D. Gray', username: '@vermilliongray', avatar: 'https://via.placeholder.com/40' },
        { name: 'Mai Senpai', username: '@maisenpai', avatar: 'https://via.placeholder.com/40' },
        { name: 'Oarack Babama', username: '@obama21', avatar: 'https://via.placeholder.com/40' }
      ]);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    
    setIsCreating(true);
    try {
      await socialService.createPost(newPost);
      setNewPost({ content: '', images: [] });
      setShowCreatePost(false);
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await socialService.likePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async (postId) => {
    try {
      await socialService.savePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleShare = async (postId) => {
    try {
      await socialService.sharePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await socialService.sendFriendRequest(userId);
      await loadFriendSuggestions();
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Educational Social Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Coming Soon Badge - Top Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-100 to-pink-100 border-b-4 border-purple-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-600 animate-pulse" />
            <span className="text-3xl font-bold text-purple-800">Coming Soon</span>
          </div>
        </div>
      </div>
      
      {/* Left Sidebar - Purple */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white pt-12">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold">slothui</span>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Q Search"
                className="w-full pl-10 pr-4 py-2 bg-purple-500 text-white placeholder-purple-300 rounded-lg border-0 focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button 
              onClick={() => setCurrentPage('feed')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'feed' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Feed</span>
              <span className="ml-auto bg-white text-purple-600 text-xs px-2 py-1 rounded-full">10</span>
            </button>
            <button 
              onClick={() => setCurrentPage('stories')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'stories' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Stories</span>
            </button>
            <button 
              onClick={() => setCurrentPage('friends')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'friends' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Friends</span>
              <span className="ml-auto bg-white text-purple-600 text-xs px-2 py-1 rounded-full">2</span>
            </button>
            <button 
              onClick={() => setCurrentPage('apis')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'apis' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>APIs</span>
            </button>
            <button 
              onClick={() => setCurrentPage('subscription')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'subscription' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <Star className="w-5 h-5" />
              <span>Subscription</span>
            </button>
            <button 
              onClick={() => setCurrentPage('profile')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'profile' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button 
              onClick={() => setCurrentPage('settings')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'settings' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button 
              onClick={() => setCurrentPage('help')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white ${
                currentPage === 'help' ? 'bg-purple-500' : 'hover:bg-purple-500'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </button>
          </nav>

          {/* Go Pro Button */}
          <div className="mt-8">
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Go Pro</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="mt-8 pt-6 border-t border-purple-500">
            <div className="flex items-center space-x-3 mb-4">
              <img src={userDashboard?.user?.avatar || user?.avatar} alt="Profile" className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{userDashboard?.user?.name || user?.name}</p>
                <p className="text-xs text-purple-300">{userDashboard?.user?.specialization || 'Student'}</p>
                <p className="text-xs text-purple-200">ID: {userId || localStorage.getItem('userId') || 'Unknown'}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300" />
            </div>
            
            {/* User Switching for Testing */}
            <div className="mb-4">
              <p className="text-xs text-purple-200 mb-2">Test Different Users:</p>
              <div className="flex flex-wrap gap-1">
                {['user1', 'user2', 'user3', 'user4', 'user5'].map((testUser) => {
                  const currentUserId = userId || localStorage.getItem('userId');
                  const isActive = currentUserId === testUser;
                  return (
                    <button
                      key={testUser}
                      onClick={() => {
                        console.log('Navigating to user:', testUser);
                        navigate(`/dashboard/social/${testUser}`);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        isActive 
                          ? 'bg-green-600 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {testUser} {isActive && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={() => {
                authService.logout();
                navigate('/');
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-20">
        {/* Center Content */}
        <div className="flex-1 max-w-2xl">
        {currentPage === 'feed' && (
            <>
              {/* Top Search and Post */}
              <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for friends, groups, pages"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Post</span>
                  </button>
                </div>
              </div>

              {/* Stories */}
              <div className="bg-white p-6 border-b border-gray-200">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Stories</h3>
                  <p className="text-xs text-gray-500">Stories count: {stories.length}</p>
                </div>
                <div className="flex space-x-4 overflow-x-auto">
                  {stories.length > 0 ? (
                    stories.map((story, index) => (
                      <div key={index} className="flex-shrink-0 text-center">
                        <div className={`w-16 h-16 rounded-full border-4 ${story.color} p-1`}>
                          <img src={story.avatar} alt={story.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <p className="text-xs mt-2 text-gray-600">{story.name}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-300 p-1 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No stories</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">No stories</p>
                    </div>
                  )}
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-gray-300 p-1 flex items-center justify-center">
                      <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-xs mt-2 text-gray-600">More</p>
                  </div>
                </div>
              </div>

              {/* Personalized Content */}
              <div className="bg-white mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recommended for {userDashboard?.user?.specialization} Students
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalizedContent.slice(0, 4).map((content, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">{content.subject}</span>
                          <span className="text-xs text-gray-500">{content.type}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{content.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">by {content.author}</span>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600">{content.likes || content.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div className="bg-white">
                {posts.map((post) => (
                  <div key={post.id} className="p-6 border-b border-gray-200">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                          <p className="text-sm text-gray-600">{post.author.title}</p>
                        </div>
                      </div>
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-800 mb-3">{post.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag, index) => (
                          <span key={index} className="text-blue-600 text-sm">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-4">
                        <img src={post.image} alt="Post" className="w-full rounded-lg" />
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>{post.likes} Likes</span>
                        <span>{post.comments} Comments</span>
                        <span>{post.shares} Share</span>
                        <span>{post.saved} Saved</span>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 ${post.liked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                          <span>Like</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                          <MessageCircle className="w-5 h-5" />
                          <span>Comment</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={() => handleSave(post.id)}
                          className={`flex items-center space-x-2 ${post.saved ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                          <Bookmark className="w-5 h-5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div className="mt-4 flex items-center space-x-3">
                      <img src={user?.avatar} alt="You" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Write your comment.."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Smile className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-blue-600 hover:text-blue-700">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentPage === 'stories' && <StoriesPage />}

          {currentPage === 'friends' && <FriendsPage />}

          {currentPage === 'profile' && (
            <UserProfilePage 
              user={user} 
              onUserUpdate={setUser}
            />
          )}

          {currentPage === 'apis' && (
            <div className="bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">APIs</h2>
              <p className="text-gray-600">API documentation and tools will be loaded here...</p>
            </div>
          )}

          {currentPage === 'subscription' && (
            <div className="bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">Subscription</h2>
              <p className="text-gray-600">Subscription plans and billing will be loaded here...</p>
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <p className="text-gray-600">Account settings and preferences will be loaded here...</p>
            </div>
          )}

          {currentPage === 'help' && (
            <div className="bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
              <p className="text-gray-600">Help articles and support will be loaded here...</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* Top Icons */}
          <div className="flex items-center justify-end space-x-4 mb-6">
            <User className="w-6 h-6 text-gray-600" />
            <Bell className="w-6 h-6 text-gray-600" />
            <Settings className="w-6 h-6 text-gray-600" />
          </div>

          {/* Friend Suggestions */}
          {/* Study Groups */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your Study Groups</h3>
              <a href="#" className="text-blue-600 text-sm flex items-center">
                See All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="space-y-3">
              {userStudyGroups.map((group, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-600">{group.members} members • {group.subject}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${group.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Recommendations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recommended for You</h3>
              <a href="#" className="text-blue-600 text-sm flex items-center">
                See All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="space-y-3">
              {studyRecommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{rec.difficulty}</span>
                    <span>{rec.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friend Suggestions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Friend Suggestions</h3>
              <a href="#" className="text-blue-600 text-sm flex items-center">
                See All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="space-y-4">
              {friendSuggestions.map((friend, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{friend.name}</p>
                    <p className="text-sm text-gray-600">{friend.mutual} mutual friends</p>
                  </div>
                  <button
                    onClick={() => handleAddFriend(friend.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Activity */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Profile Activity</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex -space-x-2">
                <img src="https://via.placeholder.com/32" alt="Follower" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://via.placeholder.com/32" alt="Follower" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://via.placeholder.com/32" alt="Follower" className="w-8 h-8 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">+1,158 Followers</p>
                <div className="flex items-center space-x-2">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">23% vs last month</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">You gained a substantial amount of followers this month!</p>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-blue-600" />
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-semibold">25</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Friend's Birthday</p>
                <p className="text-sm text-gray-600">Jun 25, 2028</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32 resize-none"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isCreating || !newPost.content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialDashboard;
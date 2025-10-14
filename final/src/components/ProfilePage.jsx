import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Settings, 
  Camera, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Users, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  MoreVertical,
  Save,
  X,
  Loader2,
  Mail,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import socialService from '../services/socialService';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    posts: 0,
    friends: 0,
    studyGroups: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    subjects: [],
    interests: [],
    website: '',
    phone: '',
    isPublic: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({});

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'Engineering', 'Literature', 'History',
    'Data Science', 'Artificial Intelligence', 'Business', 
    'Economics', 'Psychology', 'Sociology'
  ];

  const interests = [
    'Machine Learning', 'Web Development', 'Data Science', 'Mobile Development',
    'UI/UX Design', 'Cybersecurity', 'Cloud Computing', 'DevOps',
    'Game Development', 'Blockchain', 'IoT', 'AR/VR'
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      // This would be an API call to get user profile
      // const response = await profileService.getProfile();
      
      // Sample data for demonstration
      const sampleUser = {
        _id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://via.placeholder.com/150',
        bio: 'Passionate about mathematics and computer science. Love sharing knowledge and helping others learn.',
        location: 'New York, NY',
        subjects: ['Mathematics', 'Computer Science', 'Data Science'],
        interests: ['Machine Learning', 'Web Development', 'Data Science'],
        website: 'https://johndoe.dev',
        phone: '+1 (555) 123-4567',
        isPublic: true,
        joinedDate: new Date('2023-01-15'),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
      };

      const sampleStats = {
        posts: 24,
        friends: 45,
        studyGroups: 3,
        likes: 156,
        comments: 89,
        shares: 23,
        saves: 67
      };

      const samplePosts = [
        {
          _id: 1,
          content: 'Just solved this complex calculus problem! The key was understanding the chain rule.',
          subject: 'Mathematics',
          likes: 12,
          comments: 5,
          shares: 2,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: 2,
          content: 'Sharing my study notes on data structures. Hope this helps someone!',
          subject: 'Computer Science',
          likes: 8,
          comments: 3,
          shares: 1,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      ];

      setUser(sampleUser);
      setUserStats(sampleStats);
      setRecentPosts(samplePosts);
      setEditForm({
        name: sampleUser.name,
        email: sampleUser.email,
        bio: sampleUser.bio,
        location: sampleUser.location,
        subjects: sampleUser.subjects,
        interests: sampleUser.interests,
        website: sampleUser.website,
        phone: sampleUser.phone,
        isPublic: sampleUser.isPublic
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      // This would be an API call to update profile
      // await profileService.updateProfile(editForm);
      
      setUser({ ...user, ...editForm });
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      // This would be an API call to change password
      // await profileService.changePassword(passwordForm);
      
      alert('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                <div className="flex items-center gap-1">
                  {user.isPublic ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-500">
                    {user.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{user.bio}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Last active {formatTimeAgo(user.lastActive)}</span>
                </div>
              </div>

              {/* Subjects and Interests */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.subjects.map((subject, index) => (
                      <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span key={index} className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.posts}</h3>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.friends}</h3>
          <p className="text-sm text-gray-500">Friends</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.studyGroups}</h3>
          <p className="text-sm text-gray-500">Groups</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.likes}</h3>
          <p className="text-sm text-gray-500">Likes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.comments}</h3>
          <p className="text-sm text-gray-500">Comments</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <Share2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.shares}</h3>
          <p className="text-sm text-gray-500">Shares</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <Bookmark className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{userStats.saves}</h3>
          <p className="text-sm text-gray-500">Saves</p>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Posts</h2>
          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        <div className="space-y-4">
          {recentPosts.map(post => (
            <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-800">{post.subject}</h3>
                  <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-700 mb-3">{post.content}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>{post.shares}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.subjects.includes(subject)}
                        onChange={(e) => {
                          const subjects = editForm.subjects;
                          if (e.target.checked) {
                            setEditForm({...editForm, subjects: [...subjects, subject]});
                          } else {
                            setEditForm({...editForm, subjects: subjects.filter(s => s !== subject)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.interests.includes(interest)}
                        onChange={(e) => {
                          const interests = editForm.interests;
                          if (e.target.checked) {
                            setEditForm({...editForm, interests: [...interests, interest]});
                          } else {
                            setEditForm({...editForm, interests: interests.filter(i => i !== interest)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isPublic}
                    onChange={(e) => setEditForm({...editForm, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Make profile public</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;





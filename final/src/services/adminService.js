// Admin service for managing users and solvers
const API_BASE_URL = '/api/admin';

class AdminService {
  constructor() {
    // Don't store token in constructor, always get fresh from localStorage
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    console.log('🔐 AdminService - Token check:', token ? 'Token found' : 'No token');
    console.log('🔐 AdminService - Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    };

    console.log('📡 AdminService - Making request to:', url);
    console.log('📡 AdminService - Headers:', defaultOptions.headers);

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      console.log('📡 AdminService - Response status:', response.status);
      console.log('📡 AdminService - Response ok:', response.ok);
      
      if (response.status === 401) {
        console.error('❌ AdminService - Authentication failed (401)');
        throw new Error('Authentication failed');
      }

      return response;
    } catch (error) {
      console.error('❌ AdminService - Network request failed:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  }

  // Register any user as solver (admin function)
  async registerUserAsSolver(userData) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/register-solver`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register user as solver');
      }

      return data;
    } catch (error) {
      console.error('Register user as solver error:', error);
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/users`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return data.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Get all solvers
  async getAllSolvers() {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/solvers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch solvers');
      }

      return data.data;
    } catch (error) {
      console.error('Get all solvers error:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService;

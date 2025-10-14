const API_ORIGIN = import.meta?.env?.VITE_API_BASE_URL || window.__API_BASE_URL__ || '';
const API_BASE_URL = `${API_ORIGIN}/api/doubts`;

class DoubtService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Get token from localStorage
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // Make authenticated requests
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    console.log('Making authenticated request to:', url);
    console.log('Using token:', token ? 'Token present' : 'No token');
    
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

    console.log('Request headers:', defaultOptions.headers);
    const response = await fetch(url, { ...defaultOptions, ...options });
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      throw new Error('Authentication failed');
    }

    return response;
  }

  // Create a new doubt
  async createDoubt(doubtData) {
    try {
      console.log('🚀 Creating doubt with data:', doubtData);
      console.log('🔗 API URL:', `${API_BASE_URL}/create`);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/create`, {
        method: 'POST',
        body: JSON.stringify(doubtData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📊 Doubt creation response status:', response.status);
      const data = await response.json();
      console.log('📋 Doubt creation response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || 'Failed to create doubt');
      }

      console.log('✅ Doubt created successfully, returning:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Create doubt error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get user's own doubts
  async getMyDoubts(page = 1, limit = 10, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      console.log('Fetching my doubts with params:', queryParams.toString());
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/my-doubts?${queryParams}`);
      console.log('Get my doubts response status:', response.status);
      const data = await response.json();
      console.log('Get my doubts response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch doubts');
      }

      return data.data;
    } catch (error) {
      console.error('Get my doubts error:', error);
      throw error;
    }
  }

  // Get all doubts (for browsing)
  async getAllDoubts(page = 1, limit = 10, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/all?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch doubts');
      }

      return data.data;
    } catch (error) {
      console.error('Get all doubts error:', error);
      throw error;
    }
  }

  // Get a specific doubt by ID
  async getDoubtById(doubtId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/by-id/${doubtId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch doubt');
      }

      return data.data.doubt;
    } catch (error) {
      console.error('Get doubt error:', error);
      throw error;
    }
  }

  // Answer a doubt
  async answerDoubt(doubtId, answer) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/${doubtId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit answer');
      }

      return data.data.doubt;
    } catch (error) {
      console.error('Answer doubt error:', error);
      throw error;
    }
  }

  // Accept an answer
  async acceptAnswer(doubtId, answerId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/${doubtId}/accept-answer/${answerId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept answer');
      }

      return data.data.doubt;
    } catch (error) {
      console.error('Accept answer error:', error);
      throw error;
    }
  }

  // Update doubt status
  async updateDoubtStatus(doubtId, status) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/${doubtId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update doubt status');
      }

      return data.data.doubt;
    } catch (error) {
      console.error('Update doubt status error:', error);
      throw error;
    }
  }

  // Delete a doubt
  async deleteDoubt(doubtId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/${doubtId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete doubt');
      }

      return true;
    } catch (error) {
      console.error('Delete doubt error:', error);
      throw error;
    }
  }

  // Submit feedback (student/asker)
  async submitFeedback(doubtId, { rating, comment }) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ doubtId, rating, comment })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      return data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const doubtService = new DoubtService();
export default doubtService;

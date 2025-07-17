const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Validate current token
  async validateToken(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      const response = await this.get('/auth/validate');
      return !response.error;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current user info
  getCurrentUser(): any {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user');
        }
      }
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401) {
        console.warn('Token expired or invalid, clearing auth data');
        this.clearToken();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return { error: 'Authentication expired. Please log in again.' };
      }

      // Handle network errors
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error(`API Error [${response.status}]:`, {
          url,
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        });
        
        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Network Error:', {
        url,
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { error: 'Network error. Please check your connection and try again.' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(username: string, email: string, password: string) {
    const response = await this.post('/auth/register', { username, email, password });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    this.clearToken();
  }

  // Clear all cached user data
  clearUserCache() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      console.log('User cache cleared');
    }
  }

  async getAssets() {
    return this.get('/assets');
  }

  async getAsset(id: number) {
    return this.get(`/assets/${id}`);
  }

  async executeTrade(assetId: number, type: 'buy' | 'sell', quantity: number, price: number) {
    return this.post('/trades', { assetId, type, quantity, price });
  }

  async getTrades() {
    return this.get('/trades');
  }

  async getPortfolio() {
    return this.get('/trades/portfolio');
  }

  async getUsers() {
    return this.get('/admin/users');
  }

  async updateUserBalance(userId: number, balance: number) {
    return this.patch(`/admin/user/${userId}`, { balance });
  }

  async resetUserPortfolio(userId: number) {
    return this.post(`/admin/reset-user/${userId}`);
  }

  async resetAllPortfolios() {
    return this.post('/admin/reset-all');
  }

  async addBonus(userId: number, amount: number) {
    return this.post(`/admin/bonus/${userId}`, { amount });
  }

  async getUserDashboard(userId: number) {
    return this.get(`/admin/user-dashboard/${userId}`);
  }

  async getLeaderboard() {
    return this.get('/admin/analytics/leaderboard');
  }

  async bulkUpdateUsers(userIds: number[], action: string, value?: number) {
    return this.post('/admin/bulk-update', { userIds, action, value });
  }

  // Wallet endpoints
  async createDeposit(amount: number, tier: string) {
    return this.post('/wallet/deposit', { amount, tier });
  }

  async initiateWithdrawal(amount: number, address: string) {
    return this.post('/wallet/withdraw', { amount, address });
  }

  async getTransactionHistory(type?: 'deposit' | 'withdrawal') {
    const params = type ? `?type=${type}` : '';
    return this.get(`/wallet/transactions${params}`);
  }

  async getWalletDetails() {
    return this.get('/wallet/details');
  }

  async verifyWithdrawalAddress(address: string) {
    return this.post('/wallet/verify-address', { address });
  }

  async getDepositAddress() {
    return this.get('/wallet/deposit-address');
  }

  async confirmDeposit(transactionId: string) {
    return this.post('/wallet/confirm-deposit', { transactionId });
  }

  async getWithdrawalLimits() {
    return this.get('/wallet/withdrawal-limits');
  }

  // Password reset endpoints
  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.post('/auth/reset-password', { token, newPassword });
  }
}

export const api = new ApiClient();
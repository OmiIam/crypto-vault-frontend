'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  isAdmin?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication initialization failed'
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.login(credentials.email, credentials.password);
      
      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Login failed' 
        }));
        return { success: false, error: response.error };
      }

      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        const user = (response.data as any).user;
        const token = (response.data as any).token;
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(user));
        if (token) {
          localStorage.setItem('token', token);
        }
        
        // Handle remember me
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return { success: true, user, token };
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Invalid response format' 
      }));
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.register(credentials.username, credentials.email, credentials.password);
      
      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Registration failed' 
        }));
        return { success: false, error: response.error };
      }

      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        const user = (response.data as any).user;
        const token = (response.data as any).token;
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(user));
        if (token) {
          localStorage.setItem('token', token);
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return { success: true, user, token };
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Invalid response format' 
      }));
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      api.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  // Send password reset email
  const sendPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const response = await api.forgotPassword(email);
      
      if (response.error) {
        return { 
          success: false, 
          message: response.error 
        };
      }
      
      return { 
        success: true, 
        message: 'Password reset email sent successfully',
        token: response.data?.token // For testing purposes - remove in production
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email';
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }, []);

  // Reset password with token
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.resetPassword(token, newPassword);
      
      if (response.error) {
        return { 
          success: false, 
          message: response.error 
        };
      }
      
      return { 
        success: true, 
        message: 'Password reset successfully' 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Update user data
  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        ...prev,
        user: updatedUser
      };
    });
  }, []);

  // Check if user should be remembered
  const shouldRemember = useCallback(() => {
    return localStorage.getItem('rememberMe') === 'true';
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    sendPasswordReset,
    resetPassword,
    clearError,
    updateUser,
    
    // Utilities
    shouldRemember
  };
};
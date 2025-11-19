'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setAuthState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setAuthState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      try {
        const response = await apiService.getCurrentUser();
        setAuthState({
          user: response.data,
          loading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({ user: null, loading: false, isAuthenticated: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login({ username, password });
      const { tokens, user } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      }

      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      setAuthState({ user: null, loading: false, isAuthenticated: false });
      router.push('/');
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
    recaptcha_token?: string;
  }) => {
    try {
      const response = await apiService.register(data);
      const { tokens, user } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      }

      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          Object.values(error.response?.data || {}).flat().join(', ') ||
          'Registration failed',
      };
    }
  };

  return {
    ...authState,
    login,
    logout,
    register,
  };
}


import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ValidationError, LoginCredentials, RegisterData, User } from './types';

// API Response types matching your backend
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  timestamp?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  timestamp?: string;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      withCredentials: true, // Essential for HTTP-only cookies
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            await this.instance.post('/api/auth/refresh-token');
            // Retry original request
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await this.instance.post('/api/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await this.instance.post('/api/auth/register', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.instance.post('/api/auth/logout');
    return response.data;
  }

  async setPassword(newPassword: string): Promise<ApiResponse<User>> {
    const response = await this.instance.post('/api/auth/reset', { newPassword });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.instance.post('/api/auth/forgot', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await this.instance.post(`/api/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse> {
    const response = await this.instance.post('/api/auth/refresh-token');
    return response.data;
  }

  // You might want to add this endpoint to your backend
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.instance.get('/api/auth/me');
    return response.data;
  }

  // Generic request methods for other API calls
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

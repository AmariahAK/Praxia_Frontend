import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  UserProfile,
  ChatSession,
  ChatSessionList,
  ChatMessage,
  MedicalConsultation,
  MedicalConsultationRequest,
  XRayAnalysis,
  ResearchQuery,
  ApiError,
  TOTPSetupResponse,
  TOTPVerifyRequest,
  TOTPVerifyResponse,
  HealthReference,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserSessionsResponse
} from '@/types/user';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  },
});

// Clear tokens when browser/tab closes
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_key');
  });
}

// Token refresh function
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Add token and session key to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const sessionKey = localStorage.getItem('session_key');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (sessionKey && config.headers) {
    config.headers['X-Session-Key'] = sessionKey;
  }
  
  // Only set Content-Type if not already set (e.g., for multipart/form-data)
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      const sessionKey = localStorage.getItem('session_key');

      if (refreshToken && sessionKey) {
        try {
          const response = await authApi.refreshToken({ refresh_token: refreshToken, session_key: sessionKey });
          const { access_token } = response;
          
          localStorage.setItem('access_token', access_token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          processQueue(null, access_token);
          
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          // Clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('session_key');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('session_key');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login/', data);
      
      // Store tokens and session key
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('session_key', response.data.session_key);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_key');
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await api.post('/auth/logout-all/');
    } catch (error) {
      console.error('Logout all API call failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_key');
    }
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.post<RefreshTokenResponse>('/auth/refresh-token/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/verify_email/', { token });
      
      // Store tokens and session key
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('session_key', response.data.session_key);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/resend-verification-email/', { email });
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response && (error as AxiosError).response?.status === 401) {
        throw new Error("Authentication error. Please try again or contact support.");
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/password-reset-request/', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  resetPassword: async (token: string, password: string, password2: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/password-reset-confirm/', { 
        token, 
        password, 
        password2 
      });
      
      // Store tokens and session key
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('session_key', response.data.session_key);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  checkEmailVerification: async (email: string): Promise<{ is_verified: boolean; user_id: number; email: string }> => {
    try {
      const response = await api.post<{ is_verified: boolean; user_id: number; email: string }>(
        '/auth/check-email-verification/', 
        { email }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  // Session management
  getSessions: async (): Promise<UserSessionsResponse> => {
    try {
      const response = await api.get<UserSessionsResponse>('/auth/sessions/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  terminateSession: async (sessionKey: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>('/auth/sessions/', {
        data: { session_key: sessionKey }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  // 2FA endpoints
  setupTOTP: async (): Promise<TOTPSetupResponse> => {
    try {
      const response = await api.get<TOTPSetupResponse>('/auth/2fa/setup/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  verifyTOTP: async (data: TOTPVerifyRequest): Promise<TOTPVerifyResponse> => {
    try {
      const response = await api.post<TOTPVerifyResponse>('/auth/2fa/verify/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  disableTOTP: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/2fa/disable/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  checkTOTPStatus: async (): Promise<{ has_2fa: boolean; created_at?: string }> => {
    try {
      const response = await api.get<{ has_2fa: boolean; created_at?: string }>('/auth/2fa/status/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
};

// User Profile API
export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile>('/profile/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      // Ensure we're only sending fields that the backend expects
      const validData: Partial<UserProfile> = {};
      if ('age' in data) validData.age = data.age;
      if ('gender' in data) validData.gender = data.gender;
      if ('weight' in data) validData.weight = data.weight;
      if ('height' in data) validData.height = data.height;
      if ('country' in data) validData.country = data.country;
      if ('allergies' in data) validData.allergies = data.allergies;
      if ('preferred_language' in data) validData.preferred_language = data.preferred_language;
      
      const response = await api.patch<UserProfile>('/profile/', validData);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  confirmGender: async (): Promise<{ detail: string; profile: UserProfile }> => {
    try {
      const response = await api.post<{ detail: string; profile: UserProfile }>('/profile/confirm-gender/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  uploadProfilePicture: async (file: File): Promise<UserProfile> => {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response = await api.patch<UserProfile>('/profile/', formData, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
};

// Chat API
export const chatApi = {
  getSessions: async (): Promise<ChatSessionList[]> => {
    try {
      const response = await api.get<ChatSessionList[]>('/chat-sessions/');
      return response.data;
          } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  getSession: async (id: number): Promise<ChatSession> => {
    try {
      const response = await api.get<ChatSession>(`/chat-sessions/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  createSession: async (title: string = 'New Chat'): Promise<ChatSession> => {
    try {
      const response = await api.post<ChatSession>('/chat-sessions/', { title });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  getMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    try {
      const response = await api.get<ChatMessage[]>(`/chat-sessions/${sessionId}/messages/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

sendMessage: async (sessionId: number, content: string, xrayFile?: File): Promise<{ user_message: ChatMessage; ai_message: ChatMessage }> => {
  try {
    if (xrayFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('xray_image', xrayFile);
      
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, 
      };
      
      const response = await api.post<{ user_message: ChatMessage; ai_message: ChatMessage }>(
        `/chat-sessions/${sessionId}/messages/`,
        formData,
        config
      );
      
      return processMessageResponse(response);
    } else {
      const response = await api.post<{ user_message: ChatMessage; ai_message: ChatMessage }>(
        `/chat-sessions/${sessionId}/messages/`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 90000, 
        }
      );
      
      return processMessageResponse(response);
    }
  } catch (error: unknown) {
    console.error('Error sending message:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && (
      (error as AxiosError).code === 'ECONNABORTED' || 
      error.message.includes('timeout')
    )) {
      throw new Error('Request timed out. Please try again with a shorter message.');
    }
    
    throw handleApiError(error as AxiosError<ApiError>);
  }
},  
  updateSessionTitle: async (sessionId: number, title: string): Promise<ChatSession> => {
    try {
      const response = await api.patch<ChatSession>(`/chat-sessions/${sessionId}/`, { title });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  deleteSession: async (sessionId: number): Promise<void> => {
    try {
      await api.delete(`/chat-sessions/${sessionId}/`);
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
};

// Medical Consultation API
export const consultationApi = {
  getConsultations: async (): Promise<MedicalConsultation[]> => {
    try {
      const response = await api.get<MedicalConsultation[]>('/consultations/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  createConsultation: async (data: MedicalConsultationRequest): Promise<MedicalConsultation> => {
    // Ensure language is one of the supported options
    const validatedData = {
      ...data,
      language: data.language && ['en', 'es', 'fr'].includes(data.language) ? data.language : 'en'
    };
    
    try {
      const response = await api.post<MedicalConsultation>('/consultations/', validatedData);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
};

// X-Ray Analysis API
export const xrayApi = {
  getAnalyses: async (): Promise<XRayAnalysis[]> => {
    try {
      const response = await api.get<XRayAnalysis[]>('/xray-analyses/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  uploadXray: async (imageFile: File): Promise<XRayAnalysis> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response = await api.post<XRayAnalysis>('/xray-analyses/', formData, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  getAnalysis: async (id: number): Promise<XRayAnalysis> => {
    try {
      const response = await api.get<XRayAnalysis>(`/xray-analyses/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  pollForResults: async (id: number, interval: number = 2000, maxAttempts: number = 30): Promise<XRayAnalysis> => {
    let attempts = 0;
    
    const poll = async (): Promise<XRayAnalysis> => {
      try {
        const analysis = await xrayApi.getAnalysis(id);
        
        // If processing is complete, return the result
        if (analysis.analysis_result !== "Processing...") {
          return analysis;
        }
        
        // If max attempts reached, throw an error
        if (++attempts >= maxAttempts) {
          throw new Error("Analysis is taking too long. Please check back later.");
        }
        
        // Wait for interval and try again
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      } catch (error) {
        throw error;
      }
    };
    
    return poll();
  },
};

// Research API
export const researchApi = {
  getQueries: async (): Promise<ResearchQuery[]> => {
    try {
      const response = await api.get<ResearchQuery[]>('/research/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },

  createQuery: async (query: string): Promise<ResearchQuery> => {
    try {
      const response = await api.post<ResearchQuery>('/research/', { query });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
};

// Health Check API
export const healthApi = {
  checkHealth: async (): Promise<{ status: string; database: string; ai_system: string; version: string }> => {
    try {
      const response = await api.get<{ status: string; database: string; ai_system: string; version: string }>('/health/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  },
  
  checkAuthenticatedHealth: async (): Promise<{ 
    timestamp: string; 
    status: string; 
    services_status: Record<string, string>;
    external_data: Record<string, unknown>;
  }> => {
    try {
      const response = await api.get<{ 
        timestamp: string; 
        status: string; 
        services_status: Record<string, string>;
        external_data: Record<string, unknown>;
      }>('/health/authenticated/');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
};

// Helper function to handle API errors
const handleApiError = (error: AxiosError<ApiError>): Error => {
  console.error('API Error Details:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    }
  });

  if (error.response) {
    const serverError = error.response.data;
    let errorMessage = 'An error occurred';
    
    if (serverError?.detail) {
      errorMessage = serverError.detail;
    } else if (serverError?.error) {
      errorMessage = serverError.error;
    } else if (typeof serverError === 'string') {
      errorMessage = serverError;
    } else {
      // Check for field-specific errors
      const fieldErrors = Object.entries(serverError || {})
        .filter(([key]) => key !== 'detail' && key !== 'error')
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(', ')}`;
          }
          return `${key}: ${value}`;
        });
      
      if (fieldErrors.length > 0) {
        errorMessage = fieldErrors.join('; ');
      } else {
        errorMessage = `Server error (${error.response.status})`;
      }
    }
    
    return new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return new Error('No response received from server. Please check your connection and ensure the backend is running.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
    return new Error(error.message || 'An unexpected error occurred');
  }
};

export default api;

// Update the processMessageResponse function
function processMessageResponse(response: AxiosResponse<{ user_message: ChatMessage; ai_message: ChatMessage }>) {
  // Process content if it exists in the response
  if (response.data.ai_message.content) {
    try {
      let contentObj;
      try {
        contentObj = JSON.parse(response.data.ai_message.content);
      } catch (e) {
        const content = response.data.ai_message.content;
        
        if (content.includes('') && content.includes('')) {
          const matches = content.match(/([\s\S]*?)/);
          if (matches && matches[1]) {
            const jsonStr = matches[1].trim();
            contentObj = JSON.parse(jsonStr);
          } else {
            throw e;
          }
        } 
        else if (content.includes('') && content.includes('')) {
          const matches = content.match(/([\s\S]*?)/);
          if (matches && matches[1]) {
            const jsonStr = matches[1].trim();
            try {
              contentObj = JSON.parse(jsonStr);
            } catch {
              throw e;
            }
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
      
      // Handle timeout responses
      if (contentObj.status === 'timeout') {
        console.log('Received timeout response from backend');
      }
      
      // Process sources if they exist
      if (contentObj.related_research || contentObj.sources) {
        const sources: HealthReference[] = [];
        
        // Process related research
        if (contentObj.related_research && Array.isArray(contentObj.related_research)) {
          contentObj.related_research.forEach((research: { 
            journal?: string; 
            title?: string; 
            abstract?: string; 
            doi?: string;
            publication_date?: string;
          }) => {
            const sourceName = research.journal || "Medical Journal";
            
            // Use the backend's icon mapping logic
            const sourceIcon = getSourceIconName(sourceName);
            
            sources.push({
              source: {
                name: sourceName,
                icon: sourceIcon,
                url: research.doi ? `https://doi.org/${research.doi}` : undefined
              },
              title: research.title || "Research Article",
              description: research.abstract || "",
              url: research.doi ? `https://doi.org/${research.doi}` : undefined,
              date: research.publication_date
            });
          });
        }
        
        // Add sources to the message
        if (sources.length > 0) {
          response.data.ai_message.sources = sources;
        }
      }
    } catch (e) {
      console.log("Failed to parse content from message", e);
    }
  }
  
  return response.data;
}

// Helper function to match backend icon mapping
function getSourceIconName(sourceName: string): string {
  if (!sourceName) return "source-icon";
  
  const lowerSourceName = sourceName.toLowerCase();
  
  if (lowerSourceName.includes('who') || lowerSourceName.includes('world health')) {
    return "who-logo";
  } else if (lowerSourceName.includes('cdc') || lowerSourceName.includes('centers for disease')) {
    return "cdc-logo";
  } else if (lowerSourceName.includes('nih') || lowerSourceName.includes('national institutes')) {
    return "nih-logo";
  } else if (lowerSourceName.includes('mayo')) {
    return "mayo-logo";
  } else if (lowerSourceName.includes('pubmed')) {
    return "pubmed-logo";
  } else {
    return "journal-icon";
  }
}

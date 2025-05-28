// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserProfile {
  username: string;
  email: string;
  profile_picture?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  gender_locked: boolean;
  weight?: number;
  height?: number;
  country?: string;
  allergies?: string;
  preferred_language?: 'en' | 'es' | 'fr';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  session_key: string;
  user_id: number;
  email: string;
  email_verified?: boolean;
  has_2fa?: boolean;
  message?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
  session_key: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  session_key: string;
}

// Session Management Types
export interface UserSession {
  session_key: string;
  device_info: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
}

export interface UserSessionsResponse {
  sessions: UserSession[];
}

// 2FA Types
export interface TOTPSetupResponse {
  qr_code: string;
  created_at: string;
}

export interface TOTPVerifyRequest {
  token: string;
}

export interface TOTPVerifyResponse {
  message: string;
  is_verified: boolean;
}

// Chat Types
export interface HealthSource {
  name: string;
  icon: string;
  url?: string;
}

export interface HealthReference {
  source: HealthSource;
  title: string;
  description?: string;
  url?: string;
  date?: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: HealthReference[];
}

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatSessionList {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
}

// Medical Consultation Types
export interface MedicalConsultation {
  id: number;
  symptoms: string;
  diagnosis: string;
  language: 'en' | 'es' | 'fr';
  created_at: string;
}

export interface MedicalConsultationRequest {
  symptoms: string;
  language?: 'en' | 'es' | 'fr';
}

// X-Ray Analysis Types
export interface XRayAnalysis {
  id: number;
  image_url: string;
  analysis_result: string;
  detected_conditions: Record<string, unknown>;
  confidence_scores: Record<string, number>;
  created_at: string;
  isProcessing?: () => boolean;
}

// Loader for Xrays
export function isXRayProcessing(analysis: XRayAnalysis): boolean {
  return analysis.analysis_result === "Processing...";
}

// Research Types
export interface ResearchQuery {
  id: number;
  query: string;
  results: Record<string, unknown>;
  created_at: string;
}

// API Error Type
export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface User {
  user_id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id?: string;
  email?: string;
  error?: string;
  message?: string;
}

export interface SignupResponse {
  user_id?: string;
  email: string;
  error?: string;
  message?: string;
}

export interface SalonInfo {
  name: string;
  location: string;
  strengths: string;
  services: string;
}

export interface SalonResponse {
  salon_id: string;
  name: string;
  location: string;
  strengths: string;
  services: string;
  created_at: string;
}

export interface TopicGenerationRequest {
  context: string;
  topic_suggestion: string;
}

export interface TopicGenerationResponse {
  results?: Array<{
    summary: string;
    context: string;
  }>;
  error?: string;
  message?: string;
}

export interface PostGenerationRequest {
  gen_context: string;
  channels: string[];
  tone: string;
}

export interface GeneratedOutput {
  text: string;
  hashtags?: string[];
}

export interface GeneratedResult {
  channel: string;
  outputs: GeneratedOutput[];
}

export interface GenerationResponse {
  results?: GeneratedResult[];
  error?: string;
  message?: string;
}
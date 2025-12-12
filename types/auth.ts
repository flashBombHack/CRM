export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthResponse {
  token: string | null;
  refreshToken: string | null;
  email: string;
  userId: string;
  expiresIn: number;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
  errors: string[];
  responseCode: number;
}

export interface User {
  email: string;
  userId: string;
  firstName?: string;
  lastName?: string;
}


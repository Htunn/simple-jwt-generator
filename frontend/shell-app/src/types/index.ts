// Re-export types from shared components
export * from '@jwt-generator/shared-components/types';

// Shell app specific types
export interface User {
  id: string;
  username: string;
  email: string;
  isAuthenticated: boolean;
  roles?: string[];
}

export interface AppConfig {
  apiBaseUrl: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableDashboard: boolean;
    enableTokenManager: boolean;
    enableAuthManager: boolean;
    enableApiDocs: boolean;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  roles?: string[];
}

export interface MicroFrontend {
  name: string;
  url: string;
  scope: string;
  module: string;
  fallback?: React.ComponentType;
  loading?: React.ComponentType;
  error?: React.ComponentType;
}

export interface AppState {
  user: User | null;
  config: AppConfig;
  navigation: NavigationItem[];
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

// Event types for micro-frontend communication
export interface MfeEvent {
  type: string;
  source: string;
  data?: any;
  timestamp: number;
}

export interface MfeEventHandler {
  (event: MfeEvent): void;
}

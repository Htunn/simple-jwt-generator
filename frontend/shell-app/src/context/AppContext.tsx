import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, AppConfig, NavigationItem, MfeEvent } from '../types';

// Initial state
const initialConfig: AppConfig = {
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  version: '1.0.0',
  environment: (process.env.NODE_ENV as any) || 'development',
  features: {
    enableDashboard: true,
    enableTokenManager: true,
    enableAuthManager: true,
    enableApiDocs: true,
  },
};

const initialNavigation: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: '📊',
    requiresAuth: false,
  },
  {
    id: 'tokens',
    label: 'Token Manager',
    path: '/tokens',
    icon: '🔐',
    requiresAuth: false,
  },
  {
    id: 'auth',
    label: 'Authentication',
    path: '/auth',
    icon: '👤',
    requiresAuth: false,
  },
  {
    id: 'docs',
    label: 'API Documentation',
    path: '/docs',
    icon: '📚',
    requiresAuth: false,
  },
];

const initialState: AppState = {
  user: null,
  config: initialConfig,
  navigation: initialNavigation,
  isLoading: false,
  error: null,
};

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AppConfig> }
  | { type: 'UPDATE_NAVIGATION'; payload: NavigationItem[] }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'UPDATE_NAVIGATION':
      return { ...state, navigation: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  // MFE communication
  sendMfeEvent: (event: Omit<MfeEvent, 'timestamp'>) => void;
  subscribeMfeEvent: (handler: (event: MfeEvent) => void) => () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper methods
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // MFE communication system
  const mfeEventHandlers = new Set<(event: MfeEvent) => void>();

  const sendMfeEvent = (event: Omit<MfeEvent, 'timestamp'>) => {
    const fullEvent: MfeEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    // Dispatch to all registered handlers
    mfeEventHandlers.forEach(handler => {
      try {
        handler(fullEvent);
      } catch (error) {
        console.error('Error in MFE event handler:', error);
      }
    });

    // Also dispatch as custom DOM event for cross-MFE communication
    window.dispatchEvent(new CustomEvent('mfe-event', { detail: fullEvent }));
  };

  const subscribeMfeEvent = (handler: (event: MfeEvent) => void) => {
    mfeEventHandlers.add(handler);
    
    // Also listen for DOM events from other MFEs
    const domHandler = (event: any) => {
      if (event.detail) {
        handler(event.detail);
      }
    };
    
    window.addEventListener('mfe-event', domHandler);
    
    // Return cleanup function
    return () => {
      mfeEventHandlers.delete(handler);
      window.removeEventListener('mfe-event', domHandler);
    };
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('jwt-generator-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('jwt-generator-user');
      }
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('jwt-generator-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('jwt-generator-user');
    }
  }, [state.user]);

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setUser,
    clearError,
    sendMfeEvent,
    subscribeMfeEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

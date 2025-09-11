import React from 'react';
import { useApp } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    // Clear any stored tokens
    localStorage.removeItem('jwt-generator-token');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔐</span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              JWT Generator
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>v{state.config.version}</span>
            <span className="text-xs">•</span>
            <span className="capitalize">{state.config.environment}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Health indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
          </div>

          {/* User menu */}
          {state.user ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {state.user.username}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {state.user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Demo Mode
              </span>
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Navigation />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {state.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{state.error}</p>
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

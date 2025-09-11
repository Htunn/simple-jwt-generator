import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load micro-frontends
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TokenManager = React.lazy(() => import('./pages/TokenManager'));
const AuthManager = React.lazy(() => import('./pages/AuthManager'));
const ApiDocs = React.lazy(() => import('./pages/ApiDocs'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Import CSS
import './styles/index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tokens/*" element={<TokenManager />} />
                <Route path="/auth/*" element={<AuthManager />} />
                <Route path="/docs/*" element={<ApiDocs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;

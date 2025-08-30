import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardRedirect = () => {
  const { user, loading, isAuthenticated, getDashboardPath } = useAuth();

  useEffect(() => {
    // If user is authenticated and tries to access root, redirect to their dashboard
    if (!loading && isAuthenticated()) {
      const dashboardPath = getDashboardPath();
      if (dashboardPath !== '/') {
        window.location.href = dashboardPath;
      }
    }
  }, [user, loading, isAuthenticated, getDashboardPath]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, stay on homepage
  if (!isAuthenticated()) {
    return null; // Let the homepage render
  }

  // If authenticated, redirect to their dashboard
  const dashboardPath = getDashboardPath();
  return <Navigate to={dashboardPath} replace />;
};

export default DashboardRedirect;

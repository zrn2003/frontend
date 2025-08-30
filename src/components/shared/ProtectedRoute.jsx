import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

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

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, redirect to their dashboard
  if (requiredRole && !hasRole(requiredRole)) {
    const dashboardPath = getDashboardPathByRole(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Helper function to get dashboard path by role
const getDashboardPathByRole = (role) => {
  const userRole = role?.toLowerCase();
  
  switch (userRole) {
    case 'student':
      return '/student';
    case 'academic_leader':
    case 'academic':
      return '/academic';
    case 'university_admin':
    case 'university':
      return '/university';
    case 'admin':
    case 'manager':
    case 'viewer':
      return '/icm';
    default:
      return '/login';
  }
};

export default ProtectedRoute;

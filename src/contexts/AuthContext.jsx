import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const userRole = localStorage.getItem('userRole');
        
        if (userData && userRole) {
          const parsedUser = JSON.parse(userData);
          setUser({ ...parsedUser, role: userRole });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    const role = userData.role || userData.user?.role;
    const userInfo = userData.user || userData;
    
    setUser({ ...userInfo, role });
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('userRole', role);
    localStorage.setItem('userData', JSON.stringify(userInfo));
    localStorage.setItem('userType', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const userRole = user.role?.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    // Strict role mapping - each role can only access their specific dashboard
    const roleMap = {
      'student': ['student'],
      'academic_leader': ['academic_leader'],
      'university_admin': ['university_admin'],
      'icm': ['admin', 'manager', 'viewer'], // ICM dashboard accessible by admin, manager, viewer
      'admin': ['admin'],
      'manager': ['manager'],
      'viewer': ['viewer']
    };
    
    return roleMap[required]?.includes(userRole) || userRole === required;
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    
    const role = user.role?.toLowerCase();
    
    switch (role) {
      case 'student':
        return '/student';
      case 'academic_leader':
        return '/academic';
      case 'university_admin':
        return '/university';
      case 'admin':
      case 'manager':
      case 'viewer':
        return '/icm';
      default:
        return '/login';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getDashboardPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

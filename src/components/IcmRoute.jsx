import React from 'react';
import { Navigate } from 'react-router-dom';

const IcmRoute = ({ element }) => {
  const stored = localStorage.getItem('user') || localStorage.getItem('userData');
  if (!stored) {
    return <Navigate to="/login" replace />;
  }
  const user = JSON.parse(stored);
  const role = (user?.role || '').toLowerCase();
  if (role === 'student') {
    return <Navigate to="/student" replace />;
  }
  return element;
};

export default IcmRoute;

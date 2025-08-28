import React from 'react';
import { Navigate } from 'react-router-dom';

const StudentRoute = ({ element }) => {
  const storedUser = localStorage.getItem('userData');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = (user && user.role) || localStorage.getItem('userRole') || '';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role.toLowerCase() !== 'student') {
    // Non-students are redirected to ICM dashboard (or home)
    return <Navigate to="/icm" replace />;
  }

  return element;
};

export default StudentRoute;

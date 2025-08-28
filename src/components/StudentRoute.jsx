import React from 'react';
import { Navigate } from 'react-router-dom';

const StudentRoute = ({ element }) => {
  const storedUserData = localStorage.getItem('userData');
  const storedUser = storedUserData ? JSON.parse(storedUserData) : null;
  const storedRole = (localStorage.getItem('userRole') || '').toLowerCase();
  const role = (storedRole || (storedUser?.role || '')).toLowerCase();

  // Debug once per render to verify gate inputs
  try { console.debug('[StudentRoute]', { storedRole, role }); } catch {}

  // If we positively know the session is student, allow
  if (role === 'student') {
    return element;
  }

  // If no session, send to login
  if (!storedUser && !storedRole) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, non-student goes to ICM area
  return <Navigate to="/icm" replace />;
};

export default StudentRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function IcmRoute({ element, allowAcademic }) {
  const rawUser = localStorage.getItem('userData') || localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null
  if (!user) return <Navigate to="/login" replace />
  const role = (user.role || '').toLowerCase()
  if (role === 'student') return <Navigate to="/student" replace />
  if (allowAcademic && role === 'academic_leader') return element
  if (role === 'admin' || role === 'manager' || role === 'viewer') return element
  return <Navigate to="/login" replace />
}

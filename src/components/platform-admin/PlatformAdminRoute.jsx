import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const PlatformAdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth()

  // Check if user is authenticated and has platform admin role
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Check if user has the required role (platform admin or admin)
  if (!user || !['platform_admin', 'admin'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PlatformAdminRoute

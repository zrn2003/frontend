import { Navigate } from 'react-router-dom'

export default function AcademicRoute({ element }) {
  const rawUser = localStorage.getItem('userData') || localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null
  if (!user) return <Navigate to="/login" replace />
  const role = (user.role || '').toLowerCase()
  if (role === 'academic_leader' || role === 'admin') return element
  if (role === 'student') return <Navigate to="/student" replace />
  return <Navigate to="/icm" replace />
}

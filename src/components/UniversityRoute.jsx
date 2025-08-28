import { Navigate } from 'react-router-dom'

export default function UniversityRoute({ element }) {
  const rawUser = localStorage.getItem('userData') || localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null
  if (!user) return <Navigate to="/login" replace />
  const role = (user.role || '').toLowerCase()
  if (role === 'university_admin' || role === 'admin') return element
  if (role === 'student') return <Navigate to="/student" replace />
  if (role === 'academic_leader') return <Navigate to="/academic" replace />
  return <Navigate to="/icm" replace />
}

import { useState } from 'react'
import { api } from '../config/api.js'
import './LoginForm.css'
import { useNavigate } from 'react-router-dom'

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState('student') // default to student
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login({ email, password })

      const backendRole = (data?.user?.role || '').toLowerCase()
      if (!backendRole) throw new Error('Invalid account response.')

      // Validate entrypoint vs role; allow student entry via selector
      if (userType === 'student' && backendRole !== 'student') {
        const adjustedUser = { ...data.user, role: 'student' }
        localStorage.setItem('user', JSON.stringify(adjustedUser))
        localStorage.setItem('userData', JSON.stringify(adjustedUser))
        localStorage.setItem('userRole', 'student')
        localStorage.setItem('userType', userType)
        navigate('/student')
        setTimeout(() => { if (location.pathname !== '/student') location.assign('/student') }, 50)
        onSubmit && onSubmit({ email, password })
        return
      }

      if (userType === 'icm' && backendRole === 'student') {
        throw new Error('Student accounts must use the Student login.')
      }

      if (userType === 'academic' && backendRole !== 'academic_leader' && backendRole !== 'admin') {
        throw new Error('Only Academic Leader accounts can use the Academic login.')
      }
      
      // Store user info (both legacy and new keys)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('userData', JSON.stringify(data.user))
      localStorage.setItem('userRole', backendRole)
      localStorage.setItem('userType', userType)

      // Debug logging
      console.log('Login successful - stored user data:', {
        user: data.user,
        backendRole,
        userType,
        localStorage: {
          user: localStorage.getItem('user'),
          userData: localStorage.getItem('userData'),
          userRole: localStorage.getItem('userRole'),
          userType: localStorage.getItem('userType')
        }
      })

      // Redirect
      if (backendRole === 'student') {
        navigate('/student')
        setTimeout(() => { if (location.pathname !== '/student') location.assign('/student') }, 50)
      } else if (backendRole === 'academic_leader' || backendRole === 'admin') {
        navigate('/academic')
      } else if (backendRole === 'university_admin') {
        navigate('/university')
      } else if (backendRole === 'admin' || backendRole === 'manager' || backendRole === 'viewer') {
        navigate('/icm')
      } else {
        navigate('/')
      }

      onSubmit && onSubmit({ email, password })
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function evaluateStrength(pw) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw) || /[^\w\s]/.test(pw)) s++
    setPasswordStrength(s)
  }

  return (
    <div className="login-page">
      <aside className="brand-panel">
        <div className="brand-content">
          <div className="logo-mark" aria-hidden>ICM</div>
          <h2>Industry Collaboration Manager</h2>
          <p>Coordinate with partners, streamline approvals, and accelerate partnerships.</p>
          <ul className="highlights">
            <li>Secure role-based access</li>
            <li>Real-time partner updates</li>
            <li>Centralized records</li>
          </ul>
        </div>
      </aside>
      <main className="form-panel">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to continue</p>
          </div>

          {/* User type selector */}
          <div className="user-type-selector" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={`type-btn ${userType === 'icm' ? 'active' : ''}`}
              onClick={() => setUserType('icm')}
            >
              <span className="type-icon">🏭</span>
              <span className="type-text">Industry Collaboration Manager</span>
            </button>
            <button
              type="button"
              className={`type-btn ${userType === 'student' ? 'active' : ''}`}
              onClick={() => setUserType('student')}
            >
              <span className="type-icon">👨‍🎓</span>
              <span className="type-text">Student</span>
            </button>
            <button
              type="button"
              className={`type-btn ${userType === 'academic' ? 'active' : ''}`}
              onClick={() => setUserType('academic')}
            >
              <span className="type-icon">🎓</span>
              <span className="type-text">Academic Leader</span>
            </button>
            <button
              type="button"
              className={`type-btn ${userType === 'university' ? 'active' : ''}`}
              onClick={() => setUserType('university')}
            >
              <span className="type-icon">🏛️</span>
              <span className="type-text">University Admin</span>
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); evaluateStrength(e.target.value) }}
                  required
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && <div className="error" role="alert">{error}</div>}

            {userType === 'student' && (
              <div style={{ color:'#cbd5e1', fontSize:12, marginTop:6 }}>Tip: Use at least 8 chars with a number or symbol.</div>
            )}

            <div className={`strength s${passwordStrength}`} aria-hidden>
              <div className="bar" />
              <div className="bar" />
              <div className="bar" />
            </div>

            <button type="submit" className="submit" disabled={loading}>
              {loading ? 'Signing in…' : `Sign in as ${userType === 'student' ? 'Student' : userType === 'academic' ? 'Academic Leader' : userType === 'university' ? 'University Admin' : 'ICM'}`}
            </button>

            <div className="meta">
              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a className="link" href="#">Forgot password?</a>
            </div>
          </form>
          <div className="footer-note">
            <span>New here?</span>
            <a className="link" href="/signup">Create an account</a>
          </div>
          
          {/* Demo credentials */}
          <div style={{ 
            marginTop: 'var(--spacing-4)', 
            padding: 'var(--spacing-3)', 
            background: 'var(--surface)', 
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-muted)'
          }}>
            <strong>Demo Accounts:</strong><br/>
            Admin: admin@trustteams.com / admin123<br/>
            Manager: manager@trustteams.com / manager123<br/>
            Viewer: viewer@trustteams.com / viewer123
          </div>
        </div>
      </main>
    </div>
  )
}

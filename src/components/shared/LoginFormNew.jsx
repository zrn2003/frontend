import { useState } from 'react'
import { api } from '../../config/api.js'
import '../../styles/auth-design-system.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginFormNew({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState('student')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()
  const { login, getDashboardPath } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const data = await api.login({ email, password })

      const backendRole = (data?.user?.role || '').toLowerCase()
      if (!backendRole) throw new Error('Invalid account response.')

      // Check for rejected status
      if (data?.user?.approval_status === 'rejected') {
        throw new Error('Your registration has been rejected. Please contact your university administrator.')
      }

      // Strict role validation
      if (userType === 'student' && backendRole !== 'student') {
        throw new Error('This account is not a student account. Please use the appropriate login type.')
      }

      if (userType === 'icm' && !['admin', 'manager', 'viewer'].includes(backendRole)) {
        throw new Error('This account is not authorized for ICM access. Please use the appropriate login type.')
      }

      if (userType === 'academic' && backendRole !== 'academic_leader') {
        throw new Error('This account is not an Academic Leader account. Please use the appropriate login type.')
      }

      if (userType === 'university' && backendRole !== 'university_admin') {
        throw new Error('This account is not a University Admin account. Please use the appropriate login type.')
      }

      if (userType === 'platform_admin' && !['platform_admin', 'admin'].includes(backendRole)) {
        throw new Error('This account is not a Platform Admin account. Please use the appropriate login type.')
      }
      
      // Use the auth context to login
      login({ user: data.user, role: backendRole })

      // Redirect to appropriate dashboard
      const dashboardPath = getDashboardPath()
      navigate(dashboardPath)

      onSubmit && onSubmit({ email, password })
    } catch (e) {
      if (e.message && e.message.includes('verify your email')) {
        setError('Please verify your email address before signing in. Check your inbox for the verification link.')
      } else {
        setError(e.message || 'Something went wrong. Please try again.')
      }
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

  function getPanelContent() {
    switch (userType) {
      case 'icm':
        return {
          logo: 'TT',
          title: 'Industry Collaboration Manager',
          description: 'Coordinate with partners, streamline approvals, and accelerate partnerships.',
          highlights: [
            'Secure role-based access',
            'Real-time partner updates',
            'Centralized records'
          ]
        }
      case 'student':
        return {
          logo: 'TT',
          title: 'Student Portal',
          description: 'Access opportunities, track applications, and manage your academic journey.',
          highlights: [
            'Browse opportunities',
            'Track applications',
            'Manage profile'
          ]
        }
      case 'academic':
        return {
          logo: 'TT',
          title: 'Academic Leader Dashboard',
          description: 'Manage student applications, approve opportunities, and oversee academic partnerships.',
          highlights: [
            'Review applications',
            'Approve opportunities',
            'Academic oversight'
          ]
        }
      case 'university':
        return {
          logo: 'TT',
          title: 'University Administration',
          description: 'Manage institutional partnerships, oversee academic programs, and coordinate with industry.',
          highlights: [
            'Institutional management',
            'Program oversight',
            'Partnership coordination'
          ]
        }
      case 'platform_admin':
        return {
          logo: 'TT',
          title: 'Platform Administration',
          description: 'Monitor system health, manage user permissions, and oversee platform security.',
          highlights: [
            'System monitoring',
            'User management',
            'Security oversight',
            'Admin access'
          ]
        }
      default:
        return {
          logo: 'TT',
          title: 'Industry Collaboration Manager',
          description: 'Coordinate with partners, streamline approvals, and accelerate partnerships.',
          highlights: [
            'Secure role-based access',
            'Real-time partner updates',
            'Centralized records'
          ]
        }
    }
  }

  function getStrengthClass() {
    if (passwordStrength === 0) return ''
    if (passwordStrength === 1) return 'weak'
    if (passwordStrength === 2) return 'medium'
    return 'strong'
  }

  function getStrengthText() {
    if (passwordStrength === 0) return ''
    if (passwordStrength === 1) return 'Weak password'
    if (passwordStrength === 2) return 'Medium strength'
    return 'Strong password'
  }

  const panelContent = getPanelContent()

  return (
    <div className="auth-page">
      {/* Left Side - Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo-mark" aria-hidden>{panelContent.logo}</div>
          <h1 className="auth-brand-title">{panelContent.title}</h1>
          <p className="auth-brand-subtitle">{panelContent.description}</p>
          <ul className="auth-highlights">
            {panelContent.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Sign in to continue</p>
          </div>

          {/* User Type Selector */}
          <div className="auth-user-type-selector">
            <button
              type="button"
              className={`auth-type-btn ${userType === 'icm' ? 'active' : ''}`}
              onClick={() => setUserType('icm')}
            >
              Industry Collaboration Manager
            </button>
            <button
              type="button"
              className={`auth-type-btn ${userType === 'student' ? 'active' : ''}`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`auth-type-btn ${userType === 'academic' ? 'active' : ''}`}
              onClick={() => setUserType('academic')}
            >
              Academic Leader
            </button>
            <button
              type="button"
              className={`auth-type-btn ${userType === 'university' ? 'active' : ''}`}
              onClick={() => setUserType('university')}
            >
              University Admin
            </button>
            <button
              type="button"
              className={`auth-type-btn ${userType === 'platform_admin' ? 'active' : ''}`}
              onClick={() => setUserType('platform_admin')}
            >
              Platform Admin
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                className="auth-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { 
                    setPassword(e.target.value); 
                    evaluateStrength(e.target.value) 
                  }}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength > 0 && (
              <div className="auth-password-strength">
                <div className="auth-strength-bar">
                  <div className={`auth-strength-fill ${getStrengthClass()}`}></div>
                </div>
                <div className="auth-strength-text">
                  {getStrengthText()}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            {/* Password Tip for Students */}
            {userType === 'student' && (
              <div style={{ 
                color: 'var(--auth-text-secondary)', 
                fontSize: 'var(--auth-body-small-size)', 
                marginTop: 'var(--auth-spacing-8)',
                textAlign: 'center'
              }}>
                Tip: Use at least 8 characters with uppercase, lowercase, and numbers
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`auth-submit-btn ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading && <span className="auth-spinner"></span>}
              {loading ? 'Signing in...' : `Sign in as ${userType === 'student' ? 'Student' : userType === 'academic' ? 'Academic Leader' : userType === 'university' ? 'University Admin' : userType === 'platform_admin' ? 'Platform Admin' : 'ICM'}`}
            </button>

            {/* Demo Credentials */}
            <div style={{ 
              marginTop: 'var(--auth-spacing-24)', 
              padding: 'var(--auth-spacing-16)', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 'var(--auth-radius-input)',
              fontSize: 'var(--auth-body-small-size)',
              color: 'var(--auth-text-secondary)',
              textAlign: 'center'
            }}>
              <strong>Demo Accounts:</strong><br/>
              Admin: admin@trustteams.com / admin123<br/>
              Manager: manager@trustteams.com / manager123<br/>
              Viewer: viewer@trustteams.com / viewer123
            </div>
          </form>

          {/* Footer Links */}
          <div style={{ 
            marginTop: 'var(--auth-spacing-24)', 
            textAlign: 'center',
            fontSize: 'var(--auth-body-small-size)',
            color: 'var(--auth-text-secondary)'
          }}>
            <span>New here? </span>
            <a 
              href="/signup" 
              style={{ 
                color: 'var(--auth-input-focus)', 
                textDecoration: 'none' 
              }}
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { api } from '../../config/api.js'
import '../../styles/auth-design-system.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState('student') // default to student
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const navigate = useNavigate()
  const { login, getDashboardPath } = useAuth()

  const roleOptions = [
    { value: 'student', label: 'Student', icon: '👨‍🎓' },
    { value: 'icm', label: 'Industry Collaboration Manager', icon: '🏭' },
    { value: 'academic', label: 'Academic Leader', icon: '🎓' },
    { value: 'university', label: 'University Admin', icon: '🏛️' },
    { value: 'platform_admin', label: 'Platform Admin', icon: '⚙️' }
  ]

  const selectedRole = roleOptions.find(role => role.value === userType)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showRoleDropdown) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setShowRoleDropdown(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % roleOptions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev <= 0 ? roleOptions.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0) {
          setUserType(roleOptions[focusedIndex].value)
          setShowRoleDropdown(false)
          setFocusedIndex(-1)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowRoleDropdown(false)
        setFocusedIndex(-1)
        break
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login({ email, password })

      const backendRole = (data?.user?.role || '').toLowerCase()
      if (!backendRole) throw new Error('Invalid account response.')

      // Check for rejected status (students and academic leaders are now auto-approved)
      if (data?.user?.approval_status === 'rejected') {
        throw new Error('Your registration has been rejected. Please contact your university administrator.')
      }

      // Strict role validation - users can only login through their designated login type
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
      // Handle email verification errors
      if (e.message && e.message.includes('verify your email')) {
        setError('Please verify your email address before signing in. Check your inbox for the verification link.');
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
          description: 'Monitor system health, manage user permissions, and oversee platform security. Accessible by Platform Admins and System Admins.',
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

          {/* Role Dropdown */}
          <div className="auth-field">
            <label className="auth-label">Select your role</label>
            <div className="auth-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="auth-dropdown-button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                onKeyDown={handleKeyDown}
                aria-expanded={showRoleDropdown}
                aria-haspopup="listbox"
              >
                <span className="auth-dropdown-icon">{selectedRole?.icon}</span>
                <span className="auth-dropdown-text">{selectedRole?.label}</span>
                <span className={`auth-dropdown-arrow ${showRoleDropdown ? 'open' : ''}`}>▼</span>
              </button>
              
              {showRoleDropdown && (
                <div className="auth-dropdown-menu" role="listbox">
                  {roleOptions.map((role, index) => (
                    <button
                      key={role.value}
                      type="button"
                      className={`auth-dropdown-item ${userType === role.value ? 'selected' : ''} ${focusedIndex === index ? 'focused' : ''}`}
                      onClick={() => {
                        setUserType(role.value)
                        setShowRoleDropdown(false)
                        setFocusedIndex(-1)
                      }}
                      onKeyDown={handleKeyDown}
                      role="option"
                      aria-selected={userType === role.value}
                    >
                      <span className="auth-dropdown-item-icon">{role.icon}</span>
                      <span className="auth-dropdown-item-text">{role.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                  <div className={`auth-strength-fill ${
                    passwordStrength === 1 ? 'weak' : 
                    passwordStrength === 2 ? 'medium' : 'strong'
                  }`}></div>
                </div>
                <div className="auth-strength-text">
                  {passwordStrength === 1 ? 'Weak password' : 
                   passwordStrength === 2 ? 'Medium strength' : 'Strong password'}
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

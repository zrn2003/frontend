import { useState } from 'react'
import { api } from '../../config/api.js'
import '../../styles/auth-design-system.css'
import { useNavigate } from 'react-router-dom'

export default function SignupFormNew({ onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    university: '',
    studentId: '',
    academicRole: '',
    icmCompany: '',
    icmRole: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Evaluate password strength when password changes
    if (name === 'password') {
      evaluateStrength(value)
    }
  }

  const handleUserTypeChange = (userType) => {
    setFormData(prev => ({
      ...prev,
      userType,
      // Reset role-specific fields when user type changes
      studentId: '',
      academicRole: '',
      icmCompany: '',
      icmRole: ''
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      // Prepare registration data based on user type
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.userType,
        ...(formData.userType === 'student' && {
          university: formData.university,
          studentId: formData.studentId
        }),
        ...(formData.userType === 'academic_leader' && {
          university: formData.university,
          academicRole: formData.academicRole
        }),
        ...(formData.userType === 'icm' && {
          company: formData.icmCompany,
          role: formData.icmRole
        })
      }

      // Call registration API
      await api.register(registrationData)

      setSuccess('Registration successful! Please check your email for verification.')
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)

      onSubmit && onSubmit(registrationData)
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.')
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

  function getPanelContent() {
    switch (formData.userType) {
      case 'icm':
        return {
          logo: 'TT',
          title: 'Industry Collaboration Manager',
          description: 'Join our platform to connect with universities and streamline partnerships.',
          highlights: [
            'Partner with universities',
            'Manage opportunities',
            'Track collaborations'
          ]
        }
      case 'student':
        return {
          logo: 'TT',
          title: 'Student Portal',
          description: 'Start your journey with industry collaboration opportunities.',
          highlights: [
            'Discover opportunities',
            'Build your profile',
            'Connect with industry'
          ]
        }
      case 'academic_leader':
        return {
          logo: 'TT',
          title: 'Academic Leader',
          description: 'Lead your institution\'s industry collaboration initiatives.',
          highlights: [
            'Manage partnerships',
            'Oversee opportunities',
            'Guide students'
          ]
        }
      default:
        return {
          logo: 'TT',
          title: 'TrustTeams',
          description: 'Join our industry collaboration platform.',
          highlights: [
            'Secure registration',
            'Role-based access',
            'Industry connections'
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
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-subtitle">Join our platform today</p>
          </div>

          {/* User Type Selector */}
          <div className="auth-user-type-selector">
            <button
              type="button"
              className={`auth-type-btn ${formData.userType === 'student' ? 'active' : ''}`}
              onClick={() => handleUserTypeChange('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`auth-type-btn ${formData.userType === 'academic_leader' ? 'active' : ''}`}
              onClick={() => handleUserTypeChange('academic_leader')}
            >
              Academic Leader
            </button>
            <button
              type="button"
              className={`auth-type-btn ${formData.userType === 'icm' ? 'active' : ''}`}
              onClick={() => handleUserTypeChange('icm')}
            >
              Industry Partner
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="auth-field">
              <label className="auth-label">First Name</label>
              <input
                type="text"
                name="firstName"
                className="auth-input"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="auth-input"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Role-specific fields */}
            {formData.userType === 'student' && (
              <>
                <div className="auth-field">
                  <label className="auth-label">University</label>
                  <input
                    type="text"
                    name="university"
                    className="auth-input"
                    placeholder="Enter your university name"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    className="auth-input"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {formData.userType === 'academic_leader' && (
              <>
                <div className="auth-field">
                  <label className="auth-label">University</label>
                  <input
                    type="text"
                    name="university"
                    className="auth-input"
                    placeholder="Enter your university name"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Academic Role</label>
                  <input
                    type="text"
                    name="academicRole"
                    className="auth-input"
                    placeholder="e.g., Professor, Dean, Department Head"
                    value={formData.academicRole}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {formData.userType === 'icm' && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Company</label>
                  <input
                    type="text"
                    name="icmCompany"
                    className="auth-input"
                    placeholder="Enter your company name"
                    value={formData.icmCompany}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Role</label>
                  <input
                    type="text"
                    name="icmRole"
                    className="auth-input"
                    placeholder="e.g., Manager, Director, Partner"
                    value={formData.icmRole}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
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

            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div style={{ 
              color: 'var(--auth-text-secondary)', 
              fontSize: 'var(--auth-body-small-size)', 
              marginTop: 'var(--auth-spacing-8)',
              textAlign: 'center'
            }}>
              Password must be at least 8 characters with uppercase, lowercase, and numbers
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="auth-success-msg" role="alert">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`auth-submit-btn ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading && <span className="auth-spinner"></span>}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Links */}
          <div style={{ 
            marginTop: 'var(--auth-spacing-24)', 
            textAlign: 'center',
            fontSize: 'var(--auth-body-small-size)',
            color: 'var(--auth-text-secondary)'
          }}>
            <span>Already have an account? </span>
            <a 
              href="/login" 
              style={{ 
                color: 'var(--auth-input-focus)', 
                textDecoration: 'none' 
              }}
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

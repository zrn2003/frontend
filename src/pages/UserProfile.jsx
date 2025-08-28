import { useState, useEffect } from 'react'
import { api } from '../config/api.js'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    setLoading(true)
    try {
      // Get user from localStorage (in real app, this would come from JWT/session)
      const userData = localStorage.getItem('user')
      if (!userData) {
        window.location.href = '/'
        return
      }
      
      const userInfo = JSON.parse(userData)
      setUser(userInfo)
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (e) {
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required to change password')
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match')
        }
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters')
        }
      }

      const payload = {
        name: formData.name,
        email: formData.email
      }

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword
        payload.newPassword = formData.newPassword
      }

      const data = await api.updateProfile(payload)

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
    } catch (e) {
      setError(e.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading && !user) {
    return (
      <div className="page-container">
        <nav className="nav-bar">
          <div className="nav-container">
            <a href="/icm" className="nav-brand">ICM Dashboard</a>
            <div className="nav-links">
              <a href="/opportunities" className="link">All Opportunities</a>
              <a href="/" className="link">Logout</a>
            </div>
          </div>
        </nav>
        <div className="content-wrapper">
          <div className="card">
            <div className="loading-skeleton" style={{ height: '20px', marginBottom: '8px' }}></div>
            <div className="loading-skeleton" style={{ height: '16px', width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <nav className="nav-bar">
        <div className="nav-container">
          <a href="/icm" className="nav-brand">ICM Dashboard</a>
          <div className="nav-links">
            <a href="/opportunities" className="link">All Opportunities</a>
            <a href="/profile" className="link">Profile</a>
            <a href="/" className="link">Logout</a>
          </div>
        </div>
      </nav>
      
      <div className="content-wrapper">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-header">
            <h1>User Profile</h1>
            <p>Manage your account information and settings</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="profile-info">
            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Role</label>
                  <span className="info-value">{user?.role}</span>
                </div>
                <div className="info-item">
                  <label>Role Description</label>
                  <span className="info-value">{user?.roleDescription}</span>
                </div>
                <div className="info-item">
                  <label>User ID</label>
                  <span className="info-value">{user?.id}</span>
                </div>
                {user?.lastLogin && (
                  <div className="info-item">
                    <label>Last Login</label>
                    <span className="info-value">
                      {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span className="info-value">{user?.name || 'Not set'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span className="info-value">{user?.email}</span>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--spacing-4)' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="profile-section">
                <h3>Edit Personal Information</h3>
                
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password (only if changing password)"
                    disabled={loading}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    Only required if you want to change your password
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password (optional)"
                    disabled={loading}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    Leave blank to keep current password
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setError('')
                      setSuccess('')
                      // Reset form data
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

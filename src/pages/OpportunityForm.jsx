import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../config/api.js'

export default function OpportunityForm({ mode = 'create' }) {
  const [user, setUser] = useState(null)

  // Check if user is authenticated
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    if (!userData.id) {
      window.location.href = '/'
      return
    }
    setUser(userData)
  }, [])

  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('other')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('open')
  const [closingDate, setClosingDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (mode === 'edit' && id) {
      async function loadOpportunity() {
        try {
          setLoading(true)
          const data = await api.getOpportunity(id)
          
          const opportunity = data.opportunity
          
          // Check if user has permission to edit this opportunity
          if (user && user.role !== 'admin' && opportunity.postedBy !== user.id) {
            setError('You do not have permission to edit this opportunity')
            return
          }
          
          setTitle(opportunity.title || '')
          setType(opportunity.type || 'other')
          setDescription(opportunity.description || '')
          setLocation(opportunity.location || '')
          setStatus(opportunity.status || 'open')
          setClosingDate(opportunity.closingDate ? opportunity.closingDate.split('T')[0] : '')
        } catch (e) {
          setError(e.message || 'Failed to load')
        } finally {
          setLoading(false)
        }
      }
      loadOpportunity()
    }
  }, [mode, id])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const payload = { title, type, description, location, status, closingDate }
      
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        throw new Error('User not authenticated. Please login again.')
      }

      if (mode === 'edit') {
        await api.updateOpportunity(id, payload)
      } else {
        await api.createOpportunity(payload)
      }
      
      setSuccess(mode === 'edit' ? 'Opportunity updated successfully!' : 'Opportunity posted successfully!')
      
      // Redirect to dashboard after a short delay to show success message
      setTimeout(() => {
        window.location.href = '/icm'
      }, 1500)
      
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page-container">
      <nav className="nav-bar">
        <div className="nav-container">
          <a href="/icm" className="nav-brand">ICM Dashboard</a>
          <div className="nav-links">
            <a href="/opportunities" className="link">All Opportunities</a>
            <a href="/profile" className="link">Profile</a>
            <a href="/" className="link" onClick={(e) => {
              e.preventDefault()
              localStorage.removeItem('user')
              window.location.href = '/'
            }}>Logout</a>
          </div>
        </div>
      </nav>
      
      <div className="content-wrapper">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h1>{mode === 'edit' ? 'Edit Opportunity' : 'Post New Opportunity'}</h1>
            <p>{mode === 'edit' ? 'Update the opportunity details below.' : 'Fill in the details to post a new collaboration opportunity.'}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineering Internship"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
              >
                <option value="internship">Internship</option>
                <option value="job">Job</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the opportunity, requirements, and benefits..."
                rows={6}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA or Remote"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Closing Date</label>
              <input
                type="date"
                className="form-input"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                min={today}
                placeholder="Select closing date"
                disabled={loading}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
                When should applications close? (Optional)
              </small>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : (mode === 'edit' ? 'Update Opportunity' : 'Post Opportunity')}
              </button>
              <a href="/opportunities" className="btn btn-secondary">
                Cancel
              </a>
              <a href="/icm" className="btn btn-secondary">
                Back to Dashboard
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



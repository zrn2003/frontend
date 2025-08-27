import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function OpportunityForm({ mode = 'create' }) {
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
          const res = await fetch(`/api/opportunities/${id}`)
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || 'Failed to load')
          
          setTitle(data.title || '')
          setType(data.type || 'other')
          setDescription(data.description || '')
          setLocation(data.location || '')
          setStatus(data.status || 'open')
          setClosingDate(data.closing_date ? data.closing_date.split('T')[0] : '')
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
      
      const url = mode === 'edit' ? `/api/opportunities/${id}` : '/api/opportunities'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save')
      
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
            <a href="/" className="link">Logout</a>
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



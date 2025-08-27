import { useEffect, useState } from 'react'

export default function IcmDashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    expiring: 0
  })

  useEffect(() => {
    loadOpportunities()
  }, [])

  async function loadOpportunities() {
    setLoading(true)
    try {
      const res = await fetch('/api/opportunities?limit=10&sortBy=created_at&sortOrder=DESC')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load')
      
      setItems(data.items || [])
      
      // Calculate stats
      const total = data.pagination?.total || 0
      const open = data.items?.filter(o => o.status === 'open').length || 0
      const closed = data.items?.filter(o => o.status === 'closed').length || 0
      const expiring = data.items?.filter(o => {
        if (!o.closingDate || o.status === 'closed') return false
        const closingDate = new Date(o.closingDate)
        const now = new Date()
        const daysUntilClosing = Math.ceil((closingDate - now) / (1000 * 60 * 60 * 24))
        return daysUntilClosing <= 7 && daysUntilClosing > 0
      }).length || 0
      
      setStats({ total, open, closed, expiring })
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if opportunity is expired
  const isExpired = (closingDate) => {
    if (!closingDate) return false
    return new Date(closingDate) < new Date()
  }

  // Get days until closing
  const getDaysUntilClosing = (closingDate) => {
    if (!closingDate) return null
    const closing = new Date(closingDate)
    const now = new Date()
    const days = Math.ceil((closing - now) / (1000 * 60 * 60 * 24))
    return days
  }

  // Get status badge color
  const getStatusColor = (status, closingDate) => {
    if (status === 'closed') return 'var(--error)'
    if (closingDate && isExpired(closingDate)) return 'var(--error)'
    const daysUntil = getDaysUntilClosing(closingDate)
    if (daysUntil !== null && daysUntil <= 3) return 'var(--warning)'
    return 'var(--success)'
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--primary)' }}>
                {stats.total}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Total Opportunities
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--success)' }}>
                {stats.open}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Open Positions
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--warning)' }}>
                {stats.expiring}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Expiring Soon
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--error)' }}>
                {stats.closed}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Closed Positions
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Card */}
        <div className="card">
          <div className="card-header">
            <h1>Welcome to ICM</h1>
            <p>Industry Collaboration Manager - Post and manage collaboration opportunities.</p>
            <div className="flex gap-4">
              <a href="/opportunities/new" className="btn btn-primary">
                + Post New Opportunity
              </a>
              <a href="/opportunities" className="btn btn-secondary">
                View All Opportunities
              </a>
            </div>
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
          <div className="card-header">
            <h2>Recent Opportunities</h2>
            <p>Latest opportunities posted in the system</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="opportunity-card">
                  <div className="loading-skeleton" style={{ height: '20px', marginBottom: '8px' }}></div>
                  <div className="loading-skeleton" style={{ height: '16px', width: '60%' }}></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <div className="grid grid-cols-1">
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-4)' }}>
                    No opportunities posted yet. Create your first one!
                  </p>
                  <a href="/opportunities/new" className="btn btn-primary">
                    Post Your First Opportunity
                  </a>
                </div>
              ) : (
                items.map((o) => (
                  <div key={o.id} className="opportunity-card">
                    <div className="opportunity-header">
                      <div style={{ flex: 1 }}>
                        <h3 className="opportunity-title">{o.title}</h3>
                        <div className="opportunity-meta">
                          <span className="opportunity-type">{o.type}</span>
                          <span 
                            className={`opportunity-status ${o.status}`} 
                            style={{ 
                              marginLeft: 'var(--spacing-2)',
                              backgroundColor: getStatusColor(o.status, o.closingDate) + '20',
                              color: getStatusColor(o.status, o.closingDate)
                            }}
                          >
                            {o.status}
                          </span>
                          <span style={{ marginLeft: 'var(--spacing-2)' }}>
                            📍 {o.location || 'Remote/NA'}
                          </span>
                          {o.closingDate && (
                            <span style={{
                              marginLeft: 'var(--spacing-2)',
                              color: isExpired(o.closingDate) ? 'var(--error)' : 'var(--text-muted)',
                              fontWeight: isExpired(o.closingDate) ? '500' : 'normal'
                            }}>
                              📅 Closes: {formatDate(o.closingDate)}
                              {isExpired(o.closingDate) && ' (Expired)'}
                              {!isExpired(o.closingDate) && getDaysUntilClosing(o.closingDate) <= 7 && (
                                ` (${getDaysUntilClosing(o.closingDate)} days left)`
                              )}
                            </span>
                          )}
                          {o.postedByName && (
                            <span style={{ marginLeft: 'var(--spacing-2)', color: 'var(--text-muted)' }}>
                              👤 by {o.postedByName}
                            </span>
                          )}
                          <span style={{ marginLeft: 'var(--spacing-2)', color: 'var(--text-muted)' }}>
                            📅 Posted: {formatDate(o.createdAt)}
                          </span>
                        </div>
                        {o.description && (
                          <p style={{ 
                            marginTop: 'var(--spacing-3)', 
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            lineHeight: 1.5
                          }}>
                            {o.description.length > 150 
                              ? o.description.substring(0, 150) + '...' 
                              : o.description
                            }
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <a href={`/opportunities/${o.id}/edit`} className="btn btn-secondary btn-sm">
                          ✏️ Edit
                        </a>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this opportunity?')) {
                              try {
                                const res = await fetch(`/api/opportunities/${o.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' }
                                })
                                if (res.ok) {
                                  loadOpportunities() // Refresh the list
                                } else {
                                  alert('Failed to delete opportunity')
                                }
                              } catch (err) {
                                alert('Error deleting opportunity')
                              }
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {items.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)' }}>
                  <a href="/opportunities" className="btn btn-secondary">
                    View All Opportunities ({stats.total})
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



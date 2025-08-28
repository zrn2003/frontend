import { useEffect, useState } from 'react'
import { api } from '../config/api.js'
import SearchBar from '../components/SearchBar'

export default function OpportunitiesList() {
  // Check if user is authenticated
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      window.location.href = '/'
      return
    }
  }, [])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: '',
    type: '',
    location: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    limit: 20,
    offset: 0
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  })

  useEffect(() => {
    loadOpportunities()
  }, [searchParams])

  async function loadOpportunities() {
    setLoading(true)
    try {
      const data = await api.getOpportunities(searchParams)
      setItems(data.opportunities || [])
      setPagination(data.pagination || { total: 0, limit: 20, offset: 0, hasMore: false })
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm) => {
    setSearchParams(prev => ({ ...prev, search: searchTerm, offset: 0 }))
  }

  const handleFilter = (filters) => {
    setSearchParams(prev => ({ 
      ...prev, 
      ...filters, 
      offset: 0 
    }))
  }

  const handleSort = (sortBy, sortOrder) => {
    setSearchParams(prev => ({ 
      ...prev, 
      sortBy, 
      sortOrder, 
      offset: 0 
    }))
  }

  const handlePageChange = (newOffset) => {
    setSearchParams(prev => ({ ...prev, offset: newOffset }))
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
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const closing = new Date(closingDate)
    closing.setHours(0, 0, 0, 0) // Reset time to start of day
    return closing < today
  }

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
        <div className="card">
          <div className="card-header">
            <h1>All Opportunities</h1>
            <div className="flex gap-4">
              <a href="/opportunities/new" className="btn btn-primary">
                + Post New Opportunity
              </a>
              <a href="/icm" className="btn btn-secondary">
                ← Back to Dashboard
              </a>
            </div>
          </div>
          
          <SearchBar 
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            loading={loading}
          />
          
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
            <>
              <div className="grid grid-cols-1">
                {items.map((o) => (
                  <div key={o.id} className="opportunity-card">
                    <div className="opportunity-header">
                      <div>
                        <h3 className="opportunity-title">{o.title}</h3>
                        <div className="opportunity-meta">
                          <span className="opportunity-type">{o.type}</span>
                                                     <span className={`opportunity-status ${o.status}`} style={{ 
                             marginLeft: 'var(--spacing-2)',
                             backgroundColor: o.status === 'open' ? 'var(--success)' : 'var(--error)',
                             color: 'white',
                             padding: '2px 8px',
                             borderRadius: '4px',
                             fontSize: 'var(--font-size-sm)'
                           }}>
                             {o.status}
                           </span>
                          <span style={{ marginLeft: 'var(--spacing-2)' }}>
                            {o.location || 'Remote/NA'}
                          </span>
                                                     {o.closingDate && (
                             <span style={{ 
                               marginLeft: 'var(--spacing-2)', 
                               color: isExpired(o.closingDate) ? 'var(--error)' : 'var(--text-muted)',
                               fontWeight: isExpired(o.closingDate) ? '500' : 'normal'
                             }}>
                               📅 Closes: {formatDate(o.closingDate)}
                               {isExpired(o.closingDate) && ' ⏰ (Expired)'}
                             </span>
                           )}
                                                     {o.postedByName && (
                             <span style={{ marginLeft: 'var(--spacing-2)', color: 'var(--text-muted)' }}>
                               by {o.postedByName}
                             </span>
                           )}
                           <span style={{ marginLeft: 'var(--spacing-2)', color: 'var(--text-muted)' }}>
                             📅 Posted: {formatDate(o.createdAt)}
                           </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/opportunities/${o.id}/edit`} className="btn btn-secondary btn-sm">
                          Edit
                        </a>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this opportunity?')) {
                              try {
                                const user = JSON.parse(localStorage.getItem('user') || '{}')
                                if (!user.id) {
                                  alert('User not authenticated. Please login again.')
                                  return
                                }

                                                                 await api.deleteOpportunity(o.id)
                                 loadOpportunities()
                              } catch (err) {
                                alert('Error deleting opportunity')
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    No opportunities found. {searchParams.search || searchParams.status || searchParams.type || searchParams.location ? 'Try adjusting your filters.' : 'Create your first one!'}
                  </p>
                )}
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                  >
                    Previous
                  </button>
                  
                  <span style={{ padding: 'var(--spacing-2)' }}>
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={!pagination.hasMore}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
 }
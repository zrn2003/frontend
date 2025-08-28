import { useEffect, useMemo, useState } from 'react'
import './AcademicDashboard.css'

export default function AcademicDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // UI state
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at_desc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}')
      const res = await fetch('/api/academic/students', { headers: { 'x-user-id': String(user.id) } })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load students')
      }
      const data = await res.json()
      // Add UI-only status fallback
      const withStatus = (data.students || []).map(s => ({ ...s, status: s.status || 'active' }))
      setStudents(withStatus)
    } catch (e) {
      setError(e.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return
    try {
      const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}')
      const res = await fetch(`/api/academic/students/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': String(user.id) }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Delete failed')
      }
      await fetchStudents()
      alert('Student deleted')
    } catch (e) {
      alert(e.message || 'Delete failed')
    }
  }

  useEffect(() => { fetchStudents() }, [])

  const filtered = useMemo(() => {
    let list = students
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(s => (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q))
    }
    if (statusFilter) list = list.filter(s => (s.status || 'active') === statusFilter)

    const sorted = [...list]
    sorted.sort((a,b) => {
      switch (sortBy) {
        case 'name_asc': return (a.name||'').localeCompare(b.name||'')
        case 'name_desc': return (b.name||'').localeCompare(a.name||'')
        case 'created_at_asc': return new Date(a.created_at) - new Date(b.created_at)
        case 'created_at_desc': default: return new Date(b.created_at) - new Date(a.created_at)
      }
    })
    return sorted
  }, [students, query, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize)

  const stats = useMemo(() => ({
    total: filtered.length,
    active: filtered.filter(s => s.status === 'active').length,
    completed: filtered.filter(s => s.status === 'completed').length,
  }), [filtered])

  const avatarOf = (name, email) => {
    const token = (name || email || 'U').trim()
    return token.charAt(0).toUpperCase()
  }

  return (
    <div className="academic-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🎓 Institute</h2>
        <nav>
          <button className="nav-btn active">📊 Dashboard</button>
          <button className="nav-btn">👩‍🎓 Students</button>
          <button className="nav-btn" disabled>📚 Courses</button>
          <button className="nav-btn" disabled>👨‍🏫 Mentors</button>
          <button className="nav-btn" disabled>🏆 Achievements</button>
          <button className="nav-btn" disabled>⚙️ Settings</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header className="dashboard-header">
          <h1>Academic Leader Dashboard</h1>
          <p>Overview of student progress and institute performance</p>
        </header>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <h2>{stats.total}</h2>
            <p>Total Students</p>
          </div>
          <div className="kpi-card">
            <h2>{stats.active}</h2>
            <p>Active Students</p>
          </div>
          <div className="kpi-card">
            <h2>{stats.completed}</h2>
            <p>Completed Courses</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input value={query} onChange={e=>{ setPage(1); setQuery(e.target.value) }} placeholder="Search name or email" />
          <select value={statusFilter} onChange={e=>{ setPage(1); setStatusFilter(e.target.value) }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={sortBy} onChange={e=> setSortBy(e.target.value)}>
            <option value="created_at_desc">Newest first</option>
            <option value="created_at_asc">Oldest first</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>

        {/* Student List */}
        <section className="students-section">
          <h3>Students in Your Institute</h3>
          {loading ? (
            <div className="loading">⏳ Loading students...</div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchStudents}>Retry</button>
            </div>
          ) : pageItems.length === 0 ? (
            <p className="empty">No students found.</p>
          ) : (
            <>
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(s => (
                    <tr key={s.id} className="student-row">
                      <td>
                        <div className="student-meta">
                          <div className="student-avatar">{avatarOf(s.name, s.email)}</div>
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td>{s.email}</td>
                      <td>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${s.status}`}>{s.status}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary" onClick={() => deleteStudent(s.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button className="btn btn-secondary" disabled={page===1} onClick={()=> setPage(p=>p-1)}>Prev</button>
                <span style={{ alignSelf:'center' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-secondary" disabled={page===totalPages} onClick={()=> setPage(p=>p+1)}>Next</button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

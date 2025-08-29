import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../config/api.js'
import './AcademicDashboard.css'

export default function AcademicDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)
  const [inst, setInst] = useState(null)
  const [editingInst, setEditingInst] = useState(false)

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
      const data = await api.getAcademicStudents()
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
      await api.deleteAcademicStudent(id)
      await fetchStudents()
      alert('Student deleted')
    } catch (e) {
      alert(e.message || 'Delete failed')
    }
  }

  useEffect(() => { fetchStudents() }, [])
  useEffect(() => {
    const onDoc = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // Load institute profile (localStorage fallback; replace with API when available)
  useEffect(() => {
    const saved = localStorage.getItem('tt_institute_profile')
    if (saved) {
      setInst(JSON.parse(saved))
    } else {
      setInst({
        name: 'Prestige University',
        tagline: 'Excellence in education since 1985',
        address: '123 Education Street, Academic City',
        website: 'https://www.prestige.edu',
        contact: '+91 98765 43210',
        established: '1985',
        affiliation: 'National Education Board',
        leadership: [
          { id: 'l1', name: 'Dr. Kavita Rao', role: 'Director' },
          { id: 'l2', name: 'Prof. Arjun Mehta', role: 'Principal' }
        ],
        programs: [
          { id: 'p1', title: 'Computer Science', degree: "Bachelor's", students: 120 },
          { id: 'p2', title: 'Electronics', degree: "Bachelor's", students: 98 },
          { id: 'p3', title: 'MBA', degree: "Master's", students: 85 }
        ],
        partners: ['TechCorp','DataWorks','GlobalEdu'],
        achievements: [ { id:'a1', year: '2024', title: 'Top 50 National Ranking' } ],
        announcements: [ { id:'n1', date: '2025-08-20', content: 'New course registrations open' } ]
      })
    }
  }, [])

  const saveInstitute = () => {
    localStorage.setItem('tt_institute_profile', JSON.stringify(inst))
    setEditingInst(false)
  }

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
    faculty: 42,
    courses: 28,
    reports: 5
  }), [filtered])

  // Simple counter animation
  const useCounter = (target) => {
    const [val, setVal] = useState(0)
    useEffect(() => {
      let raf
      const start = performance.now()
      const duration = 800
      const from = 0
      const step = (t) => {
        const p = Math.min(1, (t - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(from + (target - from) * eased))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      return () => cancelAnimationFrame(raf)
    }, [target])
    return val
  }

  const cTotal = useCounter(stats.total)
  const cFaculty = useCounter(stats.faculty)
  const cCourses = useCounter(stats.courses)
  const cReports = useCounter(stats.reports)

  // Demo activity and announcements
  const activities = [
    { id: 'a1', icon: '🎓', text: 'Student Priya Sharma added to CSE', at: '2h ago' },
    { id: 'a2', icon: '📄', text: 'Report generated: Q2 Performance', at: '5h ago' },
    { id: 'a3', icon: '📚', text: 'Course syllabus updated: DS-201', at: '1d ago' },
    { id: 'a4', icon: '🤝', text: 'Partnership signed with TechCorp', at: '2d ago' }
  ]
  const announcements = [
    { id: 'n1', date: '2025-09-15', title: 'Annual Conference', desc: 'Register now for the annual conference.' },
    { id: 'n2', date: '2025-08-20', title: 'New Courses', desc: 'Explore fall semester offerings.' },
    { id: 'n3', date: '2025-08-10', title: 'Faculty Meeting', desc: 'All faculty meet Friday 4 PM.' }
  ]
  const [carouselIdx, setCarouselIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setCarouselIdx(i => (i + 1) % announcements.length), 3000)
    return () => clearInterval(id)
  }, [announcements.length])

  // Reports demo datasets
  const perfBySemester = [68, 72, 75, 80, 78, 84]
  const facultyWorkload = [12, 10, 16, 14, 9, 11]
  const partnershipImpact = [20, 28, 32, 40, 44, 53]

  const exportCSV = (rows, filename) => {
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
  }

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
          <button className={`nav-btn ${activeSection==='dashboard' ? 'active' : ''}`} onClick={()=>setActiveSection('dashboard')}>🏠 Dashboard</button>
          <button className={`nav-btn ${activeSection==='students' ? 'active' : ''}`} onClick={()=>setActiveSection('students')}>🎓 Students</button>
          <button className={`nav-btn ${activeSection==='faculty' ? 'active' : ''}`} onClick={()=>setActiveSection('faculty')}>👨‍🏫 Faculty</button>
          <button className={`nav-btn ${activeSection==='courses' ? 'active' : ''}`} onClick={()=>setActiveSection('courses')}>📚 Courses</button>
          <button className={`nav-btn ${activeSection==='partnerships' ? 'active' : ''}`} onClick={()=>setActiveSection('partnerships')}>🤝 Partnerships</button>
          <button className={`nav-btn ${activeSection==='reports' ? 'active' : ''}`} onClick={()=>setActiveSection('reports')}>📊 Reports</button>
          <button className={`nav-btn ${activeSection==='institute' ? 'active' : ''}`} onClick={()=>setActiveSection('institute')}>🏫 Institute Profile</button>
          <button className={`nav-btn ${activeSection==='settings' ? 'active' : ''}`} onClick={()=>setActiveSection('settings')}>⚙️ Settings</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header className="dashboard-header">
          <div className="header-row">
            <div className="brand-left">
              <span className="brand-logo">🏫</span>
              <h1>Academic Leader Dashboard</h1>
            </div>
            <div className="brand-center">
              <input className="search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students / courses / faculty" />
            </div>
            <div className="brand-right" ref={profileRef}>
              <button className="profile-btn" onClick={(e)=>{ e.stopPropagation(); setShowProfile(v=>!v) }}>
                <span className="profile-avatar">AL</span>
                <span>▾</span>
              </button>
              {showProfile && (
                <div className="profile-menu">
                  <button>Profile</button>
                  <button>Settings</button>
                  <button onClick={()=>{ localStorage.clear(); window.location.href='/' }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeSection === 'dashboard' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card"><div className="kpi-icon">🎓</div><div className="kpi-content"><h2>{cTotal}</h2><p>Total Students</p></div></div>
              <div className="kpi-card"><div className="kpi-icon">👨‍🏫</div><div className="kpi-content"><h2>{cFaculty}</h2><p>Total Faculty</p></div></div>
              <div className="kpi-card"><div className="kpi-icon">📚</div><div className="kpi-content"><h2>{cCourses}</h2><p>Active Courses</p></div></div>
              <div className="kpi-card"><div className="kpi-icon">📊</div><div className="kpi-content"><h2>{cReports}</h2><p>Pending Reports</p></div></div>
            </div>

            <div className="dashboard-grid">
              <section className="dashboard-card">
                <h3>Recent Activities</h3>
                <div className="activities-list">
                  {activities.map(a => (
                    <div key={a.id} className="activity-item">
                      <div className="activity-icon">{a.icon}</div>
                      <div className="activity-content">
                        <h4>{a.text}</h4>
                        <span className="activity-time">{a.at}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="dashboard-card">
                <h3>Announcements</h3>
                <div className="announcements-carousel">
                  <div className="carousel-window">
                    <div className="carousel-track" style={{ transform: `translateY(-${carouselIdx * 100}%)` }}>
                      {announcements.map(n => (
                        <div key={n.id} className="announcement-item">
                          <h4>{n.title}</h4>
                          <span className="announcement-date">{new Date(n.date).toLocaleDateString()}</span>
                          <p>{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="dashboard-card">
              <h3>Initiatives & Outcomes</h3>
              <table className="initiatives-table">
                <thead>
                  <tr><th>Initiative</th><th>Outcome</th><th>Priority</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Match students to capstone projects', out: 'Improve employability', p: 'High' },
                    { name: 'Automate IP/research agreements', out: 'Protect innovations', p: 'Medium' },
                    { name: 'Real-time partnership analytics', out: 'Show collaboration impact', p: 'High' },
                    { name: 'Global industry partnerships', out: 'Enhance reputation', p: 'Medium' },
                    { name: 'Align curriculum with KPIs', out: 'Boost rankings', p: 'Low' }
                  ].map((r,i)=> (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.out}</td>
                      <td><span className={`priority-badge ${r.p.toLowerCase()}`}>{r.p}</span></td>
                      <td><button className="action-btn" onClick={()=>{}}>Estimate Story</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {activeSection === 'reports' && (
          <>
            <div className="reports-actions">
              <button className="btn btn-secondary" onClick={()=> window.print()}>Export PDF</button>
              <button className="btn btn-secondary" onClick={()=> exportCSV([
                ['Metric','Q1','Q2','Q3','Q4'],
                ['Avg Performance',68,72,78,84],
                ['Faculty Workload',12,10,14,11]
              ], 'analytics.csv')}>Export CSV</button>
            </div>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Student Performance (Semesters)</h3>
                <svg viewBox="0 0 320 140" className="line-chart">
                  <polyline fill="none" stroke="#4f46e5" strokeWidth="3" points={perfBySemester.map((v,i)=> `${(i/(perfBySemester.length-1))*300+10},${130 - (v/100)*120}` ).join(' ')}>
                  </polyline>
                  {perfBySemester.map((v,i)=> (
                    <circle key={i} cx={(i/(perfBySemester.length-1))*300+10} cy={130 - (v/100)*120} r="4" />
                  ))}
                </svg>
              </div>
              <div className="chart-card">
                <h3>Faculty Workload (Weekly Hours)</h3>
                <div className="bars">
                  {facultyWorkload.map((v,i)=> (
                    <div key={i} className="bar" style={{ height: `${v*6}px` }} title={`${v} hrs`} />
                  ))}
                </div>
              </div>
              <div className="chart-card">
                <h3>Partnerships Impact (Projects)</h3>
                <svg viewBox="0 0 320 140" className="area-chart">
                  <polyline fill="#a5b4fc55" stroke="#6366f1" strokeWidth="2" points={partnershipImpact.map((v,i)=> `${(i/(partnershipImpact.length-1))*300+10},${130 - (v/60)*120}` ).join(' ')} />
                </svg>
              </div>
            </div>
          </>
        )}

        {activeSection === 'institute' && inst && (
          <section className="institute-profile">
            <div className="inst-cover">
              <button className="edit-fab" title={editingInst ? 'Save' : 'Edit profile'} onClick={() => { editingInst ? saveInstitute() : setEditingInst(true) }}>{editingInst ? '💾' : '✏️'}</button>
              <div className="inst-gradient" aria-hidden></div>
              <div className="inst-hero">
                <div className="inst-logo">🏫</div>
                <div className="inst-hero-text">
                  {editingInst ? (
                    <>
                      <input className="inst-input" value={inst.name} onChange={e=>setInst(prev=>({ ...prev, name: e.target.value }))} />
                      <input className="inst-input" value={inst.tagline} onChange={e=>setInst(prev=>({ ...prev, tagline: e.target.value }))} />
                    </>
                  ) : (
                    <>
                      <h2>{inst.name}</h2>
                      <p>{inst.tagline}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="inst-content">
              <div className="grid-2col">
                <section className="card basic-info">
                  <div className="card-head"><h3>Basic Information</h3></div>
                  <div className="info-grid">
                    <div><span className="label">Address</span>{editingInst ? (<input className="inst-input" value={inst.address} onChange={e=>setInst(prev=>({ ...prev, address: e.target.value }))} />) : (<span>{inst.address}</span>)}</div>
                    <div><span className="label">Website</span>{editingInst ? (<input className="inst-input" value={inst.website} onChange={e=>setInst(prev=>({ ...prev, website: e.target.value }))} />) : (<a href={inst.website} target="_blank" rel="noreferrer">{inst.website}</a>)}</div>
                    <div><span className="label">Contact</span>{editingInst ? (<input className="inst-input" value={inst.contact} onChange={e=>setInst(prev=>({ ...prev, contact: e.target.value }))} />) : (<span>{inst.contact}</span>)}</div>
                    <div><span className="label">Established</span>{editingInst ? (<input className="inst-input" value={inst.established} onChange={e=>setInst(prev=>({ ...prev, established: e.target.value }))} />) : (<span>{inst.established}</span>)}</div>
                    <div><span className="label">Affiliation</span>{editingInst ? (<input className="inst-input" value={inst.affiliation} onChange={e=>setInst(prev=>({ ...prev, affiliation: e.target.value }))} />) : (<span>{inst.affiliation}</span>)}</div>
                  </div>
                </section>
                <section className="card leaders">
                  <div className="card-head"><h3>Leadership & Staff</h3></div>
                  <div className="leader-grid">
                    {(inst.leadership || []).map((L,i)=> (
                      <div key={L.id || i} className="leader-card">
                        <div className="face front"><div className="avatar">{(L.name||'').split(' ').map(x=>x[0]).join('').slice(0,2) || 'AL'}</div><div className="meta">
                          {editingInst ? (
                            <>
                              <input className="inst-input" value={L.name} onChange={e=>{ const arr=[...inst.leadership]; arr[i]={...L,name:e.target.value}; setInst(prev=>({...prev, leadership: arr})) }} />
                              <input className="inst-input" value={L.role} onChange={e=>{ const arr=[...inst.leadership]; arr[i]={...L,role:e.target.value}; setInst(prev=>({...prev, leadership: arr})) }} />
                              <button className="mini" onClick={()=>{ const arr=inst.leadership.filter((_,idx)=>idx!==i); setInst(prev=>({...prev, leadership: arr})) }}>Remove</button>
                            </>
                          ) : (
                            <>
                              <strong>{L.name}</strong><span>{L.role}</span>
                            </>
                          )}
                        </div></div>
                        <div className="face back">Reach via admin office</div>
                      </div>
                    ))}
                    {editingInst && (
                      <button className="btn btn-secondary" onClick={()=> setInst(prev=>({...prev, leadership:[...(prev.leadership||[]), { id: `l${Date.now()}`, name:'New Leader', role:'Role' }] })) }>+ Add</button>
                    )}
                  </div>
                </section>
              </div>

              <section className="card programs">
                <div className="card-head"><h3>Programs & Courses</h3></div>
                <div className="prog-grid">
                  {(inst.programs || []).map((c,i)=> (
                    <div key={c.id || i} className="prog-card">
                      {editingInst ? (
                        <>
                          <input className="inst-input" value={c.title} onChange={e=>{ const arr=[...inst.programs]; arr[i]={...c,title:e.target.value}; setInst(prev=>({...prev, programs: arr})) }} />
                          <input className="inst-input" value={c.degree} onChange={e=>{ const arr=[...inst.programs]; arr[i]={...c,degree:e.target.value}; setInst(prev=>({...prev, programs: arr})) }} />
                          <input className="inst-input" value={c.students} onChange={e=>{ const arr=[...inst.programs]; arr[i]={...c,students:e.target.value}; setInst(prev=>({...prev, programs: arr})) }} />
                          <button className="mini" onClick={()=>{ const arr=inst.programs.filter((_,idx)=>idx!==i); setInst(prev=>({...prev, programs: arr})) }}>Remove</button>
                        </>
                      ) : (
                        <>
                          <h4>{c.title}</h4><p>{c.degree}</p><span className="count">{c.students} Students</span>
                        </>
                      )}
                    </div>
                  ))}
                  {editingInst && (
                    <button className="btn btn-secondary" onClick={()=> setInst(prev=>({...prev, programs:[...(prev.programs||[]), { id:`p${Date.now()}`, title:'New Program', degree:"Bachelor's", students:0 }] })) }>+ Add Program</button>
                  )}
                </div>
              </section>

              <div className="grid-2col">
                <section className="card partners">
                  <div className="card-head"><h3>Partnerships</h3></div>
                  <div className="logo-row">
                    {(inst.partners || []).map(p => (<div key={p} className="partner-badge">{p}</div>))}
                    {editingInst && (
                      <button className="btn btn-secondary" onClick={()=>{ const name = prompt('Partner name'); if (name) setInst(prev=>({...prev, partners:[...(prev.partners||[]), name]})) }}>+ Add</button>
                    )}
                  </div>
                </section>
                <section className="card timeline">
                  <div className="card-head"><h3>Achievements</h3></div>
                  <div className="time-list">
                    {(inst.achievements || []).map((e,i)=> (
                      <div key={e.id || i} className="time-item"><span className="dot" /> <span className="t-title">{e.title}</span> <span className="t-time">{e.year}</span>{editingInst && (<button className="mini" onClick={()=>{ const arr=inst.achievements.filter((_,idx)=>idx!==i); setInst(prev=>({...prev, achievements: arr})) }}>Remove</button>)}</div>
                    ))}
                    {editingInst && (
                      <button className="btn btn-secondary" onClick={()=> setInst(prev=>({...prev, achievements:[...(prev.achievements||[]), { id:`a${Date.now()}`, year: new Date().getFullYear().toString(), title:'New Achievement' }] })) }>+ Add</button>
                    )}
                  </div>
                </section>
              </div>

              <section className="card noticeboard">
                <div className="card-head"><h3>Announcements</h3></div>
                <div className="board">
                  {(inst.announcements || []).map((n,i)=> (
                    <div key={n.id || i} className="note"><span className="nd">{new Date(n.date).toLocaleDateString()}</span><span className="nc">{n.content}</span>{editingInst && (<button className="mini" onClick={()=>{ const arr=inst.announcements.filter((_,idx)=>idx!==i); setInst(prev=>({...prev, announcements: arr})) }}>Remove</button>)}</div>
                  ))}
                  {editingInst && (
                    <button className="btn btn-secondary" onClick={()=> setInst(prev=>({...prev, announcements:[...(prev.announcements||[]), { id:`n${Date.now()}`, date: new Date().toISOString().slice(0,10), content:'New announcement' }] })) }>+ Add</button>
                  )}
                </div>
              </section>
            </div>
          </section>
        )}

        {activeSection === 'students' && (<>
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
        </>) }
      </main>
    </div>
  )
}

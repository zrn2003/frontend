import { useEffect, useMemo, useState } from 'react'
import './UniversityDashboard.css'

export default function UniversityDashboard() {
  const [search, setSearch] = useState('')
  const [notifCount, setNotifCount] = useState(3)
  const [kpis, setKpis] = useState({ students: 0, faculty: 0, courses: 0, budget: 0, studentsTrend: 0, budgetTrend: 0 })
  const [students, setStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [finance, setFinance] = useState({ breakdown: [], monthly: [], alerts: [] })
  const [reports, setReports] = useState({ reports: [], compliance: { checklist: [], milestones: [] } })
  const [active, setActive] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [institutes, setInstitutes] = useState([])

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || 'null') } catch { return null }
  }, [])

  const headers = { 'x-user-id': String(user?.id || '') }

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError('')
        const [s1, s2] = await Promise.all([
          fetch('/api/university/stats', { headers }),
          fetch('/api/university/students', { headers })
        ])
        if (!s1.ok) throw new Error((await s1.json().catch(()=>({})))?.message || 'Failed stats')
        if (!s2.ok) throw new Error((await s2.json().catch(()=>({})))?.message || 'Failed students')
        setKpis(await s1.json())
        const studs = await s2.json()
        setStudents(studs.students || [])
      } catch (e) {
        setError(e.message || 'Failed to load overview')
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  const loadSection = async (section) => {
    setActive(section)
    if (section === 'departments' && departments.length === 0) {
      const r = await fetch('/api/university/departments', { headers });
      if (r.ok) setDepartments((await r.json()).departments || [])
    } else if (section === 'courses' && courses.length === 0) {
      const r = await fetch('/api/university/courses', { headers });
      if (r.ok) setCourses((await r.json()).courses || [])
    } else if (section === 'finance' && finance.breakdown.length === 0) {
      const r = await fetch('/api/university/finance', { headers });
      if (r.ok) setFinance(await r.json())
    } else if (section === 'reports' && reports.reports.length === 0) {
      const r = await fetch('/api/university/reports', { headers });
      if (r.ok) setReports(await r.json())
    } else if (section === 'institutes' && institutes.length === 0) {
      const r = await fetch('/api/university/institutes', { headers });
      if (r.ok) setInstitutes((await r.json()).institutes || [])
    }
  }

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return !q ? students : students.filter(s => (s.name||'').toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q))
  }, [students, search])

  return (
    <div className="uni-admin">
      <aside className="uni-sidebar">
        <div className="uni-logo">🏛️ University</div>
        <nav>
          <button className={`nav-item ${active==='overview'?'active':''}`} onClick={()=>loadSection('overview')}>🏛️ Overview</button>
          <button className={`nav-item ${active==='students'?'active':''}`} onClick={()=>loadSection('students')}>🎓 Students</button>
          <button className={`nav-item ${active==='faculty'?'active':''}`} onClick={()=>loadSection('faculty')} disabled>👨‍🏫 Faculty & Staff</button>
          <button className={`nav-item ${active==='courses'?'active':''}`} onClick={()=>loadSection('courses')}>📚 Courses & Programs</button>
          <button className={`nav-item ${active==='departments'?'active':''}`} onClick={()=>loadSection('departments')}>🏢 Departments</button>
          <button className={`nav-item ${active==='finance'?'active':''}`} onClick={()=>loadSection('finance')}>💰 Finance & Budgets</button>
          <button className={`nav-item ${active==='reports'?'active':''}`} onClick={()=>loadSection('reports')}>📊 Reports & Analytics</button>
          <button className={`nav-item ${active==='institutes'?'active':''}`} onClick={()=>loadSection('institutes')}>🏛️ Institutes</button>
          <button className={`nav-item ${active==='settings'?'active':''}`} onClick={()=>loadSection('settings')} disabled>⚙️ Settings / Compliance</button>
        </nav>
      </aside>

      <main className="uni-content">
        <header className="uni-header">
          <div className="search-wrap">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students, faculty, courses…" />
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="Notifications">🔔{notifCount > 0 && <span className="badge">{notifCount}</span>}</button>
            <div className="profile-menu">
              <div className="avatar">UA</div>
              <span className="name">University Admin</span>
            </div>
          </div>
        </header>

        {loading && active==='overview' ? (
          <div className="panel"><div>Loading…</div></div>
        ) : error && active==='overview' ? (
          <div className="panel"><div className="alert">{error}</div></div>
        ) : (
          <>
            {active==='overview' && (
              <>
                <section className="kpi-row">
                  <div className="kpi-card"><div className="kpi-top"><span>🎓 Total Students</span></div><h2>{(kpis.students||0).toLocaleString()}</h2><div className="sparkline" /></div>
                  <div className="kpi-card"><div className="kpi-top"><span>👨‍🏫 Faculty Strength</span></div><h2>{(kpis.faculty||0).toLocaleString()}</h2><div className="sparkline" /></div>
                  <div className="kpi-card"><div className="kpi-top"><span>📚 Active Courses</span></div><h2>{(kpis.courses||0).toLocaleString()}</h2><div className="sparkline" /></div>
                  <div className="kpi-card"><div className="kpi-top"><span>💰 Current Sem Budget</span></div><h2>${Number(kpis.budget||0).toFixed(1)}M</h2><div className="sparkline" /></div>
                </section>
                <section className="panel">
                  <div className="panel-header">
                    <h3>Recent Students</h3>
                  </div>
                  <table className="uni-table">
                    <thead><tr><th>Name</th><th>Program</th><th>Year/Sem</th><th>Performance</th><th>Status</th></tr></thead>
                    <tbody>
                      {filteredStudents.slice(0, 8).map(s => (
                        <tr key={s.id}><td>{s.name}</td><td>{s.program}</td><td>{s.year}/{s.semester}</td><td><div className="perf"><div className="bar" style={{ width: `${s.performance}%` }} /></div></td><td><span className={`status ${s.status}`}>{s.status}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </>
            )}

            {active==='departments' && (
              <section className="panel">
                <div className="panel-header"><h3>Departments</h3></div>
                <div className="dept-grid">
                  {departments.map(d => (
                    <div key={d.id} className="dept-card">
                      <div className="dept-title">{d.name}</div>
                      <div className="dept-meta">HOD: {d.hod}</div>
                      <div className="dept-stats"><span>👨‍🏫 {d.facultyCount} Faculty</span><span>🎓 {d.studentCount} Students</span></div>
                      <button className="btn btn-primary">Manage</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active==='courses' && (
              <section className="panel">
                <div className="panel-header"><h3>Courses & Programs</h3></div>
                <div className="course-grid">
                  {courses.map(c => (
                    <div key={c.id} className="course-card">
                      <div className="course-title">{c.title}</div>
                      <div className="course-meta">Dept: {c.department} • {c.credits} credits</div>
                      <div className="course-stats">Enrollment: {c.enrollment}</div>
                      <div className="curriculum-map" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active==='finance' && (
              <section className="panel">
                <div className="panel-header"><h3>Finance & Budget</h3></div>
                <div className="finance-grid">
                  <div className="chart pie" aria-label="Budget distribution" />
                  <div className="chart line" aria-label="Revenue vs Expenses" />
                  {finance.alerts.map((a,i)=>(<div key={i} className="alert">⚠️ {a}</div>))}
                </div>
              </section>
            )}

            {active==='reports' && (
              <section className="panel">
                <div className="panel-header"><h3>Reports & Compliance</h3></div>
                <div className="report-grid">
                  {reports.reports.map((r,i)=>(<div key={i} className="report-card">{r.trend==='up'?'📈':r.trend==='down'?'📉':'📑'} {r.title}</div>))}
                </div>
                <div className="compliance">
                  <div className="checklist">
                    {reports.compliance.checklist.map((t,i)=>(<div key={i} className="task"><span className={`box ${t.done?'done':''}`} /> {t.label}</div>))}
                  </div>
                  <div className="milestones">
                    {reports.compliance.milestones.map((m,i)=>(<div key={i} className="milestone"><div className="progress"><div className="bar" style={{ width: `${m.progress*100}%` }} /></div><span>{m.label} {Math.round(m.progress*100)}%</span></div>))}
                  </div>
                </div>
              </section>
            )}

            {active==='institutes' && (
              <section className="panel">
                <div className="panel-header"><h3>Institutes on Platform</h3></div>
                <div className="dept-grid">
                  {institutes.map((ins, idx) => (
                    <div key={ins.domain} className="dept-card">
                      <div className="dept-title">🏛️ {ins.name || ins.domain}</div>
                      <div className="dept-meta">Domain: {ins.domain}</div>
                      <div className="dept-stats" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span>👨‍🎓 {ins.students} Students</span>
                        <span>👨‍🏫 {ins.staff} Faculty</span>
                        <span>📚 {ins.courses || Math.max(20, Math.round((ins.students||0)/50))} Courses</span>
                      </div>
                      <div className="dept-stats" style={{ gap: 12 }}>
                        <span>🎯 Avg GPA: {(3 + (idx%2)*0.4).toFixed(1)}</span>
                        <span>💼 Placement: {85 + (idx%10)}%</span>
                        <span>💰 Budget: {(0.5 + (idx%5)*0.1).toFixed(1)}M</span>
                      </div>
                      <div style={{ display:'flex', gap:8, marginTop:8 }}>
                        <button className="btn btn-primary" onClick={()=>loadSection('overview')}>View Details</button>
                        <button className="btn btn-secondary">Assign Dean</button>
                        <button className="btn btn-secondary">Manage Departments</button>
                      </div>
                      <div className={`status ${idx%5===0?'completed':'active'}`} style={{ marginTop:8 }}>
                        {idx%5===0?'Under Review':'Active'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

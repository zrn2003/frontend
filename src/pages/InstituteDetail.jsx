import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import './InstituteDetail.css'

export default function InstituteDetail() {
  const { domain } = useParams()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}')
        const r = await fetch(`/api/university/institutes/${encodeURIComponent(domain)}`, { headers: { 'x-user-id': String(user.id) } })
        if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.message || 'Failed to load')
        setData(await r.json())
      } catch (e) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [domain])

  if (loading) return <div style={{ padding:20 }}>Loading…</div>
  if (error) return <div style={{ padding:20, color:'crimson' }}>{error}</div>
  if (!data) return null

  const { institute, kpis, departments, students, faculty, finance } = data

  return (
    <div className="inst-detail">
      <header className="instd-header">
        <div className="logo">🏛️</div>
        <div className="meta">
          <h1>{institute.name}</h1>
          <div className="sub">Dean: {institute.dean.name} • {institute.dean.email} • {institute.dean.phone}</div>
          <div className="tags">
            {institute.accreditation.map((a,i)=>(<span key={i} className="tag">✅ {a}</span>))}
            <span className={`tag ${institute.status}`}>{institute.status}</span>
          </div>
        </div>
      </header>

      <section className="kpi-row">
        <div className="kpi-card"><span>Students</span><h2>{kpis.students}</h2></div>
        <div className="kpi-card"><span>Faculty</span><h2>{kpis.faculty}</h2></div>
        <div className="kpi-card"><span>Departments</span><h2>{kpis.departments}</h2></div>
        <div className="kpi-card"><span>Research Grants</span><h2>{kpis.researchGrants}</h2></div>
        <div className="kpi-card"><span>Placement Rate</span><h2>{kpis.placementRate}</h2></div>
      </section>

      <div className="tabs">
        <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>📊 Overview</button>
        <button className={tab==='departments'?'active':''} onClick={()=>setTab('departments')}>🏢 Departments</button>
        <button className={tab==='students'?'active':''} onClick={()=>setTab('students')}>👨‍🎓 Students</button>
        <button className={tab==='faculty'?'active':''} onClick={()=>setTab('faculty')}>👨‍🏫 Faculty</button>
        <button className={tab==='finance'?'active':''} onClick={()=>setTab('finance')}>💰 Finance</button>
      </div>

      {tab==='overview' && (
        <section className="panel">
          <div className="panel-header"><h3>Overview</h3></div>
          <div className="overview-charts">
            <div className="chart" />
            <div className="chart" />
          </div>
        </section>
      )}

      {tab==='departments' && (
        <section className="panel">
          <div className="panel-header"><h3>Departments</h3></div>
          <div className="dept-grid">
            {departments.map(d => (
              <div key={d.id} className="dept-card">
                <div className="dept-title">{d.name}</div>
                <div className="dept-meta">HOD: {d.hod}</div>
                <div className="dept-stats"><span>👨‍🏫 {d.facultyCount}</span><span>👨‍🎓 {d.studentCount}</span></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab==='students' && (
        <section className="panel">
          <div className="panel-header"><h3>Students</h3></div>
          <table className="uni-table">
            <thead><tr><th>Name</th><th>Program</th><th>Year/Sem</th><th>Performance</th><th>Status</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}><td>{s.name}</td><td>{s.program}</td><td>{s.year}/{s.semester}</td><td><div className="perf"><div className="bar" style={{ width: `${s.performance}%` }} /></div></td><td><span className={`status ${s.status}`}>{s.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab==='faculty' && (
        <section className="panel">
          <div className="panel-header"><h3>Faculty</h3></div>
          <table className="uni-table">
            <thead><tr><th>Name</th><th>Specialization</th><th>Status</th></tr></thead>
            <tbody>
              {faculty.map(f => (<tr key={f.id}><td>{f.name}</td><td>{f.specialization}</td><td>{f.status}</td></tr>))}
            </tbody>
          </table>
        </section>
      )}

      {tab==='finance' && (
        <section className="panel">
          <div className="panel-header"><h3>Finance</h3></div>
          <div className="finance-grid">
            <div className="chart pie" />
            <div className="chart line" />
          </div>
          <div style={{ marginTop:10 }}>Budget Allocated: ${finance.budgetAllocated}M • Used: ${finance.budgetUsed}M</div>
        </section>
      )}
    </div>
  )
}

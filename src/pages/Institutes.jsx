import { useEffect, useMemo, useState } from 'react'
import './Institutes.css'
import { useNavigate } from 'react-router-dom'

export default function Institutes() {
  const [institutes, setInstitutes] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}')
        const r = await fetch('/api/university/institutes', { headers: { 'x-user-id': String(user.id) } })
        if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.message || 'Failed to load')
        const data = await r.json()
        setInstitutes(data.institutes || [])
      } catch (e) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return !q ? institutes : institutes.filter(i => (i.name||i.domain||'').toLowerCase().includes(q))
  }, [institutes, query])

  return (
    <div className="inst-page">
      <div className="inst-header">
        <h1>Institutes</h1>
        <input className="inst-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search institutes" />
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="alert">{error}</div>
      ) : (
        <div className="inst-grid">
          {filtered.map((ins,i) => (
            <div key={ins.domain} className="inst-card">
              <div className="inst-title">🏛️ {ins.name || ins.domain}</div>
              <div className="inst-metrics">
                <span>👨‍🎓 {ins.students} Students</span>
                <span>👨‍🏫 {ins.staff} Faculty</span>
                <span>📚 {ins.courses || Math.max(20, Math.round(ins.students/50))} Courses</span>
              </div>
              <div className="inst-kpis">
                <span>🎯 Avg GPA: { (3 + (i%2)*0.4).toFixed(1) }</span>
                <span>💼 Placement: { 85 + (i%10) }%</span>
                <span>💰 Budget: { (0.5 + (i%5)*0.1).toFixed(1) }M</span>
              </div>
              <div className="inst-actions">
                <button className="btn btn-primary" onClick={()=>navigate(`/university/institutes/${encodeURIComponent(ins.domain)}`)}>View Details</button>
                <button className="btn btn-secondary">Assign Dean</button>
                <button className="btn btn-secondary">Manage Departments</button>
              </div>
              <div className={`status-badge ${i%5===0?'review': 'active'}`}>{i%5===0?'Under Review':'Active'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const currentMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
};

const emptyExperience = { company: '', title: '', start: currentMonth(), end: '', current: true, description: '' };
const emptyEducation = { school: '', degree: '', field: '', start: currentMonth(), end: currentMonth(), current: false, description: '' };
const emptyProject = { name: '', description: '', tech: [], link: '' };

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState([]);
  const [portfolio, setPortfolio] = useState({
    summary: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    resumeUrl: '',
    skills: [],
    experiences: [],
    education: [],
    projects: []
  });
  const [mentors, setMentors] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    status: 'open'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0, pages: 0 });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    if (!userToken || !userData) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    if ((parsed.role || '').toLowerCase() !== 'student') {
      navigate('/login');
      return;
    }
    fetchOpportunities(true);
    fetchProfile(parsed.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const buildQuery = (resetOffset = false) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.location) params.set('location', filters.location);
    params.set('limit', String(pagination.limit));
    params.set('offset', String(resetOffset ? 0 : pagination.offset));
    return params.toString();
  };

  const fetchOpportunities = async (reset = false) => {
    try {
      setIsLoading(true);
      setError('');
      const qs = buildQuery(reset);
      const res = await fetch(`/api/opportunities?${qs}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load opportunities');
      }
      const data = await res.json();
      const newItems = Array.isArray(data.opportunities) ? data.opportunities : [];
      setOpportunities(reset ? newItems : [...opportunities, ...newItems]);
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination(prev => ({ ...prev, total: newItems.length, pages: 1 }));
      }
    } catch (e) {
      setError(e.message || 'Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch('/api/student/profile', {
        headers: { 'x-user-id': String(userId), 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to load profile');
      }
      const data = await res.json();
      const mapWithDefaults = (arr, key) => (arr || []).map(item => ({
        ...item,
        start: item.start || currentMonth(),
        end: item.current ? '' : (item.end || (key === 'education' ? currentMonth() : '')),
        current: item.current ?? (key === 'experiences' ? !item.end : false)
      }));
      setPortfolio({
        summary: data.profile.summary || '',
        githubUrl: data.profile.githubUrl || '',
        linkedinUrl: data.profile.linkedinUrl || '',
        websiteUrl: data.profile.websiteUrl || '',
        resumeUrl: data.profile.resumeUrl || '',
        skills: data.profile.skills || [],
        experiences: mapWithDefaults(data.profile.experiences, 'experiences'),
        education: mapWithDefaults(data.profile.education, 'education'),
        projects: data.profile.projects || []
      });
    } catch (e) {
      console.error(e);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const normalizeDates = arr => (arr || []).map(it => ({
        ...it,
        end: it.current ? '' : (it.end || currentMonth())
      }));
      const body = {
        githubUrl: portfolio.githubUrl,
        linkedinUrl: portfolio.linkedinUrl,
        websiteUrl: portfolio.websiteUrl,
        resumeUrl: portfolio.resumeUrl,
        summary: portfolio.summary,
        skills: portfolio.skills,
        experiences: normalizeDates(portfolio.experiences),
        education: normalizeDates(portfolio.education),
        projects: portfolio.projects
      };
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': String(userData.id),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save profile');
      }
      await res.json();
      alert('Profile saved');
    } catch (e) {
      alert(e.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchOpportunities(true);
  };

  const loadMore = () => {
    const nextOffset = pagination.offset + pagination.limit;
    setPagination(prev => ({ ...prev, offset: nextOffset }));
    fetchOpportunities(false);
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s) return;
    setPortfolio(prev => ({ ...prev, skills: Array.from(new Set([...(prev.skills || []), s])) }));
  };

  const removeSkill = (skill) => {
    setPortfolio(prev => ({ ...prev, skills: (prev.skills || []).filter(x => x !== skill) }));
  };

  const addItem = (key, tmpl) => {
    setPortfolio(prev => ({ ...prev, [key]: [...(prev[key] || []), tmpl] }));
  };
  const updateItem = (key, idx, patch) => {
    setPortfolio(prev => ({
      ...prev,
      [key]: prev[key].map((it, i) => (i === idx ? { ...it, ...patch } : it))
    }));
  };
  const removeItem = (key, idx) => {
    setPortfolio(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  };

  const handleApplyToOpportunity = async (opportunityId) => {
    alert('Application submitted!');
  };

  const handleSaveOpportunity = async (opportunityId) => {
    alert('Opportunity saved!');
  };

  const renderOpportunitiesTab = () => (
    <div className="tab-content">
      <div className="filters-section">
        <h3>Find Opportunities</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Keywords, title, description..."
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Any</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Any</option>
              <option value="internship">Internship</option>
              <option value="job">Job</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, country, remote..."
            />
          </div>
          <div className="filter-group">
            <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
          </div>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="no-opportunities">
          <div className="no-data-icon">🔍</div>
          <h3>No opportunities found</h3>
          <p>Try adjusting your filters or check back later for new opportunities.</p>
        </div>
      ) : (
        <>
          <div className="opportunities-grid">
            {opportunities.map(opp => (
              <div key={opp.id} className="opportunity-card">
                <div className="opp-header">
                  <h4>{opp.title}</h4>
                </div>
                <p className="opp-company">{opp.postedByName || 'TrustTeams partner'}</p>
                <p className="opp-description">{opp.description}</p>
                <div className="opp-details">
                  <span>📍 {opp.location || 'N/A'}</span>
                  <span>🏷️ {opp.type}</span>
                  <span>📅 {opp.closingDate ? new Date(opp.closingDate).toLocaleDateString() : 'N/A'}</span>
                  <span>📌 {opp.status}</span>
                </div>
                <div className="opp-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApplyToOpportunity(opp.id)}
                  >
                    Apply Now
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSaveOpportunity(opp.id)}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.offset + pagination.limit < pagination.total && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button className="btn btn-secondary" onClick={loadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderProfileHeader = () => {
    const initials = (user?.name || 'Student')
      .split(' ')
      .map(s => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <div className="profile-header-card">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-meta">
          <h2 className="profile-name">{user?.name || 'Student'}</h2>
          <div className="profile-sub">{user?.email || ''}</div>
          <div className="profile-tags">
            <span className="tag tag-student">Student</span>
          </div>
          {portfolio.summary && <p className="profile-summary">{portfolio.summary}</p>}
          <div className="profile-links">
            {portfolio.githubUrl && <a className="link-chip" href={portfolio.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
            {portfolio.linkedinUrl && <a className="link-chip" href={portfolio.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
            {portfolio.websiteUrl && <a className="link-chip" href={portfolio.websiteUrl} target="_blank" rel="noreferrer">Website</a>}
            {portfolio.resumeUrl && <a className="link-chip" href={portfolio.resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
          </div>
        </div>
      </div>
    );
  };

  const renderPortfolioTab = () => (
    <div className="tab-content">
      <div className="portfolio-overview">
        {renderProfileHeader()}
        <div className="portfolio-header">
          <h3>Edit Profile</h3>
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="stat-card" style={{ marginBottom: 20 }}>
          <h4>Summary</h4>
          <textarea
            className="form-input"
            value={portfolio.summary}
            onChange={(e) => setPortfolio(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="Brief summary about you, your goals and strengths"
            rows={4}
          />
        </div>

        <div className="stat-card" style={{ marginBottom: 20 }}>
          <h4>Links</h4>
          <div className="projects-list">
            <input
              className="form-input"
              placeholder="GitHub URL"
              value={portfolio.githubUrl}
              onChange={(e) => setPortfolio(prev => ({ ...prev, githubUrl: e.target.value }))}
            />
            <input
              className="form-input"
              placeholder="LinkedIn URL"
              value={portfolio.linkedinUrl}
              onChange={(e) => setPortfolio(prev => ({ ...prev, linkedinUrl: e.target.value }))}
            />
            <input
              className="form-input"
              placeholder="Personal Website URL"
              value={portfolio.websiteUrl}
              onChange={(e) => setPortfolio(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
            <input
              className="form-input"
              placeholder="Resume URL"
              value={portfolio.resumeUrl}
              onChange={(e) => setPortfolio(prev => ({ ...prev, resumeUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="stat-card" style={{ marginBottom: 20 }}>
          <h4>Skills</h4>
          <div className="skills-graph">
            {(portfolio.skills || []).map(skill => (
              <span key={skill} className="skill-badge" onClick={() => removeSkill(skill)} title="Remove">
                {skill}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <input id="newSkill" className="form-input" placeholder="Add a skill and press Enter" onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }} />
          </div>
        </div>

        <div className="stat-card" style={{ marginBottom: 20 }}>
          <h4>Experiences</h4>
          <div className="projects-list">
            {(portfolio.experiences || []).map((exp, i) => (
              <div key={i} className="project-item">
                <div className="grid-2">
                  <input className="form-input" placeholder="Company" value={exp.company} onChange={(e)=>updateItem('experiences', i, { company: e.target.value })} />
                  <input className="form-input" placeholder="Title" value={exp.title} onChange={(e)=>updateItem('experiences', i, { title: e.target.value })} />
                </div>
                <div className="grid-2">
                  <label style={{ width: '100%' }}>
                    <span className="mini-label">Start</span>
                    <input className="form-input" type="month" value={exp.start} onChange={(e)=>updateItem('experiences', i, { start: e.target.value })} />
                  </label>
                  <label style={{ width: '100%' }}>
                    <span className="mini-label">End</span>
                    <input className="form-input" type="month" value={exp.end} onFocus={(e)=>{ if(!exp.end && !exp.current){ updateItem('experiences', i, { end: currentMonth() }); } }} onChange={(e)=>updateItem('experiences', i, { end: e.target.value, current: false })} disabled={exp.current} />
                  </label>
                </div>
                <label className="inline-check">
                  <input type="checkbox" checked={!!exp.current} onChange={(e)=>updateItem('experiences', i, { current: e.target.checked, end: e.target.checked ? '' : (exp.end || currentMonth()) })} />
                  <span>Currently working here</span>
                </label>
                <textarea className="form-input" placeholder="Description" rows={3} value={exp.description} onChange={(e)=>updateItem('experiences', i, { description: e.target.value })} />
                <div style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" onClick={()=>removeItem('experiences', i)}>Remove</button>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={()=>addItem('experiences', { ...emptyExperience })}>+ Add Experience</button>
          </div>
        </div>

        <div className="stat-card" style={{ marginBottom: 20 }}>
          <h4>Education</h4>
          <div className="projects-list">
            {(portfolio.education || []).map((ed, i) => (
              <div key={i} className="project-item">
                <input className="form-input" placeholder="School / University" value={ed.school} onChange={(e)=>updateItem('education', i, { school: e.target.value })} />
                <div className="grid-2">
                  <input className="form-input" placeholder="Degree" value={ed.degree} onChange={(e)=>updateItem('education', i, { degree: e.target.value })} />
                  <input className="form-input" placeholder="Field of Study" value={ed.field} onChange={(e)=>updateItem('education', i, { field: e.target.value })} />
                </div>
                <div className="grid-2">
                  <label style={{ width: '100%' }}>
                    <span className="mini-label">Start</span>
                    <input className="form-input" type="month" value={ed.start} onChange={(e)=>updateItem('education', i, { start: e.target.value })} />
                  </label>
                  <label style={{ width: '100%' }}>
                    <span className="mini-label">End</span>
                    <input className="form-input" type="month" value={ed.end} onFocus={(e)=>{ if(!ed.end && !ed.current){ updateItem('education', i, { end: currentMonth() }); } }} onChange={(e)=>updateItem('education', i, { end: e.target.value, current: false })} disabled={ed.current} />
                  </label>
                </div>
                <label className="inline-check">
                  <input type="checkbox" checked={!!ed.current} onChange={(e)=>updateItem('education', i, { current: e.target.checked, end: e.target.checked ? '' : (ed.end || currentMonth()) })} />
                  <span>Currently studying</span>
                </label>
                <textarea className="form-input" placeholder="Description" rows={3} value={ed.description} onChange={(e)=>updateItem('education', i, { description: e.target.value })} />
                <div style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" onClick={()=>removeItem('education', i)}>Remove</button>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={()=>addItem('education', { ...emptyEducation })}>+ Add Education</button>
          </div>
        </div>

        <div className="stat-card" style={{ marginBottom: 20 }}>
          <h4>Projects</h4>
          <div className="projects-list">
            {(portfolio.projects || []).map((pr, i) => (
              <div key={i} className="project-item">
                <input className="form-input" placeholder="Project Name" value={pr.name} onChange={(e)=>updateItem('projects', i, { name: e.target.value })} />
                <textarea className="form-input" placeholder="Description" rows={3} value={pr.description} onChange={(e)=>updateItem('projects', i, { description: e.target.value })} />
                <input className="form-input" placeholder="Tech (comma separated)" value={(pr.tech || []).join(', ')} onChange={(e)=>updateItem('projects', i, { tech: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
                <input className="form-input" placeholder="Link (GitHub/Live)" value={pr.link} onChange={(e)=>updateItem('projects', i, { link: e.target.value })} />
                <div style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" onClick={()=>removeItem('projects', i)}>Remove</button>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={()=>addItem('projects', { ...emptyProject })}>+ Add Project</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMentorsTab = () => (
    <div className="tab-content">
      <div className="mentors-search">
        <h3>Find Your Mentor</h3>
        <div className="search-filters">
          <input 
            type="text" 
            placeholder="Search by specialization or background..."
            className="search-input"
          />
          <select className="specialization-filter">
            <option value="">All Specializations</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Business">Business</option>
            <option value="Research">Research</option>
          </select>
        </div>
      </div>
      {mentors.length === 0 ? (
        <div className="no-mentors">
          <div className="no-data-icon">👥</div>
          <h3>No mentors available</h3>
          <p>Check back later for new mentor opportunities.</p>
        </div>
      ) : (
        <div className="mentors-grid">
          {mentors.map(mentor => (
            <div key={mentor.id} className="mentor-card">
              <div className="mentor-header">
                <div className="mentor-avatar">
                  <span className="avatar-text">{mentor.name.charAt(0)}</span>
                </div>
                <div className="mentor-info">
                  <h4>{mentor.name}</h4>
                  <p className="mentor-specialization">{mentor.specialization}</p>
                  <p className="mentor-company">{mentor.company}</p>
                </div>
                <div className="mentor-rating">
                  <span className="stars">{"⭐".repeat(Math.floor(mentor.rating))}</span>
                  <span className="rating-text">{mentor.rating}</span>
                </div>
              </div>
              <p className="mentor-background">{mentor.background}</p>
              <div className="mentor-status">
                <span className={`status ${mentor.availability.toLowerCase()}`}>
                  {mentor.availability}
                </span>
              </div>
              <div className="mentor-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => alert('Connect request sent!')}
                >
                  Connect
                  </button>
                <button className="btn btn-secondary">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCredentialsTab = () => (
    <div className="tab-content">
      <div className="credentials-header">
        <h3>My Micro-Credentials</h3>
        <p>Showcase your capabilities to future employers</p>
      </div>
      {credentials.length === 0 ? (
        <div className="no-credentials">
          <div className="no-data-icon">🏆</div>
          <h3>No credentials yet</h3>
          <p>Complete projects and internships to earn your first credentials!</p>
        </div>
      ) : (
        <div className="credentials-grid">
          {credentials.map(credential => (
            <div key={credential.id} className="credential-card">
              <div className="credential-header">
                <div className="credential-icon">🏆</div>
                <div className="credential-info">
                  <h4>{credential.name}</h4>
                  <p className="issuer">Issued by {credential.issuer}</p>
                  <p className="date">Earned on {credential.date}</p>
                </div>
                {credential.verified && (
                  <div className="verification-badge">
                    <span>✓ Verified</span>
                  </div>
                )}
              </div>
              <div className="credential-project">
                <strong>Project:</strong> {credential.project}
              </div>
              <div className="credential-actions">
                <button className="btn btn-primary">Download Certificate</button>
                <button className="btn btn-secondary">Share</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="credentials-info">
        <h4>About Micro-Credentials</h4>
        <p>
          TrustTeams micro-credentials are recognized by leading companies and institutions. 
          Each credential represents verified skills and project completions, helping you 
          stand out in the job market.
        </p>
      </div>
    </div>
  );

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Student Dashboard</h1>
            <p>Welcome back! Here's what's happening with your opportunities and growth.</p>
          </div>
          <div className="header-actions">
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          🔍 Opportunities
        </button>
        <button 
          className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          📁 Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          👥 Mentors
        </button>
        <button 
          className={`tab-button ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          🏆 Credentials
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'opportunities' && renderOpportunitiesTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'mentors' && renderMentorsTab()}
        {activeTab === 'credentials' && renderCredentialsTab()}
      </div>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api.js';
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
  const [mentors] = useState([]);
  const [credentials] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    status: 'open'
  });
  const [showFilters, setShowFilters] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0, pages: 0 });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const rawUser = localStorage.getItem('userData') || localStorage.getItem('user');
    const roleFromStorage = (localStorage.getItem('userRole') || '').toLowerCase();
    const parsed = rawUser ? JSON.parse(rawUser) : null;
    const role = (parsed?.role || roleFromStorage || '').toLowerCase();

    console.debug('[StudentDashboard gate]', { hasUser: !!parsed, role });

    if (!parsed || role !== 'student') {
      navigate('/login');
      return;
    }

    setUser(parsed);
    fetchOpportunities(true);
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    return () => document.body.classList.remove('dark');
  }, [isDark]);

  const computeProfileCompleteness = () => {
    let score = 0; let total = 6;
    if (portfolio.summary) score++;
    if (portfolio.skills && portfolio.skills.length > 0) score++;
    if (portfolio.experiences && portfolio.experiences.length > 0) score++;
    if (portfolio.education && portfolio.education.length > 0) score++;
    if (portfolio.projects && portfolio.projects.length > 0) score++;
    if (portfolio.githubUrl || portfolio.linkedinUrl || portfolio.websiteUrl || portfolio.resumeUrl) score++;
    return Math.round((score / total) * 100);
  };



  const fetchOpportunities = async (reset = false) => {
    try {
      setIsLoading(true);
      setError('');
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      params.limit = pagination.limit;
      params.offset = reset ? 0 : pagination.offset;
      
      const data = await api.getOpportunities(params);
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

  const fetchProfile = async () => {
    try {
      const data = await api.getStudentProfile();
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
      await api.updateStudentProfile(body);
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

  const handleApplyToOpportunity = async () => {
    alert('Application submitted!');
  };

  const handleSaveOpportunity = async () => {
    alert('Opportunity saved!');
  };

  const renderOpportunitiesTab = () => (
    <div className="tab-content fade-in" data-state={isLoading ? 'loading' : (error ? 'error' : 'ready')}>
      <div className={`filters-section ${showFilters ? '' : 'collapsed'}`}>
        <div className="filters-header">
          <h3>Find Opportunities</h3>
          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={() => setShowFilters(v => !v)}>{showFilters ? 'Hide Filters' : 'Show Filters'}</button>
          </div>
        </div>
        {showFilters && (
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Keywords, title, description..."
              aria-label="Search opportunities"
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-label="Filter by status"
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
              aria-label="Filter by type"
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
              aria-label="Filter by location"
            />
          </div>
          <div className="filter-group">
            <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
          </div>
        </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      ) : error ? (
        <div className="error-container" role="alert">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Opportunities</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchOpportunities(true)}>Try Again</button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="no-opportunities">
          <div className="no-data-icon">🔍</div>
          <h3>No opportunities found</h3>
          <p>Try adjusting your filters or check back later for new opportunities.</p>
        </div>
      ) : (
        <>
          <div className="opportunities-grid">
            {opportunities.map(opp => (
              <div key={opp.id} className="opportunity-card tilt">
                <div className="opp-header">
                  <h4>{opp.title}</h4>
                  <div className="opp-badges">
                    {opp.verified && <span className="badge verified" aria-label="Verified">✓ Verified</span>}
                    {opp.highValue && <span className="badge high-value" aria-label="High value">⭐ High Value</span>}
                  </div>
                </div>
                <div className="opp-meta">
                  <div className="company-avatar" aria-hidden>{(opp.postedByName || 'T').charAt(0)}</div>
                  <p className="opp-company">{opp.postedByName || 'TrustTeams partner'}</p>
                </div>
                <p className="opp-description">{opp.description}</p>
                <div className="opp-details">
                  <span>📍 {opp.location || 'N/A'}</span>
                  <span>🏷️ {opp.type}</span>
                  <span>📅 {opp.closingDate ? new Date(opp.closingDate).toLocaleDateString() : 'N/A'}</span>
                  <span>📌 {opp.status}</span>
                </div>
                {opp.requirements && (
                  <div className="opp-requirements">
                    <strong>Requirements:</strong>
                    <div className="skills-tags">
                      {opp.requirements.map((req, idx) => (
                        <span key={idx} className="skill-tag">{req}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="opp-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApplyToOpportunity(opp.id)}
                    title="Apply"
                  >
                    📩 Apply
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSaveOpportunity(opp.id)}
                    title="Save"
                  >
                    ⭐ Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.offset + pagination.limit < pagination.total && (
            <div className="load-more">
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
    const completeness = computeProfileCompleteness();
    return (
      <div className="li-profile-wrap">
        <div className="profile-banner" aria-hidden />
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
            <div className="progress">
              <div className="progress-bar" style={{ width: `${completeness}%` }} />
              <span className="progress-text">Profile completeness {completeness}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPortfolioTab = () => (
    <div className="tab-content">
      <div className="profile-layout">
        {/* Left column: identity, about, links */}
        <aside className="profile-left">
          {renderProfileHeader()}

          <section className="li-card">
            <h3 className="li-title">About</h3>
            <textarea
              className="form-input"
              value={portfolio.summary}
              onChange={(e) => setPortfolio(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Write a short bio that highlights your goals and strengths"
              rows={5}
            />
          </section>

          <section className="li-card">
            <h3 className="li-title">Links</h3>
            <div className="li-links">
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
          </section>

          <div className="li-actions">
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </aside>

        {/* Right column: experiences, education, projects, skills */}
        <main className="profile-right">
          <section className="li-card">
            <div className="li-card-header">
              <h3 className="li-title">Experience</h3>
              <button className="btn btn-secondary" onClick={()=>addItem('experiences', { ...emptyExperience })}>+ Add</button>
            </div>
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
                      <input className="form-input" type="month" value={exp.end} onFocus={()=>{ if(!exp.end && !exp.current){ updateItem('experiences', i, { end: currentMonth() }); } }} onChange={(e)=>updateItem('experiences', i, { end: e.target.value, current: false })} disabled={exp.current} />
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
            </div>
          </section>

          <section className="li-card">
            <div className="li-card-header">
              <h3 className="li-title">Education</h3>
              <button className="btn btn-secondary" onClick={()=>addItem('education', { ...emptyEducation })}>+ Add</button>
            </div>
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
                      <input className="form-input" type="month" value={ed.end} onFocus={()=>{ if(!ed.end && !ed.current){ updateItem('education', i, { end: currentMonth() }); } }} onChange={(e)=>updateItem('education', i, { end: e.target.value, current: false })} disabled={ed.current} />
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
            </div>
          </section>

          <section className="li-card">
            <div className="li-card-header">
              <h3 className="li-title">Projects</h3>
              <button className="btn btn-secondary" onClick={()=>addItem('projects', { ...emptyProject })}>+ Add</button>
            </div>
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
            </div>
          </section>

          <section className="li-card">
            <div className="li-card-header">
              <h3 className="li-title">Skills</h3>
            </div>
            <div className="skills-graph">
              {(portfolio.skills || []).map(skill => (
                <span key={skill} className="skill-badge" onClick={() => removeSkill(skill)} title="Remove">
                  {skill}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <input id="newSkill" className="form-input" placeholder="Add a skill and press Enter" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );

  const renderMentorsTab = () => (
    <div className="tab-content fade-in" data-state={mentors.length === 0 ? 'empty' : 'ready'}>
      <div className="mentors-search">
        <h3>Find Your Mentor</h3>
        <div className="search-filters">
          <input 
            type="text" 
            placeholder="Search by specialization or background..."
            className="search-input"
            aria-label="Search mentors"
          />
          <select className="specialization-filter" aria-label="Filter mentors by specialization">
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
                  <span className="stars stars-colored">{"\u2B50".repeat(Math.floor(mentor.rating || 0))}</span>
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
                  className="btn btn-cta"
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
    <div className="tab-content fade-in" data-state={credentials.length === 0 ? 'empty' : 'ready'}>
      <div className="credentials-header">
        <h3>My Micro-Credentials</h3>
        <p>Showcase your capabilities to future employers</p>
      </div>
      {credentials.length === 0 ? (
        <div className="no-credentials">
          <div className="no-data-icon">🎖️</div>
          <h3>No credentials yet</h3>
          <p>Complete projects and internships to earn your first credentials!</p>
        </div>
      ) : (
        <div className="credentials-grid">
          {credentials.map(credential => (
            <div key={credential.id} className="credential-card">
              <div className="credential-header">
                <div className="credential-icon">🎖️</div>
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
                <button className="btn btn-primary">⬇️ Download</button>
                <button className="btn btn-secondary">🔗 Share</button>
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
      <div className="dashboard-header animated">
        <div className="header-content">
          <div className="header-text">
            <div className="header-greeting">
              <div className="greet-avatar">{(user?.name || 'S').charAt(0).toUpperCase()}</div>
              <div>
                <h1>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
                <p>Here’s what’s happening with your opportunities and growth.</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => setIsDark(v => !v)} className="btn btn-secondary" title="Toggle dark mode">🌓</button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-secondary" title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs sticky">
        <button 
          className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          <span className="tab-text">Opportunities</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <span className="tab-text">Profile</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          <span className="tab-text">Mentors</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          <span className="tab-text">Credentials</span>
        </button>
        <span className="tab-underline" aria-hidden />
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
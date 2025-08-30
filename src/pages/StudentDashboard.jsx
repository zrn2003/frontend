import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api.js';
import './StudentDashboard.css';

const currentMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
};

const emptyExperience = { company: '', title: '', location: '', employmentType: '', start: currentMonth(), end: '', current: true, description: '' };
const emptyEducation = { school: '', degree: '', field: '', location: '', grade: '', start: currentMonth(), end: currentMonth(), current: false, description: '' };
const emptyProject = { name: '', role: '', description: '', tech: [], link: '', start: currentMonth(), end: '', current: false };

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
  const [activities, setActivities] = useState([]);
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
  const syncTimerRef = useRef(null);
  const [profileTab, setProfileTab] = useState('info');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationItems, setNotificationItems] = useState([]);
  const [messageItems, setMessageItems] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMsgs, setShowMsgs] = useState(false);
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const [savingEntryKey, setSavingEntryKey] = useState('');
  const [savedEntryKey, setSavedEntryKey] = useState('');
  
  // Application state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    opportunityId: '',
    coverLetter: '',
    gpa: '',
    expectedGraduation: '',
    relevantCourses: '',
    skills: '',
    experienceSummary: ''
  })

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
    // Seed dynamic notifications/messages (could be fetched from API later)
    const savedNotifs = JSON.parse(localStorage.getItem('tt_notifications') || '[]');
    const savedMsgs = JSON.parse(localStorage.getItem('tt_messages') || '[]');
    if (savedNotifs.length === 0) {
      const seed = [
        { id: 'n1', text: 'New internship posted in your area', read: false, at: new Date().toISOString() },
        { id: 'n2', text: 'Profile completeness reached 60%', read: false, at: new Date().toISOString() }
      ];
      setNotificationItems(seed);
      localStorage.setItem('tt_notifications', JSON.stringify(seed));
    } else {
      setNotificationItems(savedNotifs);
    }
    if (savedMsgs.length === 0) {
      const seedM = [
        { id: 'm1', from: 'Mentor Jane', preview: 'Happy to connect!', read: false, at: new Date().toISOString() }
      ];
      setMessageItems(seedM);
      localStorage.setItem('tt_messages', JSON.stringify(seedM));
    } else {
      setMessageItems(savedMsgs);
    }
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target) && msgRef.current && !msgRef.current.contains(e.target)) {
        setShowNotif(false);
        setShowMsgs(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') { setShowNotif(false); setShowMsgs(false); } };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    return () => document.body.classList.remove('dark');
  }, [isDark]);

  // Simple skill extraction from free text or lists
  const extractSkillsFromText = (textOrArray) => {
    if (!textOrArray) return [];
    const known = [
      'javascript','typescript','react','redux','next.js','node','express','postgres','mysql','mongodb','html','css','tailwind','vite','git','github',
      'python','django','flask','pandas','numpy','ml','machine learning','data science','java','spring','c++','c#','go','rust',
      'aws','gcp','azure','docker','kubernetes','sql','nosql','graphql','rest','testing','jest','cypress'
    ];
    const pushIfKnown = (acc, token) => {
      const t = String(token || '').toLowerCase().trim();
      if (!t) return;
      if (known.includes(t)) acc.add(t);
    };
    const extracted = new Set();
    if (Array.isArray(textOrArray)) {
      textOrArray.forEach(tok => pushIfKnown(extracted, tok));
    } else {
      const text = String(textOrArray || '').toLowerCase();
      known.forEach(k => { if (text.includes(k)) extracted.add(k); });
    }
    return Array.from(extracted).slice(0, 50);
  };

  const scheduleAutoSync = () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
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
        console.debug('[AutoSync] Profile synced');
      } catch (e) {
        console.warn('[AutoSync] Failed:', e.message);
      }
    }, 800);
  };

  const normalizeDates = (arr) => (arr || []).map(it => ({
    ...it,
    end: it.current ? '' : (it.end || currentMonth())
  }));

  const saveEntry = async (type, index) => {
    try {
      const key = `${type}-${index}`;
      setSavingEntryKey(key);
      const body = {
        githubUrl: portfolio.githubUrl,
        linkedinUrl: portfolio.linkedinUrl,
        websiteUrl: portfolio.websiteUrl,
        resumeUrl: portfolio.resumeUrl,
        summary: portfolio.summary,
        skills: portfolio.skills,
        experiences: normalizeDates(portfolio.experiences),
        education: normalizeDates(portfolio.education),
        projects: normalizeDates(portfolio.projects)
      };
      await api.updateStudentProfile(body);
      setSavedEntryKey(key);
      setTimeout(() => setSavedEntryKey(''), 1500);
    } catch (e) {
      alert(e.message || 'Failed to save item');
    } finally {
      setSavingEntryKey('');
    }
  };

  const validateDateRange = (start, end, isCurrent) => {
    if (!start) return { valid: false, message: 'Start date required' };
    if (isCurrent) return { valid: true };
    if (!end) return { valid: false, message: 'End date required' };
    if (start > end) return { valid: false, message: 'End date must be after start' };
    return { valid: true };
  };

  const applySkillUpdatesFromActivity = (payload) => {
    const derived = new Set(portfolio.skills || []);
    if (payload?.requirements) {
      extractSkillsFromText(payload.requirements).forEach(s => derived.add(s));
    }
    if (payload?.tech) {
      extractSkillsFromText(payload.tech).forEach(s => derived.add(s));
    }
    if (payload?.text) {
      extractSkillsFromText(payload.text).forEach(s => derived.add(s));
    }
    const nextSkills = Array.from(derived);
    setPortfolio(prev => ({ ...prev, skills: nextSkills }));
    scheduleAutoSync();
  };

  const logActivity = (type, payload = {}) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      at: new Date().toISOString(),
      payload
    };
    setActivities(prev => [entry, ...prev].slice(0, 200));
    applySkillUpdatesFromActivity(payload);
  };

  // Form helpers and validation
  const isValidUrl = (value) => {
    if (!value) return true;
    try { new URL(value); return true; } catch { return false; }
  };
  const isValidEmail = (value) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

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
      // Enrich skills from current portfolio before saving
      const skillSet = new Set(portfolio.skills || []);
      (portfolio.projects || []).forEach(p => (p?.tech || []).forEach(t => skillSet.add(String(t).toLowerCase())));
      (portfolio.experiences || []).forEach(exp => extractSkillsFromText(`${exp.title} ${exp.description}`).forEach(s => skillSet.add(s)));
      (portfolio.education || []).forEach(ed => extractSkillsFromText(`${ed.degree} ${ed.field} ${ed.description}`).forEach(s => skillSet.add(s)));
      const mergedSkills = Array.from(skillSet);
      const body = {
        githubUrl: portfolio.githubUrl,
        linkedinUrl: portfolio.linkedinUrl,
        websiteUrl: portfolio.websiteUrl,
        resumeUrl: portfolio.resumeUrl,
        summary: portfolio.summary,
        skills: mergedSkills,
        experiences: normalizeDates(portfolio.experiences),
        education: normalizeDates(portfolio.education),
        projects: normalizeDates(portfolio.projects)
      };
      await api.updateStudentProfile(body);
      alert('Profile saved');
      setPortfolio(prev => ({ ...prev, skills: mergedSkills }));
      logActivity('profile.save', { text: 'Profile saved', skillsAdded: mergedSkills.length });
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
    const s = String(skill || '').trim().toLowerCase();
    if (!s) return;
    setPortfolio(prev => ({ ...prev, skills: Array.from(new Set((prev.skills || []).map(x=>String(x).toLowerCase()).concat([s]))) }));
    logActivity('skill.add', { text: s });
    scheduleAutoSync();
  };

  const removeSkill = (skill) => {
    const target = String(skill || '').toLowerCase();
    setPortfolio(prev => ({ ...prev, skills: (prev.skills || []).filter(x => String(x).toLowerCase() !== target) }));
    logActivity('skill.remove', { text: skill });
    scheduleAutoSync();
  };

  const addItem = (key, tmpl) => {
    setPortfolio(prev => ({ ...prev, [key]: [...(prev[key] || []), tmpl] }));
    logActivity(`${key}.add`, { text: `Added to ${key}` });
    scheduleAutoSync();
  };
  const updateItem = (key, idx, patch) => {
    setPortfolio(prev => ({
      ...prev,
      [key]: prev[key].map((it, i) => (i === idx ? { ...it, ...patch } : it))
    }));
    // If updating projects tech or descriptions, attempt skill extraction
    if (key === 'projects') {
      const affected = { ...patch };
      applySkillUpdatesFromActivity({ tech: affected.tech, text: `${affected.name || ''} ${affected.description || ''}` });
    }
  };
  const removeItem = (key, idx) => {
    setPortfolio(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
    logActivity(`${key}.remove`, { text: `Removed from ${key}` });
    scheduleAutoSync();
  };

  const handleApplyToOpportunity = async (oppId) => {
    const opp = opportunities.find(o => o.id === oppId);
    
    // Check if already applied
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.id) {
      alert('Please log in to apply for opportunities');
      return;
    }

    // Show application form modal
    setSelectedOpportunity(opp);
    setApplicationForm({
      opportunityId: oppId,
      coverLetter: '',
      gpa: '',
      expectedGraduation: '',
      relevantCourses: '',
      skills: '',
      experienceSummary: ''
    });
    setShowApplicationForm(true);
  };

  const submitApplication = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.id) {
        alert('Please log in to apply for opportunities');
        return;
      }

      await api.applyToOpportunity(applicationForm);
      
      // Log activity
      const opp = opportunities.find(o => o.id === applicationForm.opportunityId);
      if (opp) {
        logActivity('opportunity.apply', { 
          id: applicationForm.opportunityId, 
          text: `${opp.title} ${opp.description || ''}`, 
          requirements: opp.requirements || [] 
        });
      }

      // Reset form and close modal
      setApplicationForm({
        opportunityId: '',
        coverLetter: '',
        gpa: '',
        expectedGraduation: '',
        relevantCourses: '',
        skills: '',
        experienceSummary: ''
      });
      setShowApplicationForm(false);
      setSelectedOpportunity(null);
      
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to submit application: ' + error.message);
    }
  };

  const handleSaveOpportunity = async (oppId) => {
    const opp = opportunities.find(o => o.id === oppId);
    alert('Opportunity saved!');
    if (opp) {
      logActivity('opportunity.save', { id: oppId, text: `${opp.title}`, requirements: opp.requirements || [] });
    } else {
      logActivity('opportunity.save', { id: oppId });
    }
  };

  const computeSkillCounts = () => {
    const counts = {};
    (activities || []).forEach(a => {
      const skills = extractSkillsFromText(a.payload?.requirements || a.payload?.tech || a.payload?.text);
      skills.forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  };

  const renderActivityTab = () => {
    const counts = computeSkillCounts();
    const topSkills = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0, 20);
    return (
      <div className="tab-content">
        <div className="li-card">
          <h3 className="li-title">Recent Activity</h3>
          {activities.length === 0 ? (
            <div className="no-credentials"><h3>No activities yet</h3><p>Apply, save, or edit your profile to see updates.</p></div>
          ) : (
            <div className="activity-list">
              {activities.map(a => (
                <div key={a.id} className="activity-item">
                  <div className="activity-meta">
                    <span className="activity-type">{a.type}</span>
                    <span className="activity-time">{new Date(a.at).toLocaleString()}</span>
                  </div>
                  {a.payload?.text && <div className="activity-text">{a.payload.text}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="li-card" style={{ marginTop: 16 }}>
          <h3 className="li-title">Skills Growth Graph</h3>
          {topSkills.length === 0 ? (
            <p>No skills detected yet. Engage with opportunities or add projects.</p>
          ) : (
            <div className="skills-graph">
              {topSkills.map(([skill, count]) => (
                <span key={skill} className="skill-badge" title={`Derived from ${count} activities`}>
                  {skill} ({count})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
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
                  {opp.stipend && <span>💰 {opp.stipend}</span>}
                  {opp.duration && <span>⏱️ {opp.duration}</span>}
                </div>
                {opp.requirements && (
                  <div className="opp-requirements">
                    <strong>Requirements:</strong>
                    <div className="requirements-text">
                      {opp.requirements}
                    </div>
                  </div>
                )}
                {(opp.contact_email || opp.contact_phone) && (
                  <div className="opp-contact">
                    <strong>Contact:</strong>
                    <div className="contact-info">
                      {opp.contact_email && <span>📧 {opp.contact_email}</span>}
                      {opp.contact_phone && <span>📞 {opp.contact_phone}</span>}
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
      <div className="sd-shell">
        <aside className={`sd-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="sd-sidebar-toggle btn btn-secondary" onClick={()=>setSidebarOpen(v=>!v)}>{sidebarOpen ? 'Hide' : 'Show'}</button>
          <nav className="sd-nav">
            <button className={`sd-nav-item ${profileTab==='info'?'active':''}`} onClick={()=>setProfileTab('info')}>Profile Info</button>
            <button className={`sd-nav-item ${profileTab==='education'?'active':''}`} onClick={()=>setProfileTab('education')}>Education</button>
            <button className={`sd-nav-item ${profileTab==='experience'?'active':''}`} onClick={()=>setProfileTab('experience')}>Experience</button>
            <button className={`sd-nav-item ${profileTab==='skills'?'active':''}`} onClick={()=>setProfileTab('skills')}>Skills</button>
            <button className={`sd-nav-item ${profileTab==='projects'?'active':''}`} onClick={()=>setProfileTab('projects')}>Projects</button>
            <button className="sd-nav-item" onClick={()=>{ window.print(); }}>Export PDF</button>
          </nav>
          <div className="sd-preview">
            <h4>Live Preview</h4>
            <div className="preview-card">
              <div className="preview-name">{user?.name || 'Student Name'}</div>
              <div className="preview-links">
                {portfolio.githubUrl && <a href={portfolio.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
                {portfolio.linkedinUrl && <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                {portfolio.websiteUrl && <a href={portfolio.websiteUrl} target="_blank" rel="noreferrer">Website</a>}
                {user?.email && <a href={`mailto:${user.email}`}>Email</a>}
              </div>
              {portfolio.summary && <div className="preview-summary">{portfolio.summary}</div>}
              {(portfolio.skills || []).slice(0,8).length>0 && (
                <div className="preview-skills">
                  {(portfolio.skills || []).slice(0,8).map(s => <span key={s} className="preview-skill">{s}</span>)}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="sd-main">
          {profileTab === 'info' && (
            <>
              {renderProfileHeader()}
              <section className="li-card">
                <div className="li-card-header"><h3 className="li-title">About</h3></div>
                <textarea
                  className="form-input"
                  value={portfolio.summary}
                  onChange={(e) => { setPortfolio(prev => ({ ...prev, summary: e.target.value })); scheduleAutoSync(); }}
                  placeholder="Write a short bio that highlights your goals and strengths"
                  rows={5}
                />
              </section>
              <section className="li-card">
                <div className="li-card-header"><h3 className="li-title">Contacts & Links</h3></div>
                <div className="li-links">
                  <input
                    className={`form-input ${!isValidUrl(portfolio.githubUrl)?'invalid':''}`}
                    placeholder="GitHub URL"
                    value={portfolio.githubUrl}
                    onChange={(e) => { setPortfolio(prev => ({ ...prev, githubUrl: e.target.value })); scheduleAutoSync(); }}
                  />
                  <input
                    className={`form-input ${!isValidUrl(portfolio.linkedinUrl)?'invalid':''}`}
                    placeholder="LinkedIn URL"
                    value={portfolio.linkedinUrl}
                    onChange={(e) => { setPortfolio(prev => ({ ...prev, linkedinUrl: e.target.value })); scheduleAutoSync(); }}
                  />
                  <input
                    className={`form-input ${!isValidUrl(portfolio.websiteUrl)?'invalid':''}`}
                    placeholder="Personal Website URL"
                    value={portfolio.websiteUrl}
                    onChange={(e) => { setPortfolio(prev => ({ ...prev, websiteUrl: e.target.value })); scheduleAutoSync(); }}
                  />
                  <input
                    className={`form-input ${!isValidUrl(portfolio.resumeUrl)?'invalid':''}`}
                    placeholder="Resume URL"
                    value={portfolio.resumeUrl}
                    onChange={(e) => { setPortfolio(prev => ({ ...prev, resumeUrl: e.target.value })); scheduleAutoSync(); }}
                  />
                  <input
                    className={`form-input ${!isValidEmail(user?.email)?'invalid':''}`}
                    placeholder="Email"
                    value={user?.email || ''}
                    onChange={()=>{}}
                    disabled
                  />
                </div>
                <div className="li-actions">
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </section>
            </>
          )}

          {profileTab === 'education' && (
            <section className="li-card">
              <div className="li-card-header">
                <h3 className="li-title">Education</h3>
                <button className="btn btn-secondary" onClick={()=>addItem('education', { ...emptyEducation })}>+ Add</button>
              </div>
              <div className="timeline">
                {(portfolio.education || []).map((ed, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">School / University <span className="required">*</span></span>
                          <input className="form-input" placeholder="e.g., IIT Bombay" value={ed.school} onChange={(e)=>updateItem('education', i, { school: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Location</span>
                          <input className="form-input" placeholder="City, Country" value={ed.location || ''} onChange={(e)=>updateItem('education', i, { location: e.target.value })} />
                        </label>
                      </div>
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">Degree <span className="required">*</span></span>
                          <input className="form-input" placeholder="e.g., B.Tech" value={ed.degree} onChange={(e)=>updateItem('education', i, { degree: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Field of Study</span>
                          <input className="form-input" placeholder="e.g., Computer Science" value={ed.field} onChange={(e)=>updateItem('education', i, { field: e.target.value })} />
                        </label>
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
                      {(() => { const v = validateDateRange(ed.start, ed.end, ed.current); return !v.valid ? (<div className="field-error">{v.message}</div>) : null; })()}
                      <label className="inline-check">
                        <input type="checkbox" checked={!!ed.current} onChange={(e)=>updateItem('education', i, { current: e.target.checked, end: e.target.checked ? '' : (ed.end || currentMonth()) })} />
                        <span>Currently studying</span>
                      </label>
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">Grade / GPA</span>
                          <input className="form-input" placeholder="e.g., 8.5 CGPA" value={ed.grade || ''} onChange={(e)=>updateItem('education', i, { grade: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Description</span>
                          <textarea className="form-input" placeholder="Honors, societies, coursework..." rows={3} value={ed.description} onChange={(e)=>updateItem('education', i, { description: e.target.value })} />
                        </label>
                      </div>
                      <div className="row-actions" style={{ gap: 8 }}>
                        <button className="btn btn-primary" disabled={!validateDateRange(ed.start, ed.end, ed.current).valid || savingEntryKey===`education-${i}`} onClick={()=>saveEntry('education', i)}>
                          {savingEntryKey===`education-${i}` ? 'Saving...' : (savedEntryKey===`education-${i}` ? 'Saved' : 'Save')}
                        </button>
                        <button className="btn btn-secondary" onClick={()=>removeItem('education', i)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profileTab === 'experience' && (
            <section className="li-card">
              <div className="li-card-header">
                <h3 className="li-title">Experience</h3>
                <button className="btn btn-secondary" onClick={()=>addItem('experiences', { ...emptyExperience })}>+ Add</button>
              </div>
              <div className="timeline">
                {(portfolio.experiences || []).map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">Company <span className="required">*</span></span>
                          <input className="form-input" placeholder="e.g., Google" value={exp.company} onChange={(e)=>updateItem('experiences', i, { company: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Title <span className="required">*</span></span>
                          <input className="form-input" placeholder="e.g., Software Engineer" value={exp.title} onChange={(e)=>updateItem('experiences', i, { title: e.target.value })} />
                        </label>
                      </div>
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">Location</span>
                          <input className="form-input" placeholder="City, Country / Remote" value={exp.location || ''} onChange={(e)=>updateItem('experiences', i, { location: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Employment Type</span>
                          <select className="form-input" value={exp.employmentType || ''} onChange={(e)=>updateItem('experiences', i, { employmentType: e.target.value })}>
                            <option value="">Select</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </label>
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
                      {(() => { const v = validateDateRange(exp.start, exp.end, exp.current); return !v.valid ? (<div className="field-error">{v.message}</div>) : null; })()}
                      <label className="inline-check">
                        <input type="checkbox" checked={!!exp.current} onChange={(e)=>updateItem('experiences', i, { current: e.target.checked, end: e.target.checked ? '' : (exp.end || currentMonth()) })} />
                        <span>Currently working here</span>
                      </label>
                      <textarea className="form-input" placeholder="Describe your responsibilities, achievements, tech used..." rows={3} value={exp.description} onChange={(e)=>updateItem('experiences', i, { description: e.target.value })} />
                      <div className="row-actions" style={{ gap: 8 }}>
                        <button className="btn btn-primary" disabled={!validateDateRange(exp.start, exp.end, exp.current).valid || savingEntryKey===`experiences-${i}`} onClick={()=>saveEntry('experiences', i)}>
                          {savingEntryKey===`experiences-${i}` ? 'Saving...' : (savedEntryKey===`experiences-${i}` ? 'Saved' : 'Save')}
                        </button>
                        <button className="btn btn-secondary" onClick={()=>removeItem('experiences', i)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profileTab === 'projects' && (
            <section className="li-card">
              <div className="li-card-header">
                <h3 className="li-title">Projects</h3>
                <button className="btn btn-secondary" onClick={()=>addItem('projects', { ...emptyProject })}>+ Add</button>
              </div>
              <div className="timeline">
                {(portfolio.projects || []).map((pr, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">Project Name <span className="required">*</span></span>
                          <input className="form-input" placeholder="e.g., Smart Attendance System" value={pr.name} onChange={(e)=>updateItem('projects', i, { name: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Role</span>
                          <input className="form-input" placeholder="e.g., Frontend Developer" value={pr.role || ''} onChange={(e)=>updateItem('projects', i, { role: e.target.value })} />
                        </label>
                      </div>
                      <div className="grid-2">
                        <label style={{ width: '100%' }}>
                          <span className="mini-label">Start</span>
                          <input className="form-input" type="month" value={pr.start || ''} onChange={(e)=>updateItem('projects', i, { start: e.target.value })} />
                        </label>
                        <label style={{ width: '100%' }}>
                          <span className="mini-label">End</span>
                          <input className="form-input" type="month" value={pr.end || ''} onFocus={()=>{ if(!pr.end && !pr.current){ updateItem('projects', i, { end: currentMonth() }); } }} onChange={(e)=>updateItem('projects', i, { end: e.target.value, current: false })} disabled={pr.current} />
                        </label>
                      </div>
                      {(() => { const v = validateDateRange(pr.start, pr.end, pr.current); return !v.valid ? (<div className="field-error">{v.message}</div>) : null; })()}
                      <label className="inline-check">
                        <input type="checkbox" checked={!!pr.current} onChange={(e)=>updateItem('projects', i, { current: e.target.checked, end: e.target.checked ? '' : (pr.end || currentMonth()) })} />
                        <span>Currently working</span>
                      </label>
                      <textarea className="form-input" placeholder="Short description of the project" rows={3} value={pr.description} onChange={(e)=>updateItem('projects', i, { description: e.target.value })} />
                      <input className="form-input" placeholder="Tech (comma separated) e.g., React, Node, PostgreSQL" value={(pr.tech || []).join(', ')} onChange={(e)=>updateItem('projects', i, { tech: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
                      <input className="form-input" placeholder="Link (GitHub/Live)" value={pr.link} onChange={(e)=>updateItem('projects', i, { link: e.target.value })} />
                      <div className="row-actions" style={{ gap: 8 }}>
                        <button className="btn btn-primary" disabled={!validateDateRange(pr.start, pr.end, pr.current).valid || savingEntryKey===`projects-${i}`} onClick={()=>saveEntry('projects', i)}>
                          {savingEntryKey===`projects-${i}` ? 'Saving...' : (savedEntryKey===`projects-${i}` ? 'Saved' : 'Save')}
                        </button>
                        <button className="btn btn-secondary" onClick={()=>removeItem('projects', i)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profileTab === 'skills' && (
            <section className="li-card">
              <div className="li-card-header">
                <h3 className="li-title">Skills</h3>
              </div>
              <div className="skills-only">
                <div className="skills-graph">
                  {(portfolio.skills || []).map((skill, i) => (
                    <span key={skill+String(i)} className="skill-chip deletable" title="Remove skill">
                      {skill}
                      <button className="remove-x" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <input id="newSkill" className="form-input" placeholder="Add a skill and press Enter (e.g., Java, Python)" onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addSkill(e.currentTarget.value); e.currentTarget.value = ''; }
                  }} />
                </div>
              </div>
            </section>
          )}
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
            <div className="header-icons">
              <div className="dropdown">
                <button className="icon-btn" title="Notifications" onClick={()=>{ setShowNotif(v=>!v); setShowMsgs(false); }}>
                  🔔 {notificationItems.filter(n=>!n.read).length > 0 && <span className="badge-count">{notificationItems.filter(n=>!n.read).length}</span>}
                </button>
                {showNotif && (
                  <div className="dropdown-menu">
                    {notificationItems.length === 0 ? (
                      <div className="dropdown-empty">No notifications</div>
                    ) : notificationItems.map(n => (
                      <div key={n.id} className={`dropdown-item ${n.read ? '' : 'unread'}`} onClick={()=>{
                        setNotificationItems(prev=>{ const next=prev.map(x=>x.id===n.id?{...x, read:true}:x); localStorage.setItem('tt_notifications', JSON.stringify(next)); return next; });
                      }}>
                        <div className="item-text">{n.text}</div>
                        <div className="item-time">{new Date(n.at).toLocaleString()}</div>
                      </div>
                    ))}
                    {notificationItems.length>0 && (
                      <div className="dropdown-actions">
                        <button className="btn btn-secondary" onClick={()=>{ setNotificationItems(prev=>{ const next=prev.map(x=>({...x, read:true})); localStorage.setItem('tt_notifications', JSON.stringify(next)); return next; }); }}>Mark all read</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="dropdown">
                <button className="icon-btn" title="Messages" onClick={()=>{ setShowMsgs(v=>!v); setShowNotif(false); }}>
                  ✉️ {messageItems.filter(m=>!m.read).length > 0 && <span className="badge-count">{messageItems.filter(m=>!m.read).length}</span>}
                </button>
                {showMsgs && (
                  <div className="dropdown-menu">
                    {messageItems.length === 0 ? (
                      <div className="dropdown-empty">No messages</div>
                    ) : messageItems.map(m => (
                      <div key={m.id} className={`dropdown-item ${m.read ? '' : 'unread'}`} onClick={()=>{
                        setMessageItems(prev=>{ const next=prev.map(x=>x.id===m.id?{...x, read:true}:x); localStorage.setItem('tt_messages', JSON.stringify(next)); return next; });
                      }}>
                        <div className="item-text"><strong>{m.from}:</strong> {m.preview}</div>
                        <div className="item-time">{new Date(m.at).toLocaleString()}</div>
                      </div>
                    ))}
                    {messageItems.length>0 && (
                      <div className="dropdown-actions">
                        <button className="btn btn-secondary" onClick={()=>{ setMessageItems(prev=>{ const next=prev.map(x=>({...x, read:true})); localStorage.setItem('tt_messages', JSON.stringify(next)); return next; }); }}>Mark all read</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setIsDark(v => !v)} className="icon-btn" title="Toggle dark mode">🌓</button>
              <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="icon-btn" title="Logout">
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs sticky">
        <button 
          className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          <span className="tab-icon">💼</span>
          <span className="tab-text">Opportunities</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <span className="tab-icon">👤</span>
          <span className="tab-text">Profile</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          <span className="tab-icon">🧠</span>
          <span className="tab-text">Mentors</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          <span className="tab-icon">🏆</span>
          <span className="tab-text">Credentials</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-text">Activity</span>
        </button>
        <span className="tab-underline" aria-hidden />
      </div>

      <div className="dashboard-content">
        {activeTab === 'opportunities' && renderOpportunitiesTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'mentors' && renderMentorsTab()}
        {activeTab === 'credentials' && renderCredentialsTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && selectedOpportunity && (
        <div className="modal-overlay">
          <div className="application-form-modal">
            <div className="modal-header">
              <h3>Apply for: {selectedOpportunity.title}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setShowApplicationForm(false)
                  setSelectedOpportunity(null)
                  setApplicationForm({
                    opportunityId: '',
                    coverLetter: '',
                    gpa: '',
                    expectedGraduation: '',
                    relevantCourses: '',
                    skills: '',
                    experienceSummary: ''
                  })
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="opportunity-summary">
                <h4>Opportunity Details</h4>
                <div className="opportunity-info">
                  <p><strong>Type:</strong> {selectedOpportunity.type}</p>
                  <p><strong>Location:</strong> {selectedOpportunity.location}</p>
                  <p><strong>Stipend:</strong> {selectedOpportunity.stipend || 'Not specified'}</p>
                  <p><strong>Duration:</strong> {selectedOpportunity.duration || 'Not specified'}</p>
                  <p><strong>Description:</strong> {selectedOpportunity.description}</p>
                </div>
              </div>

              <form className="application-form" onSubmit={(e) => { e.preventDefault(); submitApplication(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>GPA *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={applicationForm.gpa}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, gpa: e.target.value }))}
                      placeholder="e.g., 3.8"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expected Graduation Date *</label>
                    <input
                      type="date"
                      value={applicationForm.expectedGraduation}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, expectedGraduation: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Relevant Courses</label>
                  <textarea
                    value={applicationForm.relevantCourses}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, relevantCourses: e.target.value }))}
                    placeholder="List relevant courses you've taken (e.g., CS 101: Introduction to Programming, MATH 201: Linear Algebra)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <textarea
                    value={applicationForm.skills}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="List your relevant skills (e.g., Python, React, Machine Learning, Git)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Experience Summary</label>
                  <textarea
                    value={applicationForm.experienceSummary}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, experienceSummary: e.target.value }))}
                    placeholder="Briefly describe your relevant experience, projects, or achievements"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Cover Letter *</label>
                  <textarea
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder="Write a cover letter explaining why you're interested in this opportunity and why you're a good fit..."
                    rows="6"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowApplicationForm(false)
                      setSelectedOpportunity(null)
                      setApplicationForm({
                        opportunityId: '',
                        coverLetter: '',
                        gpa: '',
                        expectedGraduation: '',
                        relevantCourses: '',
                        skills: '',
                        experienceSummary: ''
                      })
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-paper-plane"></i>
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
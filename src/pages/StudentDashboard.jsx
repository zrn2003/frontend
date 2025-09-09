import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api.js';
import { TrustTeamsLoader } from '../components/shared';
import './StudentDashboard.css';
import './StudentDashboardTheme.css';
import './ComingSoonStyles.css';

// SVG Icon Components
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
    <circle cx="7" cy="7" r="1"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const MoneyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="12" x="2" y="6" rx="2"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M16 10V8"/>
    <path d="M8 10v2"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 1 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="m22 21-2-2a4 4 0 0 0-3-3h-2"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const currentMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
};

const emptyExperience = { company: '', title: '', location: '', employmentType: '', start: currentMonth(), end: '', current: true, description: '' };
const emptyEducation = { 
  educationType: '', 
  school: '', 
  degree: '', 
  field: '', 
  location: '', 
  board: '', 
  grade: '', 
  start: currentMonth(), 
  end: currentMonth(), 
  current: false, 
  description: '' 
};
const emptyProject = { name: '', role: '', description: '', tech: [], link: '', start: currentMonth(), end: '', current: false };

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0, pages: 0 });
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const navigate = useNavigate();
  const syncTimerRef = useRef(null);
  const [profileTab, setProfileTab] = useState('info');
  const [notificationItems, setNotificationItems] = useState([]);
  const [messageItems, setMessageItems] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showMsgs, setShowMsgs] = useState(false);
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const [savingEntryKey, setSavingEntryKey] = useState('');
  const [savedEntryKey, setSavedEntryKey] = useState('');
  
  // Application state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingApplied, setIsLoadingApplied] = useState(false);
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);
  const [isSkillOperation, setIsSkillOperation] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debug effect to monitor portfolio changes
  useEffect(() => {
    console.log('Portfolio state changed:', portfolio);
  }, [portfolio]);

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
    
    // Load profile image from localStorage
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImageUrl(savedProfileImage);
    }
    
    fetchOpportunities(true);
    fetchProfile();
    fetchAppliedOpportunities();
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
    document.body.classList.toggle('dark', isDarkTheme);
    return () => document.body.classList.remove('dark');
  }, [isDarkTheme]);

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

  // Common skills for suggestions
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js',
    'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C#', 'ASP.NET',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'C++', 'C',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD', 'Testing',
    'Jest', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing'
  ];

  // Get skill suggestions based on input
  const getSkillSuggestions = (input) => {
    if (!input || input.length < 1) return [];
    
    const lowerInput = input.toLowerCase();
    const suggestions = commonSkills.filter(skill => 
      skill.toLowerCase().includes(lowerInput) && 
      !(portfolio.skills || []).some(existingSkill => 
        existingSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  };

  const scheduleAutoSync = () => {
    // Don't auto-sync during skill operations to prevent state conflicts
    if (isSkillOperation) {
      console.log('[AutoSync] Skipped during skill operation');
      return;
    }
    
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

  const validateEducationEntry = (ed) => {
    if (!ed.educationType) return { valid: false, message: 'Education type is required' };
    if (!ed.school) return { valid: false, message: 'School/University is required' };
    
    // Degree/Course is optional for 10th standard, required for others
    if (ed.educationType !== '10th' && !ed.degree) {
      return { valid: false, message: 'Degree/Course is required' };
    }
    
    // Additional validation based on education type
    if (ed.educationType === '10th' || ed.educationType === '12th') {
      if (!ed.board) return { valid: false, message: 'Board is required for school education' };
    }
    
    return { valid: true };
  };

  // Check if student has completed mandatory education (10th, 12th/diploma, graduation)
  const checkMandatoryEducation = () => {
    const education = portfolio.education || [];
    
    // Check for 10th standard
    const has10th = education.some(ed => ed.educationType === '10th' && ed.school && ed.board);
    if (!has10th) {
      return { valid: false, message: 'Please add your 10th standard education details' };
    }
    
    // Check for 12th standard or diploma
    const has12thOrDiploma = education.some(ed => 
      (ed.educationType === '12th' || ed.educationType === 'diploma') && 
      ed.school && ed.board && ed.degree
    );
    if (!has12thOrDiploma) {
      return { valid: false, message: 'Please add your 12th standard or diploma education details' };
    }
    
    // Check for graduation
    const hasGraduation = education.some(ed => 
      ed.educationType === 'graduation' && 
      ed.school && ed.degree && ed.field
    );
    if (!hasGraduation) {
      return { valid: false, message: 'Please add your graduation education details' };
    }
    
    return { valid: true, message: 'All mandatory education details completed' };
  };

  // Get expected graduation date from profile
  const getExpectedGraduationFromProfile = () => {
    const graduation = portfolio.education?.find(ed => ed.educationType === 'graduation');
    if (graduation && graduation.end) {
      return graduation.end;
    }
    // If no end date, estimate based on current date
    const currentYear = new Date().getFullYear();
    return `${currentYear + 1}-05-15`;
  };

  // Get relevant courses from profile
  const getRelevantCoursesFromProfile = () => {
    const graduation = portfolio.education?.find(ed => ed.educationType === 'graduation');
    if (graduation) {
      return `${graduation.degree} in ${graduation.field || 'General'}`;
    }
    return 'Not specified';
  };

  // Get experience summary from profile
  const getExperienceSummaryFromProfile = () => {
    const experiences = portfolio.experiences || [];
    if (experiences.length === 0) {
      return 'No work experience yet';
    }
    
    const latestExp = experiences[0];
    return `${latestExp.title} at ${latestExp.company} - ${latestExp.description || 'Experience in the field'}`;
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
    
    // Don't apply skill updates when removing skills to prevent overriding the removal
    if (type !== 'skill.remove') {
    applySkillUpdatesFromActivity(payload);
    }
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
    let score = 0;
    let total = 0;

    // Basic Info (20 points)
    total += 20;
    if (user?.name && user.name.trim().length > 0) score += 5;
    if (user?.email && user.email.trim().length > 0) score += 5;
    if (portfolio.summary && portfolio.summary.trim().length > 0) score += 10;

    // Education (20 points)
    total += 20;
    if (portfolio.education && portfolio.education.length > 0) score += 20;

    // Experience (20 points)
    total += 20;
    if (portfolio.experiences && portfolio.experiences.length > 0) score += 20;

    // Skills (15 points)
    total += 15;
    if (portfolio.skills && portfolio.skills.length > 0) score += 15;

    // Projects (15 points)
    total += 15;
    if (portfolio.projects && portfolio.projects.length > 0) score += 15;

    // Links & Resume (10 points)
    total += 10;
    const hasLinks = (portfolio.githubUrl && portfolio.githubUrl.trim().length > 0) ||
                    (portfolio.linkedinUrl && portfolio.linkedinUrl.trim().length > 0) ||
                    (portfolio.websiteUrl && portfolio.websiteUrl.trim().length > 0) ||
                    (portfolio.resumeUrl && portfolio.resumeUrl.trim().length > 0);
    if (hasLinks) score += 10;

    return {
      percentage: Math.round((score / total) * 100),
      score,
      total
    };
  };

  const isProfileIncomplete = () => {
    // Check if any required fields are missing or empty
    const hasName = user?.name && user.name.trim().length > 0;
    const hasEmail = user?.email && user.email.trim().length > 0;
    const hasSummary = portfolio.summary && portfolio.summary.trim().length > 0;
    const hasEducation = portfolio.education && portfolio.education.length > 0;
    const hasExperience = portfolio.experiences && portfolio.experiences.length > 0;
    const hasSkills = portfolio.skills && portfolio.skills.length > 0;
    const hasProjects = portfolio.projects && portfolio.projects.length > 0;
    const hasLinks = (portfolio.githubUrl && portfolio.githubUrl.trim().length > 0) ||
                    (portfolio.linkedinUrl && portfolio.linkedinUrl.trim().length > 0) ||
                    (portfolio.websiteUrl && portfolio.websiteUrl.trim().length > 0) ||
                    (portfolio.resumeUrl && portfolio.resumeUrl.trim().length > 0);

    return !hasName || !hasEmail || !hasSummary || !hasEducation || !hasExperience || !hasSkills || !hasProjects || !hasLinks;
  };

  // Individual section completion checks
  const isBasicInfoIncomplete = () => {
    const hasName = user?.name && user.name.trim().length > 0;
    const hasEmail = user?.email && user.email.trim().length > 0;
    const hasSummary = portfolio.summary && portfolio.summary.trim().length > 0;
    return !hasName || !hasEmail || !hasSummary;
  };

  const isEducationIncomplete = () => {
    return !portfolio.education || portfolio.education.length === 0;
  };

  const isExperienceIncomplete = () => {
    return !portfolio.experiences || portfolio.experiences.length === 0;
  };

  const isSkillsIncomplete = () => {
    return !portfolio.skills || portfolio.skills.length === 0;
  };

  const isProjectsIncomplete = () => {
    return !portfolio.projects || portfolio.projects.length === 0;
  };

  // Profile image upload functionality
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImageUrl(e.target.result);
        setProfileImage(file);
        // Save to localStorage for persistence
        localStorage.setItem('profileImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImageUrl('');
    localStorage.removeItem('profileImage');
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

  const fetchAppliedOpportunities = async () => {
    try {
      setIsLoadingApplied(true);
      const userData = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
      if (userData.id) {
        const data = await api.getStudentApplications(userData.id);
        setAppliedOpportunities(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applied opportunities:', error);
      setAppliedOpportunities([]);
    } finally {
      setIsLoadingApplied(false);
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

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
    
    console.log('addSkill called with:', skill);
    console.log('processed skill:', s);
    console.log('current skills before adding:', portfolio.skills);
    
    // Check skill limit (maximum 20 skills)
    const MAX_SKILLS = 20;
    if ((portfolio.skills || []).length >= MAX_SKILLS) {
      alert(`You can only add up to ${MAX_SKILLS} skills. Please remove some skills before adding new ones.`);
      return;
    }
    
    // Check if skill already exists
    if ((portfolio.skills || []).some(existingSkill => existingSkill.toLowerCase() === s)) {
      alert('This skill is already in your list.');
      return;
    }
    
    // Set skill operation flag to prevent auto-sync interference
    setIsSkillOperation(true);
    
    // Clear any pending auto-sync to prevent interference
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    
    setPortfolio(prev => {
      const newSkills = Array.from(new Set((prev.skills || []).map(x=>String(x).toLowerCase()).concat([s])));
      console.log('new skills after adding:', newSkills);
      return { ...prev, skills: newSkills };
    });
    
    logActivity('skill.add', { text: s });
    
    // Re-enable auto-sync after a delay
    setTimeout(() => {
      setIsSkillOperation(false);
      scheduleAutoSync();
    }, 200);
  };

  const removeSkill = (skill) => {
    console.log('removeSkill called with:', skill);
    const target = String(skill || '').toLowerCase();
    console.log('target skill to remove:', target);
    console.log('current skills:', portfolio.skills);
    
    // Confirm skill removal
    if (window.confirm(`Are you sure you want to remove "${skill}" from your skills?`)) {
      console.log('User confirmed removal');
      
      // Set skill operation flag to prevent auto-sync interference
      setIsSkillOperation(true);
      
      // Clear any pending auto-sync to prevent interference
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      
      setPortfolio(prev => {
        const newSkills = (prev.skills || []).filter(x => String(x).toLowerCase() !== target);
        console.log('new skills after removal:', newSkills);
        return { ...prev, skills: newSkills };
      });
      
      logActivity('skill.remove', { text: skill });
      
      // Re-enable auto-sync after a delay
      setTimeout(() => {
        setIsSkillOperation(false);
        scheduleAutoSync();
      }, 200);
    } else {
      console.log('User cancelled removal');
    }
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
    console.log('Apply button clicked for opportunity:', oppId);
    const opp = opportunities.find(o => o.id === oppId);
    console.log('Found opportunity:', opp);
    
    // Check if already applied
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.id) {
      alert('Please log in to apply for opportunities');
      return;
    }

    // Check if student has completed mandatory education details
    const hasMandatoryEducation = checkMandatoryEducation();
    if (!hasMandatoryEducation.valid) {
      alert(`Please complete your education profile first: ${hasMandatoryEducation.message}`);
      setActiveTab('portfolio');
      setProfileTab('education');
      return;
    }

    // Apply directly to opportunity
    try {
      setIsSubmitting(true);
      
      // Prepare application data from student's profile
      const applicationData = {
        opportunityId: oppId,
        coverLetter: `I am interested in this ${opp.type} opportunity at ${opp.postedByName || 'this organization'}. I believe my skills and education background make me a suitable candidate for this position.`,
        gpa: null, // Will be extracted from education if available
        expectedGraduation: getExpectedGraduationFromProfile(),
        relevantCourses: getRelevantCoursesFromProfile(),
        skills: (portfolio.skills || []).join(', '),
        experienceSummary: getExperienceSummaryFromProfile()
      };

      await api.applyToOpportunity(applicationData);
      
      // Log activity
      logActivity('opportunity.apply', { 
        id: oppId, 
        text: `${opp.title} ${opp.description || ''}`, 
        requirements: opp.requirements || [] 
      });

      alert('Successfully applied to the opportunity!');
      
    } catch (error) {
      console.error('Application error:', error);
      
      // Show user-friendly error messages
      if (error.message.includes('Already applied')) {
        alert('You have already applied to this opportunity. Please try applying to a different one.\n\nTip: Look for opportunities you haven\'t applied to yet.');
      } else if (error.message.includes('not open')) {
        alert('This opportunity is no longer open for applications.');
      } else if (error.message.includes('deadline has passed')) {
        alert('The application deadline for this opportunity has passed.');
      } else {
        alert('Failed to apply: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
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
    return (
      <div className="tab-content fade-in">
        <div className="coming-soon-section">
          <div className="coming-soon-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
                  </div>
          <h2>Activity Dashboard</h2>
          <h3>Coming Soon!</h3>
          <p>We're building a comprehensive activity tracking system that will help you monitor your progress and skill development over time.</p>
          <div className="coming-soon-features">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Real-time Activity Tracking</span>
                </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Skills Growth Analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Goal Progress Monitoring</span>
        </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span>Timeline View</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Achievement Badges</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <span>Activity Reports</span>
            </div>
          </div>
          <div className="coming-soon-note">
            Track your learning journey and see your skills grow in real-time!
          </div>
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
          <div className="error-icon"><WarningIcon /></div>
          <h3>Error Loading Opportunities</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchOpportunities(true)}>Try Again</button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="no-opportunities">
          <div className="no-data-icon"><SearchIcon /></div>
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
                    {opp.verified && <span className="badge verified" aria-label="Verified"><CheckIcon /> Verified</span>}
                    {opp.highValue && <span className="badge high-value" aria-label="High value"><StarIcon /> High Value</span>}
                  </div>
                </div>
                <div className="opp-meta">
                  <div className="company-avatar" aria-hidden>{(opp.postedByName || 'T').charAt(0)}</div>
                  <p className="opp-company">{opp.postedByName || 'TrustTeams partner'}</p>
                </div>
                <p className="opp-description">{opp.description}</p>
                <div className="opp-details">
                  <span><LocationIcon /> {opp.location || 'N/A'}</span>
                  <span><TagIcon /> {opp.type}</span>
                  <span><CalendarIcon /> {opp.closingDate ? new Date(opp.closingDate).toLocaleDateString() : 'N/A'}</span>
                  <span><PinIcon /> {opp.status}</span>
                  {opp.stipend && <span><MoneyIcon /> {opp.stipend}</span>}
                  {opp.duration && <span><ClockIcon /> {opp.duration}</span>}
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
                      {opp.contact_email && <span><EmailIcon /> {opp.contact_email}</span>}
                      {opp.contact_phone && <span><PhoneIcon /> {opp.contact_phone}</span>}
                    </div>
                  </div>
                )}
                <div className="opp-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApplyToOpportunity(opp.id)}
                    title="Apply"
                  >
                    <SendIcon /> Apply
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSaveOpportunity(opp.id)}
                    title="Save"
                  >
                    <StarIcon /> Save
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

  const renderAppliedOpportunitiesTab = () => (
    <div className="tab-content fade-in" data-state={isLoadingApplied ? 'loading' : (appliedOpportunities.length === 0 ? 'empty' : 'ready')}>
      <div className="applied-opportunities-header">
        <h3>My Applied Opportunities</h3>
        <p>Track your applications and their status.</p>
      </div>
      {isLoadingApplied ? (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      ) : appliedOpportunities.length === 0 ? (
        <div className="no-applied-opportunities">
          <div className="no-data-icon"><DocumentIcon /></div>
          <h3>No opportunities applied to yet</h3>
          <p>Apply to opportunities to see their status here.</p>
        </div>
      ) : (
        <div className="applied-opportunities-grid">
          {appliedOpportunities.map(application => (
            <div key={application.id} className="applied-opportunity-card">
              <div className="opp-header">
                <h4>{application.opportunity_title}</h4>
                <div className="opp-badges">
                  <span className={`badge status ${application.status}`} aria-label="Application Status">
                    {application.status}
                  </span>
                </div>
              </div>
              <div className="opp-meta">
                <div className="company-avatar" aria-hidden>{(application.posted_by_name || 'T').charAt(0)}</div>
                <p className="opp-company">{application.posted_by_name || 'TrustTeams partner'}</p>
              </div>
              <div className="opp-details">
                                  <span><CalendarIcon /> Applied on: {new Date(application.application_date).toLocaleDateString()}</span>
                                  <span><TagIcon /> Type: {application.opportunity_type}</span>
                                  <span><LocationIcon /> Location: {application.opportunity_location || 'N/A'}</span>
                                  {application.opportunity_stipend && <span><MoneyIcon /> Stipend: {application.opportunity_stipend}</span>}
                                  {application.opportunity_duration && <span><ClockIcon /> Duration: {application.opportunity_duration}</span>}
                                  <span><PinIcon /> Status: {application.status}</span>
              </div>
              {application.cover_letter && (
                <div className="cover-letter-preview">
                  <strong>Cover Letter Preview:</strong>
                  <p>{application.cover_letter.length > 150 ? 
                    `${application.cover_letter.substring(0, 150)}...` : 
                    application.cover_letter
                  }</p>
                </div>
              )}
              {application.review_notes && (
                <div className="review-notes">
                  <strong>Review Notes:</strong>
                  <p>{application.review_notes}</p>
                </div>
              )}
              <div className="opp-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => alert(`Application ID: ${application.id}\nOpportunity: ${application.opportunity_title}\nStatus: ${application.status}`)}
                >
                  View Details
                </button>
                {application.status === 'pending' && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => alert('Withdraw functionality coming soon!')}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
    const profileData = computeProfileCompleteness();
    return (
      <div className="li-profile-wrap">
        <div className="profile-banner" aria-hidden />
        <div className="modern-profile-card">
          {/* Avatar - Centered with ring and shadow */}
          <div className="avatar-section">
            <div className="modern-avatar">
              {profileImageUrl ? (
                <img 
                  src={profileImageUrl} 
                  alt={`${user?.name || 'Student'} profile picture`}
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initials">{initials}</span>
              )}
              <div className="avatar-overlay">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="avatar-upload-input"
                  id="profile-image-upload"
                />
                <label htmlFor="profile-image-upload" className="avatar-upload-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                </label>
                {profileImageUrl && (
                  <button 
                    className="avatar-remove-btn"
                    onClick={removeProfileImage}
                    title="Remove image"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
            </div>
            </div>
            </div>

          {/* User Info - Centered below avatar */}
          <div className="user-info-section">
            <div className="email-container">
              <div className="user-email text-sm muted" title={user?.email || ''}>
                {user?.email || ''}
          </div>
              {user?.email && (
                <button 
                  className="copy-email-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(user.email);
                    // You could add a toast notification here
                  }}
                  title="Copy email"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              )}
            </div>
            <h2 className="user-name text-2xl">
              {user?.name ? user.name.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ') : 'Student'}
            </h2>
            <div className="role-badge-container">
              <span className="role-badge">Student</span>
            </div>
          </div>

          {/* Profile Completeness Section */}
          <div className="completeness-section">
            <h3 className="completeness-title">Profile Completeness</h3>
            <div 
              className="progress-container"
              role="progressbar"
              aria-valuenow={profileData.percentage}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Profile ${profileData.percentage}% complete`}
            >
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${profileData.percentage}%`,
                  backgroundColor: '#22C55E',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 30%, #15803D 70%, #166534 100%)'
                }} 
              />
              <span className="progress-percentage">{profileData.percentage}%</span>
            </div>
            <div className="helper-message">
              Profile {profileData.percentage}% complete. Finish setup to get better matches.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPortfolioTab = () => (
    <div className="tab-content">
      <div className="sd-shell">
        <aside className={`sd-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="sd-nav">
            <button className={`sd-nav-item ${profileTab==='info'?'active':''}`} onClick={()=>setProfileTab('info')}>
              Profile Info
              {isBasicInfoIncomplete() && <span className="profile-incomplete-dot"></span>}
            </button>
            <button className={`sd-nav-item ${profileTab==='education'?'active':''}`} onClick={()=>setProfileTab('education')}>
              Education
              {isEducationIncomplete() && <span className="profile-incomplete-dot"></span>}
            </button>
            <button className={`sd-nav-item ${profileTab==='experience'?'active':''}`} onClick={()=>setProfileTab('experience')}>
              Experience
              {isExperienceIncomplete() && <span className="profile-incomplete-dot"></span>}
            </button>
            <button className={`sd-nav-item ${profileTab==='skills'?'active':''}`} onClick={()=>setProfileTab('skills')}>
              Skills
              {isSkillsIncomplete() && <span className="profile-incomplete-dot"></span>}
            </button>
            <button className={`sd-nav-item ${profileTab==='projects'?'active':''}`} onClick={()=>setProfileTab('projects')}>
              Projects
              {isProjectsIncomplete() && <span className="profile-incomplete-dot"></span>}
            </button>
            <button className={`sd-nav-item ${profileTab==='export'?'active':''}`} onClick={()=>setProfileTab('export')}>
              Export PDF
            </button>
          </nav>

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
                          <span className="mini-label">Education Type <span className="required">*</span></span>
                          <select 
                            className="form-input" 
                            value={ed.educationType || ''} 
                            onChange={(e)=>updateItem('education', i, { educationType: e.target.value })}
                          >
                            <option value="">Select Education Type</option>
                            <option value="10th">10th Standard</option>
                            <option value="12th">12th Standard</option>
                            <option value="diploma">Diploma</option>
                            <option value="graduation">Graduation (Bachelor's)</option>
                            <option value="other">Other</option>
                          </select>
                          {ed.educationType && (
                            <small className="field-hint">
                              {ed.educationType === '10th' && 'For 10th standard/Secondary School Certificate. Course field is optional.'}
                              {ed.educationType === '12th' && 'For 12th standard/Higher Secondary Certificate'}
                              {ed.educationType === 'diploma' && 'For Diploma courses (Polytechnic, ITI, etc.)'}
                              {ed.educationType === 'graduation' && 'For Bachelor\'s degree programs'}
                              {ed.educationType === 'other' && 'For other educational qualifications'}
                            </small>
                          )}
                          {(() => { const v = validateEducationEntry(ed); return !v.valid ? (<div className="field-error">{v.message}</div>) : null; })()}
                        </label>
                        <label>
                          <span className="mini-label">School / University <span className="required">*</span></span>
                          <input className="form-input" placeholder="e.g., IIT Bombay" value={ed.school} onChange={(e)=>updateItem('education', i, { school: e.target.value })} />
                        </label>
                      </div>
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">Location</span>
                          <input className="form-input" placeholder="City, Country" value={ed.location || ''} onChange={(e)=>updateItem('education', i, { location: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Board / University</span>
                          <input className="form-input" placeholder="e.g., CBSE, State Board, University Name" value={ed.board || ''} onChange={(e)=>updateItem('education', i, { board: e.target.value })} />
                        </label>
                      </div>
                      <div className="form-row grid-2">
                        <label>
                          <span className="mini-label">
                            Degree / Course 
                            {ed.educationType !== '10th' && <span className="required">*</span>}
                          </span>
                          <input 
                            className="form-input" 
                            placeholder={ed.educationType === '10th' ? "e.g., Secondary School Certificate (optional)" : "e.g., B.Tech, Science, Commerce"} 
                            value={ed.degree} 
                            onChange={(e)=>updateItem('education', i, { degree: e.target.value })} 
                          />
                        </label>
                        <label>
                          <span className="mini-label">Field of Study</span>
                          <input className="form-input" placeholder="e.g., Computer Science, PCM, PCB" value={ed.field} onChange={(e)=>updateItem('education', i, { field: e.target.value })} />
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
                          <span className="mini-label">Grade / GPA / Percentage</span>
                          <input className="form-input" placeholder="e.g., 8.5 CGPA, 85%, A+, First Class" value={ed.grade || ''} onChange={(e)=>updateItem('education', i, { grade: e.target.value })} />
                        </label>
                        <label>
                          <span className="mini-label">Description</span>
                          <textarea className="form-input" placeholder="Honors, societies, coursework..." rows={3} value={ed.description} onChange={(e)=>updateItem('education', i, { description: e.target.value })} />
                        </label>
                      </div>
                      <div className="row-actions" style={{ gap: 8 }}>
                        <button className="btn btn-primary" disabled={!validateDateRange(ed.start, ed.end, ed.current).valid || !validateEducationEntry(ed).valid || savingEntryKey===`education-${i}`} onClick={()=>saveEntry('education', i)}>
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
            <section className="li-card skills-section">
              <div className="li-card-header">
                <h3 className="li-title">Skills</h3>
              </div>
              
              <div className="skills-container">
                {(portfolio.skills || []).length === 0 ? (
                  <div className="no-skills">
                    <p>No skills added yet. Add your first skill to get started!</p>
                  </div>
                ) : (
                  (portfolio.skills || []).map((skill, i) => (
                    <span key={skill+String(i)} className="skill-chip deletable" title="Click × to remove this skill">
                      {skill}
                      <button 
                        className="remove-x" 
                        onClick={(e) => {
                          console.log('Remove button clicked for skill:', skill);
                          console.log('Event target:', e.target);
                          e.preventDefault();
                          e.stopPropagation();
                          removeSkill(skill);
                        }} 
                        aria-label={`Remove ${skill}`}
                        title={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              
              <div className="add-skill-container">
                <div className="skill-suggestions">
                <input 
                  id="newSkill" 
                  className={`add-skill-input ${(portfolio.skills || []).length >= 20 ? 'disabled' : ''}`}
                  placeholder={
                    (portfolio.skills || []).length >= 20 
                      ? "Skill limit reached (20/20). Remove skills to add more." 
                        : "Add a skill (e.g., Java, Python, SQL)"
                  }
                  disabled={(portfolio.skills || []).length >= 20}
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      if (e.target.value.length > 0) {
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { 
                      e.preventDefault(); 
                        if (skillInput.trim()) {
                          addSkill(skillInput.trim()); 
                          setSkillInput(''); 
                          setShowSuggestions(false);
                        }
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }} 
                    onFocus={() => {
                      if (skillInput.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  
                  {showSuggestions && skillInput.length > 0 && (
                    <div className="skill-suggestions-dropdown">
                      {getSkillSuggestions(skillInput).map((suggestion, index) => (
                        <div
                          key={index}
                          className="skill-suggestion-item"
                          onClick={() => {
                            addSkill(suggestion);
                            setSkillInput('');
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="suggestion-icon"></div>
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="skill-counter">
                  {(portfolio.skills || []).length} of 20 skills added
                </div>
                
                {(portfolio.skills || []).length >= 20 && (
                  <div className="skill-limit-reached">
                    Maximum 20 skills reached. Remove skills to add more.
                  </div>
                )}
              </div>
              

            </section>
          )}

          {profileTab === 'export' && (
            <section className="li-card">
              <div className="coming-soon-section">
                <div className="coming-soon-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h2>PDF Export</h2>
                <h3>Coming Soon!</h3>
                <p>We're developing a comprehensive PDF export feature that will allow you to download your complete profile as a professional resume.</p>
                <div className="coming-soon-features">
                  <div className="feature-item">
                    <span className="feature-icon">📄</span>
                    <span>Professional Resume Format</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎨</span>
                    <span>Multiple Design Templates</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <span>Skills Visualization</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>One-Click Download</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔧</span>
                    <span>Customizable Sections</span>
                  </div>
                </div>
                <div className="coming-soon-note">
                  This feature will be available in the next update. Stay tuned!
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );

  const renderMentorsTab = () => (
    <div className="tab-content fade-in">
      <div className="coming-soon-section">
        <div className="coming-soon-icon">
          <UsersIcon />
        </div>
        <h2>Mentor Program</h2>
        <h3>Coming Soon!</h3>
        <p>We're working hard to connect you with industry experts and mentors who can guide your career journey.</p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Personalized mentorship</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💼</span>
            <span>Industry insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <span>Career guidance</span>
          </div>
        </div>
        <p className="coming-soon-note">Stay tuned for updates on our mentor program launch!</p>
      </div>
    </div>
  );

  const renderCredentialsTab = () => (
    <div className="tab-content fade-in">
      <div className="coming-soon-section">
        <div className="coming-soon-icon">
          <TrophyIcon />
        </div>
        <h2>Micro-Credentials</h2>
        <h3>Coming Soon!</h3>
        <p>Earn verified credentials for your skills and project completions to showcase your capabilities to employers.</p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <span className="feature-icon">🏆</span>
            <span>Verified skills</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📜</span>
            <span>Digital certificates</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💼</span>
            <span>Employer recognition</span>
          </div>
        </div>
        <p className="coming-soon-note">Complete projects and internships to unlock your first credentials!</p>
      </div>
    </div>
  );

  return (
    <div className={`student-dashboard ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* TrustTeams Loading Bar */}
      <TrustTeamsLoader 
        isLoading={isLoading}
        message="Loading opportunities..."
        showProgress={false}
        size="medium"
      />
      
      {/* Mobile Menu Toggle */}
      <button className="nav-toggle" onClick={handleMobileMenuToggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" x2="21" y1="6" y2="6"/>
          <line x1="3" x2="21" y1="12" y2="12"/>
          <line x1="3" x2="21" y1="18" y2="18"/>
        </svg>
      </button>

      {/* Navigation Sidebar */}
      <nav className={`nav-sidebar ${isDarkTheme ? 'dark' : 'light'} ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="nav-logo">
          <div className="nav-logo-icon">TT</div>
          <div className="nav-logo-text">TrustTeams</div>
        </div>

        {/* Navigation Menu */}
        <div className="nav-menu">
                     <a 
             href="#opportunities"
             className={`nav-menu-item ${activeTab === 'opportunities' ? 'active' : ''}`}
             onClick={() => setActiveTab('opportunities')}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
               <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
               <polyline points="7.5,19.79 7.5,14.6 3,12"/>
               <polyline points="21,12 16.5,14.6 16.5,19.79"/>
               <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
               <line x1="12" x2="12" y1="22.08" y2="12"/>
             </svg>
             <span className="nav-menu-item-text">Opportunities</span>
           </a>

                     <a 
             href="#applied"
             className={`nav-menu-item ${activeTab === 'applied' ? 'active' : ''}`}
             onClick={() => setActiveTab('applied')}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
               <polyline points="14,2 14,8 20,8"/>
               <line x1="16" x2="8" y1="13" y2="13"/>
               <line x1="16" x2="8" y1="17" y2="17"/>
               <line x1="10" x2="8" y1="9" y2="9"/>
             </svg>
             <span className="nav-menu-item-text">Applied</span>
           </a>

                     <a 
             href="#portfolio"
             className={`nav-menu-item ${activeTab === 'portfolio' ? 'active' : ''}`}
             onClick={() => setActiveTab('portfolio')}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
               <circle cx="12" cy="7" r="4"/>
             </svg>
             <span className="nav-menu-item-text">Profile</span>
           </a>

                     <a 
             href="#mentors"
             className={`nav-menu-item ${activeTab === 'mentors' ? 'active' : ''}`}
             onClick={() => setActiveTab('mentors')}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
               <circle cx="9" cy="7" r="4"/>
               <path d="m22 21-2-2a4 4 0 0 0-3-3h-2"/>
               <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
             </svg>
             <span className="nav-menu-item-text">Mentors</span>
           </a>

                     <a 
             href="#credentials"
             className={`nav-menu-item ${activeTab === 'credentials' ? 'active' : ''}`}
             onClick={() => setActiveTab('credentials')}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
               <path d="M18 9h1.5a2.5 2.5 0 0 1 0-5H18"/>
               <path d="M4 22h16"/>
               <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"/>
               <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
             </svg>
             <span className="nav-menu-item-text">Credentials</span>
           </a>

                     <a 
             href="#activity"
             className={`nav-menu-item ${activeTab === 'activity' ? 'active' : ''}`}
             onClick={() => setActiveTab('activity')}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 2v20M2 12h20"/>
               <path d="m9 9 6 6"/>
               <path d="m15 9-6 6"/>
             </svg>
             <span className="nav-menu-item-text">Activity</span>
           </a>
        </div>

        {/* Bottom Section */}
        <div className="nav-bottom">
          {/* Logout Button */}
          <button className="nav-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div 
        className={`nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={handleMobileMenuToggle}
      ></div>

      {/* Main Content */}
      <main className="main-content">
        {/* Professional Header */}
        <header className="professional-header">
          <div className="header-container">
            {/* Left Section - Logo/College Name */}
            <div className="header-left">
              <div className="college-info">
                <h1 className="college-name">Skn Sinhgad College Of Engineering, Pandharpur</h1>
              </div>
            </div>

            {/* Right Section - User Actions */}
            <div className="header-right">
          <div className="header-actions">
                {/* Person Icon */}
                <button className="header-icon-btn" title="Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>

                {/* Calendar Icon */}
                <button className="header-icon-btn" title="Calendar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                </button>

                {/* Messages Icon with Badge */}
                <div className="dropdown">
                  <button className="header-icon-btn" title="Messages" onClick={()=>{ setShowMsgs(v=>!v); setShowNotif(false); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {messageItems.filter(m=>!m.read).length > 0 && <span className="notification-badge">{messageItems.filter(m=>!m.read).length}</span>}
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
              
                {/* Notifications Icon with Badge */}
              <div className="dropdown">
                  <button className="header-icon-btn" title="Notifications" onClick={()=>{ setShowNotif(v=>!v); setShowMsgs(false); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                    {notificationItems.filter(n=>!n.read).length > 0 && <span className="notification-badge">{notificationItems.filter(n=>!n.read).length}</span>}
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

                {/* User Profile Section */}
                <div className="user-profile-section">
                  <div className="user-avatar">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt={`${user?.name || 'Student'} profile picture`}
                        className="avatar-image"
                      />
                    ) : (
                      <span className="avatar-initials">{(user?.name || 'S').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user?.name || 'Student'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dropdown-arrow">
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
        {activeTab === 'opportunities' && renderOpportunitiesTab()}
        {activeTab === 'applied' && renderAppliedOpportunitiesTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'mentors' && renderMentorsTab()}
        {activeTab === 'credentials' && renderCredentialsTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
import React, { useState, useEffect } from 'react';
import { api } from '../../config/api.js';
import { TrustTeamsLoader } from '../shared';
import './IcmDashboard.css';
import './IcmDashboardTheme.css';

const IcmDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeProfileTab, setActiveProfileTab] = useState('company');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [universities, setUniversities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // University section specific states
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [universityStats, setUniversityStats] = useState({});
  
  // Profile states
  const [icmProfile, setIcmProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
  
     // Modal states
   const [showOpportunityModal, setShowOpportunityModal] = useState(false);
   const [showEditOpportunityModal, setShowEditOpportunityModal] = useState(false);
   const [showApplicationsModal, setShowApplicationsModal] = useState(false);
   const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
   const [selectedOpportunity, setSelectedOpportunity] = useState(null);
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [studentProfile, setStudentProfile] = useState(null);
   const [loadingStudentProfile, setLoadingStudentProfile] = useState(false);
   const [editingOpportunity, setEditingOpportunity] = useState(null);
   const [loadingEditOpportunity, setLoadingEditOpportunity] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingOpportunity, setDeletingOpportunity] = useState(null);
   const [loadingDelete, setLoadingDelete] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState(null);
  
  // Applications state
  const [allApplications, setAllApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
     // Opportunity form state
   const [opportunityForm, setOpportunityForm] = useState({
     title: '',
     type: 'internship',
     description: '',
     requirements: '',
     stipend: '',
     duration: '',
     location: '',
     contact_email: '',
     contact_phone: '',
     closing_date: '',
     degree: '',
     yearOfStudy: '',
     minGpa: '',
     experience: '',
     otherConditions: '',
     skills: [],
     uploadedFiles: []
   });

  // Form progress and validation states
  const [formProgress, setFormProgress] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('icm-theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  // Fetch applications when Applications tab is active
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchAllApplications();
    } else if (activeTab === 'universities') {
      fetchUniversitiesData();
    }
  }, [activeTab]);

  // Apply theme to document body
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark');
      localStorage.setItem('icm-theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('icm-theme', 'light');
    }
  }, [isDarkTheme]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [universitiesRes, opportunitiesRes, statsRes, profileRes] = await Promise.all([
        api.getIcmUniversities(),
        api.getIcmOpportunities(),
        api.getIcmStats(),
        api.getIcmProfile()
      ]);

      if (universitiesRes && Array.isArray(universitiesRes)) setUniversities(universitiesRes);
      if (opportunitiesRes && Array.isArray(opportunitiesRes)) setOpportunities(opportunitiesRes);
      if (statsRes && typeof statsRes === 'object') setStats(statsRes);
             if (profileRes && typeof profileRes === 'object') {
         setIcmProfile(profileRes);
         // Initialize form data with basic fields and nested objects
         setProfileFormData({
           name: profileRes.name || '',
           email: profileRes.email || '',
           institute_name: profileRes.institute_name || '',
           company: profileRes.company || {},
           culture: profileRes.culture || {},
           recruitment: profileRes.recruitment || {},
           highlights: profileRes.highlights || {},
           people: profileRes.people || {}
         });
       }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      setApplicationsLoading(true);
      
      // Fetch applications for all opportunities that belong to this ICM user
      const allApplications = [];
      
      // Get all opportunities first
      const opportunitiesList = opportunities || [];
      
      // Fetch applications for each opportunity
      for (const opportunity of opportunitiesList) {
        try {
          const response = await api.getIcmOpportunityApplications(opportunity.id);
          if (response && response.applications && Array.isArray(response.applications)) {
            // Add opportunity title to each application
            const applicationsWithTitle = response.applications.map(app => ({
              ...app,
              opportunity_title: opportunity.title,
              opportunity_id: opportunity.id
            }));
            allApplications.push(...applicationsWithTitle);
          }
        } catch (error) {
          console.error(`Error fetching applications for opportunity ${opportunity.id}:`, error);
          // Continue with other opportunities even if one fails
        }
      }
      
      setAllApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showNotification('Failed to load applications', 'error');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchUniversitiesData = async () => {
    try {
      setUniversitiesLoading(true);
      const universitiesData = await api.getIcmUniversities();
      
      // Process universities with individual error handling to prevent any failures
      const enrichedUniversities = [];
      
      for (const uni of universitiesData) {
        // Start with basic university data
        const enrichedUni = {
          ...uni,
          students: uni.students || 0,
          activeProjects: uni.activeProjects || 0,
          partnerships: uni.partnerships || 0,
          opportunities: 0,
          lastActivity: new Date().toISOString(),
          status: 'active'
        };

        // Try to fetch additional details (non-blocking)
        try {
          const stats = await api.getIcmUniversityDetails(uni.id);
          if (stats) {
            enrichedUni.students = stats.totalStudents || enrichedUni.students;
            enrichedUni.activeProjects = stats.activeProjects || enrichedUni.activeProjects;
            enrichedUni.partnerships = stats.partnerships || enrichedUni.partnerships;
            enrichedUni.opportunities = stats.opportunities || 0;
            enrichedUni.lastActivity = stats.lastActivity || enrichedUni.lastActivity;
            enrichedUni.status = stats.status || enrichedUni.status;
          }
        } catch (error) {
          // Silently handle errors - we already have fallback data
          if (error.message === 'Not found') {
            console.warn(`University ${uni.id} details not found, using basic data`);
          } else {
            console.error(`Error fetching details for university ${uni.id}:`, error);
          }
          // Continue with basic data - no need to do anything else
        }

        enrichedUniversities.push(enrichedUni);
      }
      
      setUniversities(enrichedUniversities);
      setFilteredUniversities(enrichedUniversities);
    } catch (error) {
      console.error('Error fetching universities:', error);
      showNotification('Failed to load universities', 'error');
    } finally {
      setUniversitiesLoading(false);
    }
  };

  // Search functionality for universities
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUniversities(universities);
    } else {
      const filtered = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUniversities(filtered);
    }
  }, [searchTerm, universities]);

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // University action handlers
  const handleViewUniversityDetails = async (university) => {
    try {
      setSelectedUniversity(university);
      setShowUniversityModal(true);
    } catch (error) {
      console.error('Error viewing university details:', error);
      showNotification('Failed to load university details', 'error');
    }
  };

  const handleViewUniversityStudents = (university) => {
    showNotification(`Viewing students for ${university.name}`, 'info');
    // TODO: Implement student viewing functionality
  };

  const handleViewUniversityPartnerships = (university) => {
    showNotification(`Viewing partnerships for ${university.name}`, 'info');
    // TODO: Implement partnership viewing functionality
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Skills management functions
  const addSkill = (skill) => {
    if (skill.trim() && !opportunityForm.skills.includes(skill.trim())) {
      setOpportunityForm({
        ...opportunityForm,
        skills: [...opportunityForm.skills, skill.trim()]
      });
    }
  };

  const removeSkill = (skillToRemove) => {
    setOpportunityForm({
      ...opportunityForm,
      skills: opportunityForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      addSkill(e.target.value);
      e.target.value = '';
    }
  };

  // File upload functions
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setOpportunityForm({
      ...opportunityForm,
      uploadedFiles: [...opportunityForm.uploadedFiles, ...files]
    });
  };

  const removeFile = (index) => {
    setOpportunityForm({
      ...opportunityForm,
      uploadedFiles: opportunityForm.uploadedFiles.filter((_, i) => i !== index)
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!opportunityForm.title.trim()) errors.title = 'Title is required';
    if (!opportunityForm.description.trim()) errors.description = 'Description is required';
    if (!opportunityForm.closing_date) errors.closing_date = 'Deadline is required';
    
    // Check if deadline is in the future
    if (opportunityForm.closing_date && new Date(opportunityForm.closing_date) <= new Date()) {
      errors.closing_date = 'Deadline must be in the future';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Progress management
  const nextStep = () => {
    if (validateForm()) {
      setFormProgress(Math.min(formProgress + 1, 3));
    }
  };

  const prevStep = () => {
    setFormProgress(Math.max(formProgress - 1, 1));
  };

  // Autosave draft
  const saveDraft = async () => {
    setIsDraftSaving(true);
    try {
      // Simulate draft saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Draft saved successfully!', 'success');
    } catch (error) {
      showNotification('Failed to save draft', 'error');
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (opportunityForm.title || opportunityForm.description) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [opportunityForm]);

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix the errors before submitting', 'error');
      return;
    }
    
    try {
      // Prepare form data with skills as comma-separated string
      const formData = {
        ...opportunityForm,
        requirements: opportunityForm.skills.join(', ') + (opportunityForm.requirements ? `, ${opportunityForm.requirements}` : '')
      };
      
      const response = await api.postOpportunity(formData);
      if (response.success) {
        setShowOpportunityModal(false);
        setFormProgress(1);
        setFormErrors({});
        setOpportunityForm({
          title: '',
          type: 'internship',
          description: '',
          requirements: '',
          stipend: '',
          duration: '',
          location: '',
          contact_email: '',
          contact_phone: '',
          closing_date: '',
          degree: '',
          yearOfStudy: '',
          minGpa: '',
          experience: '',
          otherConditions: '',
          skills: [],
          uploadedFiles: []
        });
        fetchDashboardData();
        showNotification('Opportunity posted successfully!', 'success');
        // Redirect to opportunities page
        setActiveTab('opportunities');
      }
    } catch (error) {
      console.error('Error posting opportunity:', error);
      showNotification('Failed to post opportunity. Please try again.', 'error');
    }
  };

  const handleViewApplications = async (opportunity) => {
    try {
      setSelectedOpportunity(opportunity);
      setShowApplicationsModal(true);
      
      // Fetch applications for this opportunity
      const response = await api.getIcmOpportunityApplications(opportunity.id);
      if (response.success) {
        setSelectedOpportunity({
          ...opportunity,
          applications: response.applications
        });
      } else {
        console.error('Failed to fetch applications:', response.message);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchStudentProfile = async (studentId) => {
    try {
      setLoadingStudentProfile(true);
      const profileData = await api.getIcmStudentProfile(studentId);
      if (profileData.success) {
        setStudentProfile(profileData.student);
        setShowStudentProfileModal(true);
      } else {
        console.error('Failed to fetch student profile:', profileData.message);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoadingStudentProfile(false);
    }
  };

  const handleViewStudentProfile = (studentId) => {
    fetchStudentProfile(studentId);
  };

  const handleUpdateApplicationStatus = async (applicationId, status, reviewNotes = '') => {
    try {
      const response = await api.updateIcmApplicationStatus(applicationId, status, reviewNotes);
      if (response.success) {
        showNotification(`Application ${status} successfully!`, 'success');
        // Refresh the applications data
        if (selectedOpportunity) {
          const applicationsResponse = await api.getIcmOpportunityApplications(selectedOpportunity.id);
          if (applicationsResponse.success) {
            setSelectedOpportunity({
              ...selectedOpportunity,
              applications: applicationsResponse.applications
            });
          }
        }
      } else {
        showNotification(`Failed to ${status} application: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error(`Error updating application status to ${status}:`, error);
      showNotification(`Failed to ${status} application. Please try again.`, 'error');
    }
  };

  const handleApproveApplication = async (applicationId) => {
    const reviewNotes = prompt('Add review notes (optional):');
    await handleUpdateApplicationStatus(applicationId, 'approved', reviewNotes);
    // Refresh applications data after status update
    if (activeTab === 'applications') {
      fetchAllApplications();
    }
  };

  const handleRejectApplication = async (applicationId) => {
    const reviewNotes = prompt('Add review notes (optional):');
    await handleUpdateApplicationStatus(applicationId, 'rejected', reviewNotes);
    // Refresh applications data after status update
    if (activeTab === 'applications') {
      fetchAllApplications();
    }
  };

  const handleEditOpportunity = async (opportunity) => {
    try {
      setLoadingEditOpportunity(true);
      const response = await api.getIcmOpportunity(opportunity.id);
      if (response.success) {
        setEditingOpportunity(response.opportunity);
        setOpportunityForm({
          title: response.opportunity.title,
          type: response.opportunity.type,
          description: response.opportunity.description,
          requirements: response.opportunity.requirements,
          stipend: response.opportunity.stipend,
          duration: response.opportunity.duration,
          location: response.opportunity.location,
          contact_email: response.opportunity.contact_email,
          contact_phone: response.opportunity.contact_phone,
          closing_date: response.opportunity.closing_date,
          degree: '',
          yearOfStudy: '',
          minGpa: '',
          experience: '',
          otherConditions: ''
        });
        setShowEditOpportunityModal(true);
      }
    } catch (error) {
      console.error('Failed to load opportunity for editing:', error);
    } finally {
      setLoadingEditOpportunity(false);
    }
  };

  const handleUpdateOpportunity = async (e) => {
    e.preventDefault();
    try {
      const response = await api.updateIcmOpportunity(editingOpportunity.id, opportunityForm);
      if (response.success) {
        setShowEditOpportunityModal(false);
        setEditingOpportunity(null);
        setOpportunityForm({
          title: '',
          type: 'internship',
          description: '',
          requirements: '',
          stipend: '',
          duration: '',
          location: '',
          contact_email: '',
          contact_phone: '',
          closing_date: '',
          degree: '',
          yearOfStudy: '',
          minGpa: '',
          experience: '',
          otherConditions: ''
        });
        fetchDashboardData();
        showNotification('Opportunity updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
      showNotification('Failed to update opportunity. Please try again.', 'error');
    }
  };

  const handleDeleteOpportunity = (opportunity) => {
    setDeletingOpportunity(opportunity);
    setShowDeleteModal(true);
  };

  const confirmDeleteOpportunity = async () => {
    try {
      setLoadingDelete(true);
      const response = await api.deleteOpportunity(deletingOpportunity.id);
      if (response.success) {
        setShowDeleteModal(false);
        setDeletingOpportunity(null);
        fetchDashboardData();
        showNotification('Opportunity deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      const errorMessage = error.message || 'Failed to delete opportunity. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoadingDelete(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.totalUniversities || 0}</h3>
            <p>Total Universities</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.totalOpportunities || 0}</h3>
            <p>Total Opportunities</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.totalPartnerships || 0}</h3>
            <p>Active Partnerships</p>
          </div>
        </div>
      </div>

      <div className="content-row">
        <div className="content-card">
          <h3>Recent Opportunities</h3>
          <div className="opportunities-list">
            {opportunities.slice(0, 5).map(opp => (
              <div key={opp.id} className="opportunity-item">
                <div className="opportunity-header">
                  <h4>{opp.title}</h4>
                  <span className={`opportunity-status ${opp.status}`}>
                    {opp.status}
                  </span>
                </div>
                <p>{opp.description?.substring(0, 100)}...</p>
                <div className="opportunity-meta">
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {opp.location}
                  </span>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    {opp.stipend}
                  </span>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {new Date(opp.closing_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => setShowOpportunityModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Post New Opportunity
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add University
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              New Partnership
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUniversitiesTab = () => (
    <div className="universities-tab">
      <div className="header-actions">
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search universities by name, domain, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <div className="search-stats">
            <span className="stat-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              {filteredUniversities.length} of {universities.length} Universities
            </span>
            {searchTerm && (
              <span className="search-results-info">
                {filteredUniversities.length === 0 ? 'No results found' : 
                 filteredUniversities.length === 1 ? '1 result' : 
                 `${filteredUniversities.length} results`}
              </span>
            )}
          </div>
        </div>
      </div>

      {universitiesLoading ? (
        <TrustTeamsLoader 
          isLoading={true}
          message="Loading universities..."
          showProgress={false}
          size="small"
        />
      ) : filteredUniversities.length === 0 ? (
        <div className="no-data-container">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3>No Universities Found</h3>
          <p>{searchTerm ? 'Try adjusting your search criteria' : 'No universities are currently registered'}</p>
        </div>
      ) : (
        <div className="universities-grid">
          {filteredUniversities.map(uni => (
            <div key={uni.id} className="university-card">
              <div className="university-header">
                <div className="university-logo">
                  {uni.name.charAt(0).toUpperCase()}
                </div>
                <div className="university-info">
                  <h3>{uni.name}</h3>
                  <p className="university-domain">{uni.domain}</p>
                  <p className="university-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {uni.location}
                  </p>
                  <div className="university-status">
                    <span className={`status-indicator ${uni.status}`}>
                      {uni.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="last-activity">
                      Last activity: {new Date(uni.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="university-stats">
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  <span className="stat-number">{uni.students || 0}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span className="stat-number">{uni.activeProjects || 0}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span className="stat-number">{uni.partnerships || 0}</span>
                  <span className="stat-label">Partnerships</span>
                </div>
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                  </svg>
                  <span className="stat-number">{uni.opportunities || 0}</span>
                  <span className="stat-label">Opportunities</span>
                </div>
              </div>
              
              <div className="university-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => handleViewUniversityDetails(uni)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  View Details
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleViewUniversityStudents(uni)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  Students
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleViewUniversityPartnerships(uni)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Partnerships
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOpportunitiesTab = () => (
    <div className="opportunities-tab">
      <div className="section-header">
        <h2>Manage Opportunities</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowOpportunityModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Post Opportunity
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="no-opportunities">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3>No Opportunities Posted</h3>
          <p>Start by posting your first opportunity to connect with talented students.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowOpportunityModal(true)}
          >
            Post Your First Opportunity
          </button>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map(opp => (
            <div key={opp.id} className="opportunity-card">
              <div className="opportunity-header">
                <h3>{opp.title}</h3>
                <span className={`opportunity-status ${opp.status}`}>
                  {opp.status}
                </span>
              </div>
              
              <div className="opportunity-details">
                <p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                  </svg>
                  <strong>Type:</strong> {opp.type}
                </p>
                <p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <strong>Location:</strong> {opp.location}
                </p>
                <p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                  <strong>Stipend:</strong> {opp.stipend}
                </p>
                <p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <strong>Duration:</strong> {opp.duration}
                </p>
                <p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                  <strong>Applications:</strong> {opp.application_count || 0}
                </p>
                <p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <strong>Closing:</strong> {new Date(opp.closing_date).toLocaleDateString()}
                </p>
              </div>
              
                             <div className="opportunity-actions">
                 <div className="primary-actions">
                   <button className="btn btn-outline btn-view">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                     </svg>
                     View Details
                   </button>
                   <button 
                     className="btn btn-outline btn-edit"
                     onClick={() => handleEditOpportunity(opp)}
                     disabled={loadingEditOpportunity}
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                     </svg>
                     {loadingEditOpportunity ? 'Loading...' : 'Edit'}
                   </button>
                 </div>
                 <div className="danger-actions">
                   <button 
                     className="btn btn-danger btn-delete"
                     onClick={() => handleDeleteOpportunity(opp)}
                     disabled={loadingDelete}
                     title={loadingDelete ? 'Deleting...' : 'Delete Opportunity'}
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                     </svg>
                     <span className="btn-text">{loadingDelete ? 'Deleting...' : 'Delete'}</span>
                   </button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="profile-tab">
      <div className="icm-profile-container">
        {/* Company Header Section */}
        <div className="company-header-section">
          <div className="company-header">
            <div className="company-logo-section">
              <div className="company-logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div className="company-basic-info">
                <h2>{icmProfile?.company?.name || 'Company Name'}</h2>
                <p className="company-industry">{icmProfile?.company?.industryType || 'Industry'}</p>
                <p className="company-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {icmProfile?.company?.headquartersLocation || 'Location'}
                </p>
                <div className="company-status">
                  <span className="company-size">{icmProfile?.company?.size || 'Company Size'}</span>
                </div>
              </div>
            </div>
            <div className="company-actions">
              {editingProfile ? (
                <>
                  <button className="btn btn-outline" onClick={handleCancelEdit}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={profileLoading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                    </svg>
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={handleEditProfile}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit Profile
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowOpportunityModal(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Post Opportunity
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="profile-tabs">
          <button className={`tab-btn ${activeProfileTab === 'company' ? 'active' : ''}`} onClick={() => setActiveProfileTab('company')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Company Info
          </button>
          <button className={`tab-btn ${activeProfileTab === 'culture' ? 'active' : ''}`} onClick={() => setActiveProfileTab('culture')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Culture & Values
          </button>
          <button className={`tab-btn ${activeProfileTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveProfileTab('recruitment')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
            Recruitment
          </button>
          <button className={`tab-btn ${activeProfileTab === 'highlights' ? 'active' : ''}`} onClick={() => setActiveProfileTab('highlights')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            Highlights
          </button>
          <button className={`tab-btn ${activeProfileTab === 'people' ? 'active' : ''}`} onClick={() => setActiveProfileTab('people')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            People
          </button>
        </div>

                 {/* Tab Content */}
         <div className="profile-tab-content">
           {/* Basic User Information Section - Always visible */}
           <div className="basic-info-section">
             <h3><i className="fas fa-user"></i> Basic Information</h3>
             <div className="info-grid">
               <div className="info-item">
                 <label>Name *</label>
                 {editingProfile ? (
                   <input
                     type="text"
                     value={profileFormData.name || icmProfile?.name || ''}
                     onChange={(e) => setProfileFormData({
                       ...profileFormData,
                       name: e.target.value
                     })}
                     placeholder="Enter your name"
                     style={{ color: '#333', background: '#fff' }}
                   />
                 ) : (
                   <span>{icmProfile?.name || 'Not specified'}</span>
                 )}
               </div>
               <div className="info-item">
                 <label>Email *</label>
                 {editingProfile ? (
                   <input
                     type="email"
                     value={profileFormData.email || icmProfile?.email || ''}
                     onChange={(e) => setProfileFormData({
                       ...profileFormData,
                       email: e.target.value
                     })}
                     placeholder="Enter your email"
                     style={{ color: '#333', background: '#fff' }}
                   />
                 ) : (
                   <span>{icmProfile?.email || 'Not specified'}</span>
                 )}
               </div>
               <div className="info-item">
                 <label>Institute Name</label>
                 {editingProfile ? (
                   <input
                     type="text"
                     value={profileFormData.institute_name || icmProfile?.institute_name || ''}
                     onChange={(e) => setProfileFormData({
                       ...profileFormData,
                       institute_name: e.target.value
                     })}
                     placeholder="Enter institute name"
                     style={{ color: '#333', background: '#fff' }}
                   />
                 ) : (
                   <span>{icmProfile?.institute_name || 'Not specified'}</span>
                 )}
               </div>
             </div>
           </div>
           
           {activeProfileTab === 'company' && (
           <>
             {renderCompanyInfoTab()}
           </>
         )}
           {activeProfileTab === 'culture' && renderCultureTab()}
           {activeProfileTab === 'recruitment' && renderRecruitmentTab()}
           {activeProfileTab === 'highlights' && renderHighlightsTab()}
           {activeProfileTab === 'people' && renderPeopleTab()}
         </div>
      </div>
    </div>
  );

  // Profile Tab Content Functions

  const renderCompanyInfoTab = () => (
    <div className="company-info-content">
      <div className="info-grid">
        {/* Basic Company Information */}
        <div className="info-section">
          <h3><i className="fas fa-building"></i> Basic Company Information</h3>
          <div className="info-items">
            <div className="info-item">
              <label>Company Name</label>
              {editingProfile ? (
                <input
                  key="company-name-input"
                  type="text"
                  value={profileFormData?.company?.name || ''}
                  onChange={(e) => handleProfileFormChange('company', 'name', e.target.value)}
                  placeholder="Enter company name"
                  style={{ color: '#333', background: '#fff' }}
                />
              ) : (
                <span>{icmProfile?.company?.name || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Industry Type</label>
              {editingProfile ? (
                <input
                  key="industry-type-input"
                  type="text"
                  value={profileFormData?.company?.industryType || ''}
                  onChange={(e) => handleProfileFormChange('company', 'industryType', e.target.value)}
                  placeholder="Enter industry type"
                  style={{ color: '#333', background: '#fff' }}
                />
              ) : (
                <span>{icmProfile?.company?.industryType || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Year Established</label>
              {editingProfile ? (
                <input
                  type="number"
                  value={profileFormData?.company?.yearEstablished || ''}
                  onChange={(e) => handleProfileFormChange('company', 'yearEstablished', e.target.value)}
                  placeholder="Enter year"
                />
              ) : (
                <span>{icmProfile?.company?.yearEstablished || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Headquarters</label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileFormData?.company?.headquartersLocation || ''}
                  onChange={(e) => handleProfileFormChange('company', 'headquartersLocation', e.target.value)}
                  placeholder="Enter headquarters location"
                />
              ) : (
                <span>{icmProfile?.company?.headquartersLocation || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item full-width">
              <label>About Company</label>
              {editingProfile ? (
                <textarea
                  value={profileFormData?.company?.overview || ''}
                  onChange={(e) => handleProfileFormChange('company', 'overview', e.target.value)}
                  placeholder="Enter company overview"
                  rows="4"
                />
              ) : (
                <p>{icmProfile?.company?.overview || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="info-section">
          <h3><i className="fas fa-address-book"></i> Contact Information</h3>
          <div className="info-items">
            <div className="info-item">
              <label>Website</label>
              {editingProfile ? (
                <input
                  type="url"
                  value={profileFormData?.company?.websiteUrl || ''}
                  onChange={(e) => handleProfileFormChange('company', 'websiteUrl', e.target.value)}
                  placeholder="Enter website URL"
                />
              ) : (
                icmProfile?.company?.websiteUrl ? (
                  <a href={icmProfile.company.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {icmProfile.company.websiteUrl}
                  </a>
                ) : (
                  <span>Not specified</span>
                )
              )}
            </div>
            <div className="info-item">
              <label>Email</label>
              {editingProfile ? (
                <input
                  type="email"
                  value={profileFormData?.company?.contactEmail || ''}
                  onChange={(e) => handleProfileFormChange('company', 'contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                />
              ) : (
                icmProfile?.company?.contactEmail ? (
                  <a href={`mailto:${icmProfile.company.contactEmail}`}>{icmProfile.company.contactEmail}</a>
                ) : (
                  <span>Not specified</span>
                )
              )}
            </div>
            <div className="info-item">
              <label>Phone</label>
              {editingProfile ? (
                <input
                  type="tel"
                  value={profileFormData?.company?.contactPhone || ''}
                  onChange={(e) => handleProfileFormChange('company', 'contactPhone', e.target.value)}
                  placeholder="Enter contact phone"
                />
              ) : (
                <span>{icmProfile?.company?.contactPhone || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Address</label>
              {editingProfile ? (
                <textarea
                  value={profileFormData?.company?.officeAddress || ''}
                  onChange={(e) => handleProfileFormChange('company', 'officeAddress', e.target.value)}
                  placeholder="Enter office address"
                  rows="3"
                />
              ) : (
                <span>{icmProfile?.company?.officeAddress || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Social Media</label>
              {editingProfile ? (
                <div className="social-inputs">
                  <input
                    type="url"
                    value={profileFormData?.company?.socialMedia?.linkedin || ''}
                    onChange={(e) => handleProfileFormChangeNested('company', 'socialMedia', 'linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="url"
                    value={profileFormData?.company?.socialMedia?.twitter || ''}
                    onChange={(e) => handleProfileFormChangeNested('company', 'socialMedia', 'twitter', e.target.value)}
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    value={profileFormData?.company?.socialMedia?.instagram || ''}
                    onChange={(e) => handleProfileFormChangeNested('company', 'socialMedia', 'instagram', e.target.value)}
                    placeholder="Instagram URL"
                  />
                </div>
              ) : (
                <div className="social-links">
                  {icmProfile?.company?.socialMedia?.linkedin && (
                    <a href={icmProfile.company.socialMedia.linkedin} className="social-link linkedin" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin"></i> LinkedIn
                    </a>
                  )}
                  {icmProfile?.company?.socialMedia?.twitter && (
                    <a href={icmProfile.company.socialMedia.twitter} className="social-link twitter" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-twitter"></i> Twitter
                    </a>
                  )}
                  {icmProfile?.company?.socialMedia?.instagram && (
                    <a href={icmProfile.company.socialMedia.instagram} className="social-link instagram" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-instagram"></i> Instagram
                    </a>
                  )}
                  {!icmProfile?.company?.socialMedia?.linkedin && !icmProfile?.company?.socialMedia?.twitter && !icmProfile?.company?.socialMedia?.instagram && (
                    <span>No social media links</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Operations */}
        <div className="info-section">
          <h3><i className="fas fa-cogs"></i> Company Operations</h3>
          <div className="info-items">
            <div className="info-item">
              <label>Company Size</label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileFormData?.company?.size || ''}
                  onChange={(e) => handleProfileFormChange('company', 'size', e.target.value)}
                  placeholder="e.g., 51-200 employees"
                />
              ) : (
                <span>{icmProfile?.company?.size || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Branches</label>
              {editingProfile ? (
                <textarea
                  value={profileFormData?.company?.branchesLocations || ''}
                  onChange={(e) => handleProfileFormChange('company', 'branchesLocations', e.target.value)}
                  placeholder="Enter branches and locations"
                  rows="3"
                />
              ) : (
                <span>{icmProfile?.company?.branchesLocations || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Key Clients</label>
              {editingProfile ? (
                <textarea
                  value={profileFormData?.company?.keyClientsPartners || ''}
                  onChange={(e) => handleProfileFormChange('company', 'keyClientsPartners', e.target.value)}
                  placeholder="Enter key clients and partners"
                  rows="3"
                />
              ) : (
                <span>{icmProfile?.company?.keyClientsPartners || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Services</label>
              {editingProfile ? (
                <textarea
                  value={profileFormData?.company?.servicesProducts || ''}
                  onChange={(e) => handleProfileFormChange('company', 'servicesProducts', e.target.value)}
                  placeholder="Enter services and products"
                  rows="3"
                />
              ) : (
                <span>{icmProfile?.company?.servicesProducts || 'Not specified'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Certifications</label>
              {editingProfile ? (
                <textarea
                  value={profileFormData?.company?.certificationsAccreditations || ''}
                  onChange={(e) => handleProfileFormChange('company', 'certificationsAccreditations', e.target.value)}
                  placeholder="Enter certifications and accreditations"
                  rows="3"
                />
              ) : (
                <span>{icmProfile?.company?.certificationsAccreditations || 'Not specified'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCultureTab = () => (
    <div className="culture-content">
      <div className="culture-grid">
        {/* Mission & Vision */}
        <div className="culture-section">
          <h3><i className="fas fa-bullseye"></i> Mission & Vision</h3>
          <div className="mission-vision">
            <div className="mission-card">
              <h4>Mission</h4>
              <p>To empower businesses with innovative technology solutions that drive growth and create lasting impact in the digital world.</p>
            </div>
            <div className="vision-card">
              <h4>Vision</h4>
              <p>To be the leading technology partner for enterprises seeking digital transformation and sustainable innovation.</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="culture-section">
          <h3><i className="fas fa-star"></i> Core Values</h3>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h4>Innovation</h4>
              <p>Constantly pushing boundaries and exploring new technologies</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4>Collaboration</h4>
              <p>Working together to achieve exceptional results</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Integrity</h4>
              <p>Maintaining the highest ethical standards in all we do</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h4>Excellence</h4>
              <p>Striving for the best in every project and interaction</p>
            </div>
          </div>
        </div>

        {/* Diversity & Inclusion */}
        <div className="culture-section">
          <h3><i className="fas fa-globe"></i> Diversity & Inclusion</h3>
          <div className="diversity-content">
            <p>We believe in creating an inclusive workplace where diverse perspectives drive innovation. Our commitment to diversity extends across all aspects of our organization.</p>
            <div className="diversity-stats">
              <div className="diversity-stat">
                <span className="stat-number">45%</span>
                <span className="stat-label">Women in Leadership</span>
              </div>
              <div className="diversity-stat">
                <span className="stat-number">30+</span>
                <span className="stat-label">Countries Represented</span>
              </div>
              <div className="diversity-stat">
                <span className="stat-number">15+</span>
                <span className="stat-label">Languages Spoken</span>
              </div>
            </div>
          </div>
        </div>

        {/* CSR Initiatives */}
        <div className="culture-section">
          <h3><i className="fas fa-heart"></i> Corporate Social Responsibility</h3>
          <div className="csr-initiatives">
            <div className="csr-item">
              <h4>Environmental Sustainability</h4>
              <p>Carbon-neutral operations and green technology initiatives</p>
            </div>
            <div className="csr-item">
              <h4>Community Outreach</h4>
              <p>Volunteer programs and educational partnerships</p>
            </div>
            <div className="csr-item">
              <h4>Digital Literacy</h4>
              <p>Free coding workshops for underprivileged youth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecruitmentTab = () => (
    <div className="recruitment-content">
      <div className="recruitment-grid">
        {/* Hiring Status */}
        <div className="recruitment-section">
          <h3><i className="fas fa-user-plus"></i> Hiring Status</h3>
          <div className="hiring-status">
            <p>We are currently seeking talented individuals to join our growing team across various departments.</p>
          </div>
        </div>

        {/* Opportunity Types */}
        <div className="recruitment-section">
          <h3><i className="fas fa-briefcase"></i> Types of Opportunities</h3>
          <div className="opportunity-types">
            <div className="opportunity-type">
              <div className="type-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h4>Internships</h4>
              <p>Paid internships for students and recent graduates</p>
            </div>
            <div className="opportunity-type">
              <div className="type-icon">
                <i className="fas fa-user-tie"></i>
              </div>
              <h4>Full-time Jobs</h4>
              <p>Permanent positions for experienced professionals</p>
            </div>
            <div className="opportunity-type">
              <div className="type-icon">
                <i className="fas fa-project-diagram"></i>
              </div>
              <h4>Projects</h4>
              <p>Contract-based project work and consulting</p>
            </div>
            <div className="opportunity-type">
              <div className="type-icon">
                <i className="fas fa-microscope"></i>
              </div>
              <h4>Research Collaboration</h4>
              <p>Academic partnerships and research initiatives</p>
            </div>
          </div>
        </div>

        {/* Application Process */}
        <div className="recruitment-section">
          <h3><i className="fas fa-route"></i> Application Process</h3>
          <div className="application-process">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Resume Submission</h4>
                <p>Submit your resume and cover letter through our platform</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Initial Screening</h4>
                <p>HR team reviews applications and shortlists candidates</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Technical Interview</h4>
                <p>Technical assessment and coding challenges</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Final Interview</h4>
                <p>Team fit and culture alignment discussion</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4>Offer</h4>
                <p>Job offer and onboarding process</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Benefits */}
        <div className="recruitment-section">
          <h3><i className="fas fa-gift"></i> Employee Benefits & Perks</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h4>Health Insurance</h4>
              <p>Comprehensive health, dental, and vision coverage</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-home"></i>
              </div>
              <h4>Remote Work</h4>
              <p>Flexible work arrangements and remote options</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h4>Learning & Development</h4>
              <p>Training programs and conference attendance</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-coffee"></i>
              </div>
              <h4>Office Perks</h4>
              <p>Free meals, snacks, and recreational activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHighlightsTab = () => (
    <div className="highlights-content">
      <div className="highlights-grid">
        {/* Recent Achievements */}
        <div className="highlights-section">
          <h3><i className="fas fa-trophy"></i> Recent Achievements & Awards</h3>
          <div className="achievements-list">
            <div className="achievement-item">
              <div className="achievement-icon">
                <i className="fas fa-award"></i>
              </div>
              <div className="achievement-content">
                <h4>Best Tech Company 2023</h4>
                <p>Awarded by Tech Industry Association</p>
                <span className="achievement-date">December 2023</span>
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-icon">
                <i className="fas fa-medal"></i>
              </div>
              <div className="achievement-content">
                <h4>Innovation Excellence Award</h4>
                <p>Recognized for breakthrough AI solutions</p>
                <span className="achievement-date">November 2023</span>
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="achievement-content">
                <h4>Great Place to Work</h4>
                <p>Certified as an excellent workplace</p>
                <span className="achievement-date">October 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="highlights-section">
          <h3><i className="fas fa-chart-line"></i> Success Stories</h3>
          <div className="success-stories">
            <div className="story-item">
              <h4>Digital Transformation Success</h4>
              <p>Helped a Fortune 500 company reduce operational costs by 40% through our cloud migration solution.</p>
              <div className="story-metrics">
                <span className="metric">40% Cost Reduction</span>
                <span className="metric">6 Months Implementation</span>
              </div>
            </div>
            <div className="story-item">
              <h4>AI-Powered Analytics</h4>
              <p>Developed an AI system that improved customer satisfaction scores by 60% for a retail client.</p>
              <div className="story-metrics">
                <span className="metric">60% Improvement</span>
                <span className="metric">3 Months Development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Press Mentions */}
        <div className="highlights-section">
          <h3><i className="fas fa-newspaper"></i> Press Mentions</h3>
          <div className="press-mentions">
            <div className="mention-item">
              <div className="mention-source">TechCrunch</div>
              <h4>"TechCorp Solutions Revolutionizes Enterprise Software"</h4>
              <p>Featured in leading technology publication for innovative approach to enterprise solutions.</p>
              <span className="mention-date">January 2024</span>
            </div>
            <div className="mention-item">
              <div className="mention-source">Forbes</div>
              <h4>"The Future of Work: TechCorp's Remote-First Approach"</h4>
              <p>Highlighted for pioneering remote work policies and digital collaboration tools.</p>
              <span className="mention-date">December 2023</span>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="highlights-section">
          <h3><i className="fas fa-images"></i> Photo Gallery</h3>
          <div className="photo-gallery">
            <div className="gallery-item">
              <div className="gallery-placeholder">
                <i className="fas fa-image"></i>
                <span>Office Culture</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">
                <i className="fas fa-image"></i>
                <span>Team Events</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">
                <i className="fas fa-image"></i>
                <span>Workplace</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">
                <i className="fas fa-image"></i>
                <span>Award Ceremony</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPeopleTab = () => (
    <div className="people-content">
      <div className="people-grid">
        {/* Leadership */}
        <div className="people-section">
          <h3><i className="fas fa-crown"></i> Leadership Team</h3>
          <div className="leadership-grid">
            <div className="leader-card">
              <div className="leader-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="leader-info">
                <h4>Sarah Johnson</h4>
                <p className="leader-title">CEO & Founder</p>
                <p className="leader-bio">15+ years in technology leadership</p>
              </div>
            </div>
            <div className="leader-card">
              <div className="leader-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="leader-info">
                <h4>Michael Chen</h4>
                <p className="leader-title">CTO</p>
                <p className="leader-bio">Expert in AI and cloud architecture</p>
              </div>
            </div>
            <div className="leader-card">
              <div className="leader-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="leader-info">
                <h4>Emily Rodriguez</h4>
                <p className="leader-title">Head of HR</p>
                <p className="leader-bio">Specialist in talent acquisition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employees on Platform */}
        <div className="people-section">
          <h3><i className="fas fa-users"></i> Employees on Platform</h3>
          <div className="employees-stats">
            <div className="employee-stat">
              <span className="stat-number">45</span>
              <span className="stat-label">Active Mentors</span>
            </div>
            <div className="employee-stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Alumni Hired</span>
            </div>
            <div className="employee-stat">
              <span className="stat-number">8</span>
              <span className="stat-label">Guest Lecturers</span>
            </div>
          </div>
          <div className="employees-list">
            <div className="employee-item">
              <div className="employee-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="employee-info">
                <h4>David Kim</h4>
                <p>Senior Software Engineer • Mentor</p>
              </div>
            </div>
            <div className="employee-item">
              <div className="employee-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="employee-info">
                <h4>Lisa Wang</h4>
                <p>Product Manager • Guest Lecturer</p>
              </div>
            </div>
            <div className="employee-item">
              <div className="employee-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="employee-info">
                <h4>Alex Thompson</h4>
                <p>Data Scientist • Alumni</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplicationsTab = () => {
    // Group applications by opportunity
    const applicationsByOpportunity = {};
    
    // Use real data from API
    const applicationsData = allApplications || [];

    // Group applications by opportunity
    applicationsData.forEach(app => {
      const opportunityId = app.opportunity_id || app.opportunityId;
      const opportunityTitle = app.opportunity_title || app.opportunityTitle || 'Unknown Opportunity';
      
      if (!applicationsByOpportunity[opportunityId]) {
        applicationsByOpportunity[opportunityId] = {
          opportunity_title: opportunityTitle,
          applications: []
        };
      }
      applicationsByOpportunity[opportunityId].applications.push(app);
    });

    return (
      <div className="applications-tab">
        <div className="tab-header">
          <h2>All Applications</h2>
          <p>Manage applications organized by opportunity</p>
        </div>

        {applicationsLoading ? (
          <TrustTeamsLoader 
            isLoading={true}
            message="Loading applications..."
            showProgress={false}
            size="small"
          />
        ) : Object.keys(applicationsByOpportunity).length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <h3>No Applications Yet</h3>
            <p>Applications will appear here once students start applying to your opportunities.</p>
          </div>
        ) : (
          <div className="applications-by-opportunity">
            {Object.entries(applicationsByOpportunity).map(([opportunityId, data]) => (
              <div key={opportunityId} className="opportunity-applications-group">
                <div className="opportunity-header">
                  <h3>{data.opportunity_title}</h3>
                  <span className="application-count">{data.applications.length} application{data.applications.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="applications-list">
                  {data.applications.map((app) => {
                    const studentName = app.student_name || app.studentName || app.name || 'Unknown Student';
                    const studentEmail = app.student_email || app.studentEmail || app.email || 'No email provided';
                    const applicationDate = app.application_date || app.applicationDate || app.created_at || app.createdAt || new Date().toISOString();
                    const coverLetter = app.cover_letter || app.coverLetter || app.message || 'No cover letter provided';
                    const applicationStatus = app.status || 'pending';
                    const applicationId = app.id || app.application_id || app.applicationId;
                    
                    return (
                      <div key={applicationId} className="application-card">
                        <div className="application-header">
                          <div className="student-info">
                            <h4>{studentName}</h4>
                            <p>{studentEmail}</p>
                            <p className="application-date">Applied: {new Date(applicationDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`status-badge ${applicationStatus}`}>
                            {applicationStatus}
                          </span>
                        </div>
                        
                        <div className="application-details">
                          <div className="cover-letter-preview">
                            <strong>Cover Letter:</strong>
                            <p>{coverLetter}</p>
                          </div>
                        </div>
                        
                        <div className="application-actions">
                          {applicationStatus === 'pending' ? (
                            <>
                              <button 
                                className="btn btn-success"
                                onClick={() => handleApproveApplication(applicationId)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                                Approve
                              </button>
                              <button 
                                className="btn btn-danger"
                                onClick={() => handleRejectApplication(applicationId)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={`status-badge ${applicationStatus}`}>
                              {applicationStatus === 'approved' ? (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                    <polyline points="20,6 9,17 4,12"/>
                                  </svg>
                                  Approved
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                  Rejected
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'universities':
        return renderUniversitiesTab();
      case 'opportunities':
        return renderOpportunitiesTab();
      case 'applications':
        return renderApplicationsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderOverviewTab();
    }
  };

  // Profile editing functions
  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditingProfile(false);
    // Reset form data to original profile data
    setProfileFormData({
      name: icmProfile?.name || '',
      email: icmProfile?.email || '',
      institute_name: icmProfile?.institute_name || '',
      company: icmProfile?.company || {},
      culture: icmProfile?.culture || {},
      recruitment: icmProfile?.recruitment || {},
      highlights: icmProfile?.highlights || {},
      people: icmProfile?.people || {}
    });
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      
      // Send the complete profile data including all nested objects
      const updateData = {
        name: profileFormData.name || icmProfile?.name || '',
        email: profileFormData.email || icmProfile?.email || '',
        institute_name: profileFormData.institute_name || icmProfile?.institute_name || '',
        company: profileFormData.company || icmProfile?.company || {},
        culture: profileFormData.culture || icmProfile?.culture || {},
        recruitment: profileFormData.recruitment || icmProfile?.recruitment || {},
        highlights: profileFormData.highlights || icmProfile?.highlights || {},
        people: profileFormData.people || icmProfile?.people || {}
      };
      
      console.log('Sending complete profile update data:', updateData);
      console.log('Current profileFormData:', profileFormData);
      console.log('Current icmProfile:', icmProfile);
      
      // Validate that we have the required fields
      if (!updateData.name || !updateData.email) {
        showNotification('Name and email are required fields', 'error');
        setProfileLoading(false);
        return;
      }
      
      const response = await api.updateIcmProfile(updateData);
      console.log('Profile update response:', response);
      
      if (response && response.message) {
        // Update the local profile with the new data
        const updatedProfile = {
          ...icmProfile,
          ...updateData
        };
        setIcmProfile(updatedProfile);
        setEditingProfile(false);
        showNotification('Profile updated successfully');
      } else {
        showNotification('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileFormChange = (section, field, value) => {
    console.log('Profile form change:', section, field, value);
    setProfileFormData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
      console.log('New profile form data:', newData);
      return newData;
    });
  };

  const handleProfileFormChangeNested = (section, subsection, field, value) => {
    console.log('Profile form nested change:', section, subsection, field, value);
    setProfileFormData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section]?.[subsection],
            [field]: value
          }
        }
      };
      console.log('New nested profile form data:', newData);
      return newData;
    });
  };

  return (
    <div className={`icm-dashboard ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* TrustTeams Loading Bar */}
      <TrustTeamsLoader 
        isLoading={loading}
        message="Loading dashboard..."
        showProgress={false}
        size="medium"
      />
      
      {/* Mobile Menu Toggle */}
      <button className="nav-toggle" onClick={handleMobileMenuToggle}>
        ☰
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
            href="#overview"
            className={`nav-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg className="nav-menu-item-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span className="nav-menu-item-text">Dashboard</span>
          </a>

          <a 
            href="#opportunities"
            className={`nav-menu-item ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            <svg className="nav-menu-item-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="nav-menu-item-text">Opportunities</span>
          </a>

          <a 
            href="#universities"
            className={`nav-menu-item ${activeTab === 'universities' ? 'active' : ''}`}
            onClick={() => setActiveTab('universities')}
          >
            <svg className="nav-menu-item-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
            <span className="nav-menu-item-text">Universities</span>
          </a>

          <a 
            href="#applications"
            className={`nav-menu-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <svg className="nav-menu-item-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <span className="nav-menu-item-text">Applications</span>
            <span className="nav-menu-item-badge">1</span>
          </a>

          <a 
            href="#profile"
            className={`nav-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg className="nav-menu-item-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span className="nav-menu-item-text">Profile</span>
          </a>
        </div>

        {/* Bottom Section */}
        <div className="nav-bottom">
          {/* Logout Button */}
          <button className="nav-logout" onClick={handleLogout}>
            <svg className="nav-logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
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
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>ICM Dashboard</h1>
            <p>Industry Collaboration Manager</p>
          </div>
          <div className="header-icons">
            {/* Theme Toggle */}
            <div className="header-theme-toggle" onClick={handleThemeToggle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isDarkTheme ? (
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                ) : (
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                )}
              </svg>
              <span className="text">{isDarkTheme ? 'Light' : 'Dark'}</span>
            </div>
          </div>
        </div>
        {renderTabContent()}
      </main>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="notification-close">
            ×
          </button>
        </div>
      )}

             {/* Opportunity Modal */}
       {showOpportunityModal && (
         <div className="modal-overlay" onClick={() => setShowOpportunityModal(false)}>
           <div className="opportunity-form-modal" onClick={e => e.stopPropagation()}>
             {/* Header Section */}
             <div className="modal-header">
               <button 
                 className="back-btn"
                 onClick={() => setShowOpportunityModal(false)}
               >
                 <span className="back-icon">←</span>
                 Back
               </button>
               <div className="header-content">
                 <h2>Post an Opportunity</h2>
                 <p>Share a job, internship, or project with students.</p>
               </div>
               <button 
                 className="close-modal-btn"
                 onClick={() => setShowOpportunityModal(false)}
               >
                 ×
               </button>
             </div>
             
             <form className="opportunity-form" onSubmit={handlePostOpportunity}>
               {/* Progress Indicator */}
               <div className="progress-indicator">
                 <div className="progress-steps">
                   <div className={`progress-step ${formProgress >= 1 ? 'active' : ''} ${formProgress > 1 ? 'completed' : ''}`}>
                     <span className="step-number">1</span>
                     <span className="step-label">Details</span>
                   </div>
                   <div className={`progress-step ${formProgress >= 2 ? 'active' : ''} ${formProgress > 2 ? 'completed' : ''}`}>
                     <span className="step-number">2</span>
                     <span className="step-label">Criteria</span>
                   </div>
                   <div className={`progress-step ${formProgress >= 3 ? 'active' : ''}`}>
                     <span className="step-number">3</span>
                     <span className="step-label">Review</span>
                   </div>
                 </div>
                 <div className="progress-bar">
                   <div className="progress-fill" style={{ width: `${(formProgress / 3) * 100}%` }}></div>
                 </div>
               </div>

               {/* Opportunity Type Selector */}
               <div className="type-selector">
                 <div className="type-tabs">
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'job' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'job'})}
                   >
                     <span className="type-icon">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                         <line x1="8" y1="21" x2="16" y2="21"/>
                         <line x1="12" y1="17" x2="12" y2="21"/>
                       </svg>
                     </span>
                     Job
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'internship' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'internship'})}
                   >
                     <svg className="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                     </svg>
                     Internship
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'project' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'project'})}
                   >
                     <span className="type-icon">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                         <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                         <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                         <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                       </svg>
                     </span>
                     Project
                   </button>
                 </div>
               </div>
               
               {/* Form Layout */}
               <div className="form-layout">
                 {/* Left Column - Opportunity Info */}
                 <div className="form-column">
                   <div className="form-section">
                     <h3>Opportunity Details</h3>
                     
                     <div className="form-group">
                       <label>Opportunity Title *</label>
                       <input
                         type="text"
                         placeholder="e.g., Frontend Developer Internship"
                         value={opportunityForm.title}
                         onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                         required
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Description *</label>
                       <textarea
                         placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                         value={opportunityForm.description}
                         onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                         required
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Skills Required</label>
                       <input
                         type="text"
                         placeholder="e.g., React, Node.js, SQL (separate with commas)"
                         value={opportunityForm.requirements}
                         onChange={(e) => setOpportunityForm({...opportunityForm, requirements: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-row">
                       <div className="form-group">
                         <label>Location</label>
                         <select
                           value={opportunityForm.location}
                           onChange={(e) => setOpportunityForm({...opportunityForm, location: e.target.value})}
                         >
                           <option value="">Select location type</option>
                           <option value="Remote">Remote</option>
                           <option value="On-site">On-site</option>
                           <option value="Hybrid">Hybrid</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label>Duration</label>
                         <input
                           type="text"
                           placeholder="e.g., 6 months, Full-time"
                           value={opportunityForm.duration}
                           onChange={(e) => setOpportunityForm({...opportunityForm, duration: e.target.value})}
                         />
                       </div>
                     </div>
                     
                     <div className="form-group">
                       <label>Stipend/Salary</label>
                       <div className="salary-input">
                         <span className="currency">₹</span>
                         <input
                           type="text"
                           placeholder="e.g., 25,000 per month"
                           value={opportunityForm.stipend}
                           onChange={(e) => setOpportunityForm({...opportunityForm, stipend: e.target.value})}
                         />
                       </div>
                     </div>
                     
                     <div className="form-group">
                       <label>Deadline to Apply *</label>
                       <input
                         type="date"
                         value={opportunityForm.closing_date}
                         onChange={(e) => setOpportunityForm({...opportunityForm, closing_date: e.target.value})}
                         required
                       />
                     </div>
                   </div>
                 </div>
                 
                 {/* Right Column - Eligibility Criteria */}
                 <div className="form-column">
                   <div className="form-section">
                     <h3>Eligibility Criteria</h3>
                     
                     <div className="form-group">
                       <label>Degree/Course</label>
                       <input
                         type="text"
                         placeholder="e.g., B.Tech, MBA, MCA"
                         value={opportunityForm.degree || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, degree: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Year of Study</label>
                       <select
                         value={opportunityForm.yearOfStudy || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, yearOfStudy: e.target.value})}
                       >
                         <option value="">Any year</option>
                         <option value="1st Year">1st Year</option>
                         <option value="2nd Year">2nd Year</option>
                         <option value="3rd Year">3rd Year</option>
                         <option value="Final Year">Final Year</option>
                       </select>
                     </div>
                     
                     <div className="form-group">
                       <label>Minimum CGPA/Percentage</label>
                       <input
                         type="number"
                         placeholder="e.g., 7.5"
                         min="0"
                         max="10"
                         step="0.1"
                         value={opportunityForm.minGpa || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, minGpa: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Experience Required</label>
                       <input
                         type="text"
                         placeholder="e.g., 1-2 years or None"
                         value={opportunityForm.experience || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, experience: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Other Conditions</label>
                       <textarea
                         placeholder="Any additional requirements or conditions..."
                         value={opportunityForm.otherConditions || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, otherConditions: e.target.value})}
                       />
                     </div>
                   </div>
                   
                   <div className="form-section">
                     <h3>Contact Information</h3>
                     
                     <div className="form-group">
                       <label>Contact Email</label>
                       <input
                         type="email"
                         placeholder="your-email@company.com"
                         value={opportunityForm.contact_email}
                         onChange={(e) => setOpportunityForm({...opportunityForm, contact_email: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Contact Phone</label>
                       <input
                         type="text"
                         placeholder="+91 98765 43210"
                         value={opportunityForm.contact_phone}
                         onChange={(e) => setOpportunityForm({...opportunityForm, contact_phone: e.target.value})}
                       />
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Action Buttons */}
               <div className="form-actions">
                 <button type="button" className="btn btn-outline" onClick={saveDraft} disabled={isDraftSaving}>
                   {isDraftSaving ? 'Saving...' : 'Save Draft'}
                 </button>
                 
                 {formProgress > 1 && (
                   <button type="button" className="btn btn-secondary" onClick={prevStep}>
                     Previous
                   </button>
                 )}
                 
                 {formProgress < 3 ? (
                   <button type="button" className="btn btn-primary" onClick={nextStep}>
                     Next
                   </button>
                 ) : (
                   <button type="submit" className="btn btn-primary">
                     <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                     </svg>
                     Post Opportunity
                   </button>
                 )}
               </div>
             </form>
           </div>
                  </div>
       )}

       {/* Edit Opportunity Modal */}
       {showEditOpportunityModal && editingOpportunity && (
         <div className="modal-overlay" onClick={() => setShowEditOpportunityModal(false)}>
           <div className="opportunity-form-modal" onClick={e => e.stopPropagation()}>
             {/* Header Section */}
             <div className="modal-header">
               <button 
                 className="back-btn"
                 onClick={() => setShowEditOpportunityModal(false)}
               >
                 <span className="back-icon">←</span>
                 Back
               </button>
               <div className="header-content">
                 <h2>Edit Opportunity</h2>
                 <p>Update your opportunity details.</p>
               </div>
               <button 
                 className="close-modal-btn"
                 onClick={() => setShowEditOpportunityModal(false)}
               >
                 ×
               </button>
             </div>
             
             <form className="opportunity-form" onSubmit={handleUpdateOpportunity}>
               {/* Opportunity Type Selector */}
               <div className="type-selector">
                 <div className="type-tabs">
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'job' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'job'})}
                   >
                     <span className="type-icon">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                         <line x1="8" y1="21" x2="16" y2="21"/>
                         <line x1="12" y1="17" x2="12" y2="21"/>
                       </svg>
                     </span>
                     Job
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'internship' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'internship'})}
                   >
                     <svg className="type-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                     </svg>
                     Internship
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'project' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'project'})}
                   >
                     <span className="type-icon">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                         <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                         <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                         <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                       </svg>
                     </span>
                     Project
                   </button>
                 </div>
               </div>
               
               {/* Form Layout */}
               <div className="form-layout">
                 {/* Left Column - Opportunity Info */}
                 <div className="form-column">
                   <div className="form-section">
                     <h3>Opportunity Details</h3>
                     
                     <div className="form-group">
                       <label>Opportunity Title *</label>
                       <input
                         type="text"
                         placeholder="e.g., Frontend Developer Internship"
                         value={opportunityForm.title}
                         onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                         required
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Description *</label>
                       <textarea
                         placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                         value={opportunityForm.description}
                         onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                         required
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Skills Required</label>
                       <input
                         type="text"
                         placeholder="e.g., React, Node.js, SQL (separate with commas)"
                         value={opportunityForm.requirements}
                         onChange={(e) => setOpportunityForm({...opportunityForm, requirements: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-row">
                       <div className="form-group">
                         <label>Location</label>
                         <select
                           value={opportunityForm.location}
                           onChange={(e) => setOpportunityForm({...opportunityForm, location: e.target.value})}
                         >
                           <option value="">Select location type</option>
                           <option value="Remote">Remote</option>
                           <option value="On-site">On-site</option>
                           <option value="Hybrid">Hybrid</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label>Duration</label>
                         <input
                           type="text"
                           placeholder="e.g., 6 months, Full-time"
                           value={opportunityForm.duration}
                           onChange={(e) => setOpportunityForm({...opportunityForm, duration: e.target.value})}
                         />
                       </div>
                     </div>
                     
                     <div className="form-group">
                       <label>Stipend/Salary</label>
                       <div className="salary-input">
                         <span className="currency">₹</span>
                         <input
                           type="text"
                           placeholder="e.g., 25,000 per month"
                           value={opportunityForm.stipend}
                           onChange={(e) => setOpportunityForm({...opportunityForm, stipend: e.target.value})}
                         />
                       </div>
                     </div>
                     
                     <div className="form-group">
                       <label>Deadline to Apply *</label>
                       <input
                         type="date"
                         value={opportunityForm.closing_date}
                         onChange={(e) => setOpportunityForm({...opportunityForm, closing_date: e.target.value})}
                         required
                       />
                     </div>
                   </div>
                 </div>
                 
                 {/* Right Column - Eligibility Criteria */}
                 <div className="form-column">
                   <div className="form-section">
                     <h3>Eligibility Criteria</h3>
                     
                     <div className="form-group">
                       <label>Degree/Course</label>
                       <input
                         type="text"
                         placeholder="e.g., B.Tech, MBA, MCA"
                         value={opportunityForm.degree || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, degree: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Year of Study</label>
                       <select
                         value={opportunityForm.yearOfStudy || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, yearOfStudy: e.target.value})}
                       >
                         <option value="">Any year</option>
                         <option value="1st Year">1st Year</option>
                         <option value="2nd Year">2nd Year</option>
                         <option value="3rd Year">3rd Year</option>
                         <option value="Final Year">Final Year</option>
                       </select>
                     </div>
                     
                     <div className="form-group">
                       <label>Minimum CGPA/Percentage</label>
                       <input
                         type="number"
                         placeholder="e.g., 7.5"
                         min="0"
                         max="10"
                         step="0.1"
                         value={opportunityForm.minGpa || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, minGpa: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Experience Required</label>
                       <input
                         type="text"
                         placeholder="e.g., 1-2 years or None"
                         value={opportunityForm.experience || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, experience: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Other Conditions</label>
                       <textarea
                         placeholder="Any additional requirements or conditions..."
                         value={opportunityForm.otherConditions || ''}
                         onChange={(e) => setOpportunityForm({...opportunityForm, otherConditions: e.target.value})}
                       />
                     </div>
                   </div>
                   
                   <div className="form-section">
                     <h3>Contact Information</h3>
                     
                     <div className="form-group">
                       <label>Contact Email</label>
                       <input
                         type="email"
                         placeholder="your-email@company.com"
                         value={opportunityForm.contact_email}
                         onChange={(e) => setOpportunityForm({...opportunityForm, contact_email: e.target.value})}
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Contact Phone</label>
                       <input
                         type="text"
                         placeholder="+91 98765 43210"
                         value={opportunityForm.contact_phone}
                         onChange={(e) => setOpportunityForm({...opportunityForm, contact_phone: e.target.value})}
                       />
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Action Buttons */}
               <div className="form-actions">
                 <button type="button" className="btn btn-outline" onClick={() => setShowEditOpportunityModal(false)}>
                   Cancel
                 </button>
                 <button type="submit" className="btn btn-primary">
                   <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                   </svg>
                   Update Opportunity
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteModal && deletingOpportunity && (
         <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
           <div className="delete-confirmation-modal" onClick={e => e.stopPropagation()}>
             <div className="modal-header">
               <h3>Delete Opportunity</h3>
               <button 
                 className="close-modal-btn"
                 onClick={() => setShowDeleteModal(false)}
               >
                 ×
               </button>
             </div>
             
             <div className="delete-content">
               <svg className="warning-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
               </svg>
               <h4>Are you sure you want to delete this opportunity?</h4>
               <p><strong>"{deletingOpportunity.title}"</strong></p>
               <p className="warning-text">
                 This action cannot be undone. The opportunity will be permanently removed from the system.
               </p>
               
               <div className="delete-details">
                 <p><strong>Type:</strong> {deletingOpportunity.type}</p>
                 <p><strong>Applications:</strong> {deletingOpportunity.application_count || 0}</p>
                 <p><strong>Posted:</strong> {new Date(deletingOpportunity.created_at).toLocaleDateString()}</p>
               </div>
             </div>
             
             <div className="modal-actions">
               <button 
                 className="btn btn-outline"
                 onClick={() => setShowDeleteModal(false)}
                 disabled={loadingDelete}
               >
                 Cancel
               </button>
               <button 
                 className="btn btn-danger"
                 onClick={confirmDeleteOpportunity}
                 disabled={loadingDelete}
               >
                 {loadingDelete ? 'Deleting...' : 'Delete Opportunity'}
               </button>
             </div>
           </div>
         </div>
       )}
 
       {/* Applications Modal */}
      {showApplicationsModal && selectedOpportunity && (
        <div className="modal-overlay" onClick={() => setShowApplicationsModal(false)}>
          <div className="applications-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Applications for {selectedOpportunity.title}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowApplicationsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="applications-content">
              {selectedOpportunity.applications && selectedOpportunity.applications.length > 0 ? (
                <div className="applications-list">
                  {selectedOpportunity.applications.map(app => (
                    <div key={app.id} className="application-card">
                      <div className="application-header">
                        <div className="student-info">
                          <h4>{app.student_name}</h4>
                          <p>{app.student_email}</p>
                          <p>Applied: {new Date(app.application_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`status-badge ${app.status}`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="application-details">
                        <div className="detail-section">
                          <h5>Student Details</h5>
                          <div className="student-details">
                            <div className="detail-row">
                              <span>University:</span>
                              <span>{app.university_name || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span>GPA:</span>
                              <span>{app.gpa || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span>Expected Graduation:</span>
                              <span>{app.expected_graduation ? new Date(app.expected_graduation).toLocaleDateString() : 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {app.cover_letter && (
                          <div className="application-cover-letter">
                            <h5>Cover Letter</h5>
                            <p>{app.cover_letter}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="application-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleViewStudentProfile(app.student_id)}
                        >
                          View Full Profile
                        </button>
                        {app.status === 'pending' ? (
                          <>
                            <button 
                              className="btn btn-success" 
                              onClick={() => handleApproveApplication(app.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger" 
                              onClick={() => handleRejectApplication(app.id)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`status-badge ${app.status}`}>
                            {app.status === 'approved' ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                  <polyline points="20,6 9,17 4,12"/>
                                </svg>
                                Approved
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Rejected
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-applications">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                  <h4>No Applications Yet</h4>
                  <p>Applications for this opportunity will appear here once students start applying.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showStudentProfileModal && studentProfile && (
        <div className="modal-overlay" onClick={() => setShowStudentProfileModal(false)}>
          <div className="student-profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile - {studentProfile.name}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowStudentProfileModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="student-profile-content">
              <div className="profile-sections">
                {/* Basic Information */}
                <div className="profile-section">
                  <h4>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Basic Information
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong>
                      <span>{studentProfile.name}</span>
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong>
                      <span>{studentProfile.email}</span>
                    </div>
                    <div className="info-item">
                      <strong>Phone:</strong>
                      <span>{studentProfile.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Address:</strong>
                      <span>{studentProfile.address || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Institute:</strong>
                      <span>{studentProfile.institute_name || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Joined:</strong>
                      <span>{new Date(studentProfile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {studentProfile.bio && (
                    <div className="bio-section">
                      <h5>Bio</h5>
                      <p>{studentProfile.bio}</p>
                    </div>
                  )}
                </div>



                {/* Skills */}
                {studentProfile.skills && studentProfile.skills.length > 0 && (
                  <div className="profile-section">
                    <h4>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Skills
                    </h4>
                    <div className="skills-grid">
                      {studentProfile.skills.map((skill, index) => (
                        <div key={index} className="skill-item">
                          <span className="skill-name">{skill.skill_name}</span>
                          <span className="skill-level">{skill.proficiency_level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {studentProfile.education && studentProfile.education.length > 0 && (
                  <div className="profile-section">
                    <h4><span>📚</span> Education</h4>
                    <div className="education-list">
                      {studentProfile.education.map((edu, index) => (
                        <div key={index} className="education-item">
                          <div className="education-header">
                            <h5>{edu.degree}</h5>
                            <span className="education-year">
                              {edu.start_date} - {edu.end_date || 'Present'}
                            </span>
                          </div>
                          <div className="education-details">
                            <p><strong>Institution:</strong> {edu.institution}</p>
                            <p><strong>Field:</strong> {edu.field_of_study}</p>
                            {edu.grade && <p><strong>Grade:</strong> {edu.grade}</p>}
                            {edu.description && <p>{edu.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {studentProfile.experience && studentProfile.experience.length > 0 && (
                  <div className="profile-section">
                    <h4>
                      <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                      </span>
                      Work Experience
                    </h4>
                    <div className="experience-list">
                      {studentProfile.experience.map((exp, index) => (
                        <div key={index} className="experience-item">
                          <div className="experience-header">
                            <h5>{exp.title}</h5>
                            <span className="experience-company">{exp.company}</span>
                          </div>
                          <p className="experience-dates">
                            {exp.start_date} - {exp.end_date || 'Present'}
                          </p>
                          <p className="experience-description">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {studentProfile.projects && studentProfile.projects.length > 0 && (
                  <div className="profile-section">
                    <h4>
                      <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                        </svg>
                      </span>
                      Projects
                    </h4>
                    <div className="projects-list">
                      {studentProfile.projects.map((project, index) => (
                        <div key={index} className="project-item">
                          <div className="project-header">
                            <h5>{project.project_name}</h5>
                            <span className="project-date">
                              {project.start_date} - {project.end_date || 'Present'}
                            </span>
                          </div>
                          <p className="project-description">{project.description}</p>
                          {project.technologies_used && (
                            <p className="project-technologies">
                              <strong>Technologies:</strong> {project.technologies_used}
                            </p>
                          )}
                          {project.project_url && (
                            <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="project-link">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                              View Project
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications to ICM Opportunities */}
                {studentProfile.applications && studentProfile.applications.length > 0 && (
                  <div className="profile-section">
                    <h4>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                      Applications to Your Opportunities
                    </h4>
                    <div className="applications-list">
                      {studentProfile.applications.map((app, index) => (
                        <div key={index} className="application-item">
                          <div className="application-header">
                            <h5>{app.opportunity_title}</h5>
                            <span className={`status-badge ${app.status}`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="application-date">
                            Applied: {new Date(app.application_date).toLocaleDateString()}
                          </p>
                          {app.cover_letter && (
                            <div className="application-cover-letter">
                              <h6>Cover Letter:</h6>
                              <p>{app.cover_letter}</p>
                            </div>
                          )}
                          {app.review_notes && (
                            <div className="application-review-notes">
                              <h6>Review Notes:</h6>
                              <p>{app.review_notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IcmDashboard;

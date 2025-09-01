import React, { useState, useEffect } from 'react';
import { api } from '../../config/api.js';
import './IcmDashboard.css';

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
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [universitiesRes, opportunitiesRes, statsRes, profileRes] = await Promise.all([
        api.getIcmUniversities(),
        api.getIcmOpportunities(),
        api.getIcmStats(),
        api.getIcmProfile()
      ]);

      if (universitiesRes.success) setUniversities(universitiesRes.universities);
      if (opportunitiesRes.success) setOpportunities(opportunitiesRes.opportunities);
      if (statsRes.success) setStats(statsRes.stats);
      if (profileRes.success) {
        setIcmProfile(profileRes.profile);
        setProfileFormData(profileRes.profile);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
      console.log('Fetching applications for opportunity:', opportunity.id);
      setSelectedOpportunity(opportunity);
      setShowApplicationsModal(true);
      
      // Fetch applications for this opportunity
      const response = await api.getIcmOpportunityApplications(opportunity.id);
      console.log('Applications response:', response);
      if (response.success) {
        setSelectedOpportunity({
          ...opportunity,
          applications: response.applications
        });
        console.log('Updated selected opportunity with applications:', response.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showNotification('Failed to load applications. Please try again.', 'error');
    }
  };

     const handleViewStudentProfile = async (studentId) => {
     try {
       setLoadingStudentProfile(true);
       const response = await api.getIcmStudentProfile(studentId);
       if (response.success) {
         setStudentProfile(response.student);
         setSelectedStudent(studentId);
         setShowStudentProfileModal(true);
       }
     } catch (error) {
       console.error('Failed to load student profile:', error);
     } finally {
       setLoadingStudentProfile(false);
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
       const response = await api.deleteIcmOpportunity(deletingOpportunity.id);
       if (response.success) {
         setShowDeleteModal(false);
         setDeletingOpportunity(null);
         fetchDashboardData();
         showNotification('Opportunity deleted successfully!', 'success');
       }
     } catch (error) {
       console.error('Error deleting opportunity:', error);
       showNotification('Failed to delete opportunity. Please try again.', 'error');
     } finally {
       setLoadingDelete(false);
     }
   };

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
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
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalOpportunities || 0}</h3>
            <p>Total Opportunities</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
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
                  <span><i>📍</i> {opp.location}</span>
                  <span><i>💰</i> {opp.stipend}</span>
                  <span><i>📅</i> {new Date(opp.closing_date).toLocaleDateString()}</span>
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
              <span>📝</span>
              Post New Opportunity
            </button>
            <button className="action-btn">
              <span>🎓</span>
              Add University
            </button>
            <button className="action-btn">
              <span>🤝</span>
              New Partnership
            </button>
            <button className="action-btn">
              <span>📊</span>
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
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search universities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">
          <span>➕</span>
          Add University
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading universities...</p>
        </div>
      ) : (
        <div className="universities-grid">
          {universities.map(uni => (
            <div key={uni.id} className="university-card">
              <div className="university-header">
                <div className="university-logo">
                  {uni.name.charAt(0)}
                </div>
                <div className="university-info">
                  <h3>{uni.name}</h3>
                  <p className="university-domain">{uni.domain}</p>
                  <p className="university-location">
                    <span>📍</span> {uni.location}
                  </p>
                </div>
              </div>
              
              <div className="university-stats">
                <div className="stat-item">
                  <span className="stat-number">{uni.students}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{uni.activeProjects}</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{uni.partnerships}</span>
                  <span className="stat-label">Partnerships</span>
                </div>
              </div>
              
              <div className="university-actions">
                <button className="btn btn-outline">View Details</button>
                <button className="btn btn-outline">Students</button>
                <button className="btn btn-outline">Partnerships</button>
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
          <span>➕</span>
          Post Opportunity
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="no-opportunities">
          <span>📝</span>
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
                <p><strong>Type:</strong> {opp.type}</p>
                <p><strong>Location:</strong> {opp.location}</p>
                <p><strong>Stipend:</strong> {opp.stipend}</p>
                <p><strong>Duration:</strong> {opp.duration}</p>
                <p><strong>Applications:</strong> {opp.application_count || 0}</p>
                <p><strong>Closing:</strong> {new Date(opp.closing_date).toLocaleDateString()}</p>
              </div>
              
                             <div className="opportunity-actions">
                 <button className="btn btn-outline">View Details</button>
                 <button 
                   className="btn btn-outline"
                   onClick={() => handleEditOpportunity(opp)}
                   disabled={loadingEditOpportunity}
                 >
                   {loadingEditOpportunity ? 'Loading...' : 'Edit'}
                 </button>
                 <button 
                   className="btn btn-primary"
                   onClick={() => handleViewApplications(opp)}
                 >
                   View Applications ({opp.application_count || 0})
                 </button>
                 <button 
                   className="btn btn-danger"
                   onClick={() => handleDeleteOpportunity(opp)}
                   disabled={loadingDelete}
                 >
                   {loadingDelete ? 'Deleting...' : 'Delete'}
                 </button>
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
                <i className="fas fa-building"></i>
              </div>
              <div className="company-basic-info">
                <h2>{icmProfile?.company?.name || 'Company Name'}</h2>
                <p className="company-industry">{icmProfile?.company?.industryType || 'Industry'}</p>
                <p className="company-location">📍 {icmProfile?.company?.headquartersLocation || 'Location'}</p>
                <div className="company-status">
                  <span className={`status-badge ${icmProfile?.recruitment?.hiringStatus === 'actively_hiring' ? 'hiring' : 'not-hiring'}`}>
                    {icmProfile?.recruitment?.hiringStatus === 'actively_hiring' ? 'Actively Hiring' : 'Not Hiring'}
                  </span>
                  <span className="company-size">{icmProfile?.company?.size || 'Company Size'}</span>
                </div>
              </div>
            </div>
            <div className="company-actions">
              {editingProfile ? (
                <>
                  <button className="btn btn-outline" onClick={handleCancelEdit}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={profileLoading}>
                    <i className="fas fa-save"></i> {profileLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={handleEditProfile}>
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowOpportunityModal(true)}>
                    <i className="fas fa-plus"></i> Post Opportunity
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="profile-tabs">
          <button className={`tab-btn ${activeProfileTab === 'company' ? 'active' : ''}`} onClick={() => setActiveProfileTab('company')}>
            <i className="fas fa-building"></i> Company Info
          </button>
          <button className={`tab-btn ${activeProfileTab === 'culture' ? 'active' : ''}`} onClick={() => setActiveProfileTab('culture')}>
            <i className="fas fa-heart"></i> Culture & Values
          </button>
          <button className={`tab-btn ${activeProfileTab === 'recruitment' ? 'active' : ''}`} onClick={() => setActiveProfileTab('recruitment')}>
            <i className="fas fa-users"></i> Recruitment
          </button>
          <button className={`tab-btn ${activeProfileTab === 'highlights' ? 'active' : ''}`} onClick={() => setActiveProfileTab('highlights')}>
            <i className="fas fa-trophy"></i> Highlights
          </button>
          <button className={`tab-btn ${activeProfileTab === 'people' ? 'active' : ''}`} onClick={() => setActiveProfileTab('people')}>
            <i className="fas fa-user-friends"></i> People
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
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
            <div className="status-indicator active">
              <i className="fas fa-check-circle"></i>
              <span>Actively Hiring</span>
            </div>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'universities':
        return renderUniversitiesTab();
      case 'opportunities':
        return renderOpportunitiesTab();
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
    setProfileFormData(icmProfile);
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      
      // Structure the data correctly for the backend
      const updateData = {
        company: profileFormData.company || {},
        culture: profileFormData.culture || {},
        recruitment: profileFormData.recruitment || {},
        highlights: profileFormData.highlights || {},
        people: profileFormData.people || {},
        contact: profileFormData.contact || {},
        bio: profileFormData.bio || ''
      };
      
      console.log('Sending profile update data:', updateData);
      const response = await api.updateIcmProfile(updateData);
      console.log('Profile update response:', response);
      
      if (response.success) {
        setIcmProfile(profileFormData);
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
            <span className="nav-menu-item-icon dashboard"></span>
            <span className="nav-menu-item-text">Dashboard</span>
          </a>

          <a 
            href="#opportunities"
            className={`nav-menu-item ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            <span className="nav-menu-item-icon opportunities"></span>
            <span className="nav-menu-item-text">Opportunities</span>
          </a>

          <a 
            href="#universities"
            className={`nav-menu-item ${activeTab === 'universities' ? 'active' : ''}`}
            onClick={() => setActiveTab('universities')}
          >
            <span className="nav-menu-item-icon universities"></span>
            <span className="nav-menu-item-text">Universities</span>
          </a>

          <a 
            href="#applications"
            className="nav-menu-item"
          >
            <span className="nav-menu-item-icon applications"></span>
            <span className="nav-menu-item-text">Applications</span>
            <span className="nav-menu-item-badge">1</span>
          </a>

          <a 
            href="#profile"
            className={`nav-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-menu-item-icon profile"></span>
            <span className="nav-menu-item-text">Profile</span>
          </a>
        </div>

        {/* Bottom Section */}
        <div className="nav-bottom">
          {/* Theme Toggle */}
          <div className="theme-toggle" onClick={handleThemeToggle}>
            <div className="theme-toggle-text">
              <span className="theme-toggle-icon">🌙</span>
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </div>
            <div className={`theme-toggle-switch ${isDarkTheme ? 'active' : ''}`}></div>
          </div>

          {/* Logout Button */}
          <button className="nav-logout" onClick={handleLogout}>
            <span className="nav-logout-icon">🚪</span>
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
                     <span className="type-icon">💼</span>
                     Job
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'internship' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'internship'})}
                   >
                     <span className="type-icon">🎓</span>
                     Internship
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'project' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'project'})}
                   >
                     <span className="type-icon">🚀</span>
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
                     <span className="btn-icon">📝</span>
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
                     <span className="type-icon">💼</span>
                     Job
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'internship' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'internship'})}
                   >
                     <span className="type-icon">🎓</span>
                     Internship
                   </button>
                   <button
                     type="button"
                     className={`type-tab ${opportunityForm.type === 'project' ? 'active' : ''}`}
                     onClick={() => setOpportunityForm({...opportunityForm, type: 'project'})}
                   >
                     <span className="type-icon">🚀</span>
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
                   <span className="btn-icon">💾</span>
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
               <div className="warning-icon">⚠️</div>
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
                        <button className="btn btn-outline">Approve</button>
                        <button className="btn btn-outline">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-applications">
                  <span>📋</span>
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
                  <h4><span>👤</span> Basic Information</h4>
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
                      <span>{studentProfile.contact?.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Address:</strong>
                      <span>{studentProfile.contact?.address || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Joined:</strong>
                      <span>{new Date(studentProfile.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <strong>Last Login:</strong>
                      <span>{studentProfile.lastLogin ? new Date(studentProfile.lastLogin).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                  
                  {studentProfile.bio && (
                    <div className="bio-section">
                      <h5>Bio</h5>
                      <p>{studentProfile.bio}</p>
                    </div>
                  )}
                </div>

                {/* Academic Information */}
                <div className="profile-section">
                  <h4><span>🎓</span> Academic Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>University:</strong>
                      <span>{studentProfile.academic?.university?.name || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Institute:</strong>
                      <span>{studentProfile.academic?.institute || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Department:</strong>
                      <span>{studentProfile.academic?.department || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Field of Study:</strong>
                      <span>{studentProfile.academic?.fieldOfStudy || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Highest Degree:</strong>
                      <span>{studentProfile.academic?.highestDegree || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Years Experience:</strong>
                      <span>{studentProfile.academic?.yearsExperience || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {studentProfile.skills && studentProfile.skills.length > 0 && (
                  <div className="profile-section">
                    <h4><span>🛠️</span> Skills</h4>
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
                    <h4><span>💼</span> Work Experience</h4>
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
                    <h4><span>🚀</span> Projects</h4>
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
                              🔗 View Project
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
                    <h4><span>📋</span> Applications to Your Opportunities</h4>
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

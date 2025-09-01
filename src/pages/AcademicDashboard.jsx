import { useEffect, useState } from 'react'
import { api } from '../config/api.js'
import './AcademicDashboard.css'

export default function AcademicDashboard() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  
  // Opportunities state
  const [opportunities, setOpportunities] = useState([])
  const [showOpportunityForm, setShowOpportunityForm] = useState(false)
  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    description: '',
    type: 'internship',
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
  })

  // Form progress and validation states
  const [formProgress, setFormProgress] = useState(1)
  const [formErrors, setFormErrors] = useState({})
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  // Applications state
  const [applications, setApplications] = useState([])
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [applicationStatus, setApplicationStatus] = useState('pending')
  const [reviewNotes, setReviewNotes] = useState('')

  // Fetch students from the academic leader's university
  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getAcademicStudents()
      const withStatus = (data.students || []).map(s => ({ ...s, status: s.status || 'active' }))
      setStudents(withStatus)
    } catch (e) {
      setError(e.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  // Fetch academic leader's own profile
  const fetchUserProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (userData && userData.id) {
        const profileData = await api.getUserProfile(userData.id)
        setUserProfile(profileData)
        setEditedProfile(profileData)
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e)
    }
  }

  // Save profile changes
  const handleProfileSave = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (userData && userData.id) {
        await api.updateUserProfile(userData.id, editedProfile)
        setUserProfile(editedProfile)
        setIsEditingProfile(false)
        alert('Profile updated successfully!')
      }
    } catch (e) {
      alert('Failed to update profile: ' + e.message)
    }
  }

  // Handle profile field changes
  const handleProfileFieldChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Skills management functions
  const addSkill = (skill) => {
    if (skill.trim() && !opportunityForm.skills.includes(skill.trim())) {
      setOpportunityForm({
        ...opportunityForm,
        skills: [...opportunityForm.skills, skill.trim()]
      })
    }
  }

  const removeSkill = (skillToRemove) => {
    setOpportunityForm({
      ...opportunityForm,
      skills: opportunityForm.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleSkillInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      addSkill(e.target.value)
      e.target.value = ''
    }
  }

  // File upload functions
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setOpportunityForm({
      ...opportunityForm,
      uploadedFiles: [...opportunityForm.uploadedFiles, ...files]
    })
  }

  const removeFile = (index) => {
    setOpportunityForm({
      ...opportunityForm,
      uploadedFiles: opportunityForm.uploadedFiles.filter((_, i) => i !== index)
    })
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    
    if (!opportunityForm.title.trim()) errors.title = 'Title is required'
    if (!opportunityForm.description.trim()) errors.description = 'Description is required'
    if (!opportunityForm.closing_date) errors.closing_date = 'Deadline is required'
    
    // Check if deadline is in the future
    if (opportunityForm.closing_date && new Date(opportunityForm.closing_date) <= new Date()) {
      errors.closing_date = 'Deadline must be in the future'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Progress management
  const nextStep = () => {
    if (validateForm()) {
      setFormProgress(Math.min(formProgress + 1, 3))
    }
  }

  const prevStep = () => {
    setFormProgress(Math.max(formProgress - 1, 1))
  }

  // Autosave draft
  const saveDraft = async () => {
    setIsDraftSaving(true)
    try {
      // Simulate draft saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      showNotification('Draft saved successfully!', 'success')
    } catch (error) {
      showNotification('Failed to save draft', 'error')
    } finally {
      setIsDraftSaving(false)
    }
  }

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (opportunityForm.title || opportunityForm.description) {
        saveDraft()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [opportunityForm])

  // Delete student
  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    try {
      await api.deleteAcademicStudent(id)
      await fetchStudents()
      alert('Student deleted successfully')
    } catch (e) {
      alert(e.message || 'Delete failed')
    }
  }

  // Fetch opportunities posted by academic leader
  const fetchOpportunities = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (userData && userData.id) {
        const data = await api.getAcademicOpportunities(userData.id)
        setOpportunities(data.opportunities || [])
      }
    } catch (e) {
      console.error('Failed to fetch opportunities:', e)
    }
  }

  // Post new opportunity
  const handlePostOpportunity = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showNotification('Please fix the errors before submitting', 'error')
      return
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (!userData || !userData.id) {
        showNotification('User data not found', 'error')
        return
      }

      // Prepare form data with skills as comma-separated string
      const formData = {
        ...opportunityForm,
        requirements: opportunityForm.skills.join(', ') + (opportunityForm.requirements ? `, ${opportunityForm.requirements}` : ''),
        academic_leader_id: userData.id,
        university_id: userData.university_id
      }

      await api.postOpportunity(formData)
      setShowOpportunityForm(false)
      setFormProgress(1)
      setFormErrors({})
      setOpportunityForm({
        title: '',
        description: '',
        type: 'internship',
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
      })
      fetchOpportunities()
      showNotification('Opportunity posted successfully!', 'success')
      // Redirect to opportunities page
      setActiveTab('opportunities')
    } catch (e) {
      console.error('Error posting opportunity:', e)
      showNotification('Failed to post opportunity. Please try again.', 'error')
    }
  }

  // Delete opportunity
  const deleteOpportunity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return
    try {
      await api.deleteOpportunity(id)
      await fetchOpportunities()
      alert('Opportunity deleted successfully')
    } catch (e) {
      alert(e.message || 'Delete failed')
    }
  }

  // Handle opportunity form field changes
  const handleOpportunityFieldChange = (field, value) => {
    setOpportunityForm(prev => ({ ...prev, [field]: value }))
  }

  // Get opportunity icon based on type
  const getOpportunityIcon = (type) => {
    switch (type) {
      case 'research_paper':
        return 'fa-microscope'
      case 'project':
        return 'fa-project-diagram'
      case 'internship':
        return 'fa-graduation-cap'
      case 'job':
        return 'fa-briefcase'
      default:
        return 'fa-briefcase'
    }
  }

  // Edit opportunity
  const handleEditOpportunity = (opportunity) => {
    setOpportunityForm({
      ...opportunity,
      deadline: opportunity.deadline || opportunity.closingDate || ''
    })
    setShowOpportunityForm(true)
  }

  // Update opportunity
  const handleUpdateOpportunity = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (userData && userData.id) {
        await api.updateOpportunity(opportunityForm.id, {
          ...opportunityForm,
          academic_leader_id: userData.id,
          university_id: userData.university_id
        })
        
        // Reset form and close modal
        setOpportunityForm({
          title: '',
          description: '',
          type: 'research_paper',
          requirements: '',
          deadline: '',
          stipend: '',
          location: '',
          duration: '',
          contact_email: '',
          contact_phone: ''
        })
        setShowOpportunityForm(false)
        
        // Refresh opportunities list
        await fetchOpportunities()
        alert('Opportunity updated successfully!')
      }
    } catch (e) {
      alert('Failed to update opportunity: ' + e.message)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchUserProfile()
    fetchOpportunities()
  }, [])

  // Fetch applications for an opportunity
  const fetchApplications = async (opportunityId) => {
    try {
      const data = await api.getApplicationsForOpportunity(opportunityId)
      setApplications(data.applications || [])
      setSelectedOpportunity(data.opportunity)
    } catch (e) {
      console.error('Failed to fetch applications:', e)
      alert('Failed to fetch applications: ' + e.message)
    }
  }

  // Handle application status update
  const handleUpdateApplicationStatus = async () => {
    try {
      if (!selectedApplication) return
      
      await api.updateApplicationStatus(selectedApplication.id, {
        status: applicationStatus,
        reviewNotes: reviewNotes
      })
      
      // Refresh applications
      await fetchApplications(selectedOpportunity.id)
      
      // Reset form
      setSelectedApplication(null)
      setApplicationStatus('pending')
      setReviewNotes('')
      setShowApplicationModal(false)
      
      alert('Application status updated successfully!')
    } catch (e) {
      alert('Failed to update application status: ' + e.message)
    }
  }

  // View application details
  const handleViewApplication = (application) => {
    setSelectedApplication(application)
    setApplicationStatus(application.status)
    setReviewNotes(application.review_notes || '')
    setShowApplicationModal(true)
  }

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(search.toLowerCase()) ||
    student.email?.toLowerCase().includes(search.toLowerCase())
  )

  // Avatar helper function
  const getAvatar = (name) => {
    if (!name) return '?'
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
    return initials.slice(0, 2)
  }

  // Theme toggle function
  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  // Mobile menu toggle function
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Logout function
  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <div className={`academic-dashboard ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* Mobile Menu Toggle */}
      <button className="nav-toggle" onClick={handleMobileMenuToggle}>
        ☰
      </button>

      {/* Navigation Sidebar */}
      <nav className={`nav-sidebar ${isDarkTheme ? 'dark' : 'light'} ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="nav-logo">
          <div className="nav-logo-icon">🎓</div>
          <div className="nav-logo-text">TrustTeams</div>
        </div>

        {/* Navigation Menu */}
        <div className="nav-menu">
          <a 
            href="#profile"
            className={`nav-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-menu-item-icon profile"></span>
            <span className="nav-menu-item-text">My Profile</span>
          </a>

          <a 
            href="#students"
            className={`nav-menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <span className="nav-menu-item-icon students"></span>
            <span className="nav-menu-item-text">Students</span>
            <span className="nav-menu-item-badge">{students.length}</span>
          </a>

          <a 
            href="#opportunities"
            className={`nav-menu-item ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            <span className="nav-menu-item-icon opportunities"></span>
            <span className="nav-menu-item-text">Opportunities</span>
            <span className="nav-menu-item-badge">{opportunities.length}</span>
          </a>

          <a 
            href="#applications"
            className={`nav-menu-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="nav-menu-item-icon applications"></span>
            <span className="nav-menu-item-text">Applications</span>
            <span className="nav-menu-item-badge">{applications.length}</span>
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
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>My Profile</h2>
              {!isEditingProfile ? (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleProfileSave}
                  >
                    <i className="fas fa-save"></i>
                    Save
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditingProfile(false)
                      setEditedProfile(userProfile)
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {userProfile ? (
              <div className="modern-profile-container">
                {/* Profile Content Grid */}
                <div className="profile-content-grid">
                  {/* Left Column */}
                  <div className="profile-left-column">
                    {/* Basic Information */}
                    <div className="profile-card-modern">
                      <div className="card-header">
                        <i className="fas fa-info-circle"></i>
                        <h3>Basic Information</h3>
                      </div>
                      <div className="card-content">
                        <div className="info-item">
                          <label>Full Name</label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.name || ''}
                              onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                              placeholder="Enter full name"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.name || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Phone</label>
                          {isEditingProfile ? (
                            <input
                              type="tel"
                              value={editedProfile.phone || ''}
                              onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                              placeholder="Enter phone number"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.phone || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Address</label>
                          {isEditingProfile ? (
                            <textarea
                              value={editedProfile.address || ''}
                              onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                              placeholder="Enter address"
                              rows="3"
                              className="modern-textarea"
                            />
                          ) : (
                            <span className="info-value">{userProfile.address || 'Not specified'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* University & Position */}
                    <div className="profile-card-modern">
                      <div className="card-header">
                        <i className="fas fa-university"></i>
                        <h3>University & Position</h3>
                      </div>
                      <div className="card-content">
                        <div className="info-item">
                          <label>University</label>
                          <span className="info-value highlight">{userProfile.university_name || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <label>Position</label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.position || ''}
                              onChange={(e) => handleProfileFieldChange('position', e.target.value)}
                              placeholder="e.g., Professor, Associate Professor"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.position || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Department</label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.department || ''}
                              onChange={(e) => handleProfileFieldChange('department', e.target.value)}
                              placeholder="Enter department"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.department || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Experience</label>
                          {isEditingProfile ? (
                            <input
                              type="number"
                              value={editedProfile.years_experience || ''}
                              onChange={(e) => handleProfileFieldChange('years_experience', e.target.value)}
                              placeholder="Years of experience"
                              min="0"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.years_experience || 'Not specified'} years</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="profile-card-modern">
                      <div className="card-header">
                        <i className="fas fa-graduation-cap"></i>
                        <h3>Education</h3>
                      </div>
                      <div className="card-content">
                        <div className="info-item">
                          <label>Highest Degree</label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.highest_degree || ''}
                              onChange={(e) => handleProfileFieldChange('highest_degree', e.target.value)}
                              placeholder="e.g., Ph.D., M.Tech, M.Sc"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.highest_degree || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Field of Study</label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.field_of_study || ''}
                              onChange={(e) => handleProfileFieldChange('field_of_study', e.target.value)}
                              placeholder="e.g., Computer Science, Electronics"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.field_of_study || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Institution</label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.institution || ''}
                              onChange={(e) => handleProfileFieldChange('institution', e.target.value)}
                              placeholder="University/Institution name"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.institution || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Completion Year</label>
                          {isEditingProfile ? (
                            <input
                              type="number"
                              value={editedProfile.completion_year || ''}
                              onChange={(e) => handleProfileFieldChange('completion_year', e.target.value)}
                              placeholder="Year"
                              min="1950"
                              max="2030"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.completion_year || 'Not specified'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="profile-right-column">
                    {/* Research & Publications */}
                    <div className="profile-card-modern">
                      <div className="card-header">
                        <i className="fas fa-microscope"></i>
                        <h3>Research & Publications</h3>
                      </div>
                      <div className="card-content">
                        <div className="info-item">
                          <label>Research Papers</label>
                          {isEditingProfile ? (
                            <input
                              type="number"
                              value={editedProfile.research_papers || ''}
                              onChange={(e) => handleProfileFieldChange('research_papers', e.target.value)}
                              placeholder="Number of papers"
                              min="0"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.research_papers || '0'} papers</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Research Areas</label>
                          {isEditingProfile ? (
                            <textarea
                              value={editedProfile.research_areas || ''}
                              onChange={(e) => handleProfileFieldChange('research_areas', e.target.value)}
                              placeholder="e.g., Machine Learning, Data Science, IoT"
                              rows="3"
                              className="modern-textarea"
                            />
                          ) : (
                            <span className="info-value">{userProfile.research_areas || 'Not specified'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Publications</label>
                          {isEditingProfile ? (
                            <textarea
                              value={editedProfile.publications || ''}
                              onChange={(e) => handleProfileFieldChange('publications', e.target.value)}
                              placeholder="List your key publications"
                              rows="4"
                              className="modern-textarea"
                            />
                          ) : (
                            <span className="info-value">{userProfile.publications || 'No publications listed'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="profile-card-modern">
                      <div className="card-header">
                        <i className="fas fa-project-diagram"></i>
                        <h3>Projects</h3>
                      </div>
                      <div className="card-content">
                        <div className="info-item">
                          <label>Projects Completed</label>
                          {isEditingProfile ? (
                            <input
                              type="number"
                              value={editedProfile.projects_completed || ''}
                              onChange={(e) => handleProfileFieldChange('projects_completed', e.target.value)}
                              placeholder="Number of projects"
                              min="0"
                              className="modern-input"
                            />
                          ) : (
                            <span className="info-value">{userProfile.projects_completed || '0'} projects</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Current Projects</label>
                          {isEditingProfile ? (
                            <textarea
                              value={editedProfile.current_projects || ''}
                              onChange={(e) => handleProfileFieldChange('current_projects', e.target.value)}
                              placeholder="Describe your current projects"
                              rows="3"
                              className="modern-textarea"
                            />
                          ) : (
                            <span className="info-value">{userProfile.current_projects || 'No current projects'}</span>
                          )}
                        </div>
                        <div className="info-item">
                          <label>Project Experience</label>
                          {isEditingProfile ? (
                            <textarea
                              value={editedProfile.project_experience || ''}
                              onChange={(e) => handleProfileFieldChange('project_experience', e.target.value)}
                              placeholder="Describe your project experience"
                              rows="4"
                              className="modern-textarea"
                            />
                          ) : (
                            <span className="info-value">{userProfile.project_experience || 'No project experience listed'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="profile-card-modern">
                      <div className="card-header">
                        <i className="fas fa-file-alt"></i>
                        <h3>About Me</h3>
                      </div>
                      <div className="card-content">
                        <div className="info-item">
                          <label>Bio</label>
                          {isEditingProfile ? (
                            <textarea
                              value={editedProfile.bio || ''}
                              onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                              placeholder="Tell us about yourself, your expertise, and interests..."
                              rows="5"
                              className="modern-textarea"
                            />
                          ) : (
                            <span className="info-value bio-text">{userProfile.bio || 'No bio available'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-card">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading profile...</p>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="students-section">
            <div className="section-header">
              <h2>University Students</h2>
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-card">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading students...</p>
              </div>
            ) : error ? (
              <div className="error-card">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchStudents}>
                  <i className="fas fa-redo"></i>
                  Retry
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-card">
                <i className="fas fa-users"></i>
                <p>{search ? 'No students found matching your search.' : 'No students found.'}</p>
              </div>
            ) : (
              <div className="students-grid">
                {filteredStudents.map(student => (
                  <div key={student.id} className="student-card">
                    <div className="student-header">
                      <div className="student-avatar">
                        {getAvatar(student.name)}
                      </div>
                      <div className="student-info">
                        <h4>{student.name}</h4>
                        <p>{student.email}</p>
                        <span className={`status-badge ${student.status}`}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="student-details">
                      <div className="detail-item">
                        <span className="label">Joined:</span>
                        <span>{new Date(student.created_at).toLocaleDateString()}</span>
                      </div>
                      {student.phone && (
                        <div className="detail-item">
                          <span className="label">Phone:</span>
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.department && (
                        <div className="detail-item">
                          <span className="label">Department:</span>
                          <span>{student.department}</span>
                        </div>
                      )}
                    </div>

                    <div className="student-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => deleteStudent(student.id)}
                        title="Delete student"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="opportunities-section">
            <div className="section-header">
              <h2>Post Opportunities for Students</h2>
              <button 
                className="post-opportunity-btn"
                onClick={() => setShowOpportunityForm(true)}
              >
                <i className="fas fa-plus"></i>
                Post New Opportunity
              </button>
            </div>

            {/* Opportunities List */}
            <div className="opportunities-grid">
              {opportunities.length === 0 ? (
                <div className="empty-card">
                  <i className="fas fa-briefcase"></i>
                  <p>No opportunities posted yet. Start by posting your first opportunity!</p>
                </div>
              ) : (
                opportunities.map(opportunity => (
                  <div key={opportunity.id} className="opportunity-card">
                    <div className="opportunity-header">
                      <div className="opportunity-type-badge">
                        <i className={`fas ${getOpportunityIcon(opportunity.type)}`}></i>
                        {opportunity.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="opportunity-actions">
                        <button 
                          className="edit-opportunity-btn"
                          onClick={() => handleEditOpportunity(opportunity)}
                          title="Edit opportunity"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="delete-opportunity-btn"
                          onClick={() => deleteOpportunity(opportunity.id)}
                          title="Delete opportunity"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="opportunity-content">
                      <h3>{opportunity.title}</h3>
                      <p className="opportunity-description">{opportunity.description}</p>
                      
                      <div className="opportunity-details">
                        {opportunity.requirements && (
                          <div className="detail-item">
                            <span className="label">Requirements:</span>
                            <span>{opportunity.requirements}</span>
                          </div>
                        )}
                        {opportunity.deadline && (
                          <div className="detail-item">
                            <span className="label">Deadline:</span>
                            <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        {opportunity.stipend && (
                          <div className="detail-item">
                            <span className="label">Stipend:</span>
                            <span>{opportunity.stipend}</span>
                          </div>
                        )}
                        {opportunity.location && (
                          <div className="detail-item">
                            <span className="label">Location:</span>
                            <span>{opportunity.location}</span>
                          </div>
                        )}
                        {opportunity.duration && (
                          <div className="detail-item">
                            <span className="label">Duration:</span>
                            <span>{opportunity.duration}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="opportunity-contact">
                        <p><strong>Contact:</strong> {opportunity.contact_email}</p>
                        {opportunity.contact_phone && (
                          <p><strong>Phone:</strong> {opportunity.contact_phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Opportunity Form Modal */}
        {showOpportunityForm && (
          <div className="modal-overlay" onClick={() => setShowOpportunityForm(false)}>
            <div className="opportunity-form-modal" onClick={e => e.stopPropagation()}>
              {/* Header Section */}
              <div className="modal-header">
                <button 
                  className="back-btn"
                  onClick={() => setShowOpportunityForm(false)}
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
                  onClick={() => setShowOpportunityForm(false)}
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
                          className={formErrors.title ? 'error' : ''}
                          required
                        />
                        {formErrors.title && <div className="error-message">{formErrors.title}</div>}
                      </div>
                      
                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                          value={opportunityForm.description}
                          onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                          className={formErrors.description ? 'error' : ''}
                          required
                        />
                        {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                      </div>
                      
                      <div className="form-group">
                        <label>Skills Required</label>
                        <div className="skills-input">
                          <input
                            type="text"
                            placeholder="Type a skill and press Enter (e.g., React, Node.js)"
                            onKeyPress={handleSkillInput}
                          />
                          <div className="skills-tags">
                            {opportunityForm.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)}>×</button>
                              </span>
                            ))}
                          </div>
                        </div>
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
                          className={formErrors.closing_date ? 'error' : ''}
                          required
                        />
                        {formErrors.closing_date && <div className="error-message">{formErrors.closing_date}</div>}
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
                          placeholder="your-email@university.com"
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

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="applications-section">
            <div className="section-header">
              <h2>Student Applications</h2>
              <p>Review and manage applications for your posted opportunities</p>
            </div>

            {opportunities.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-file-alt"></i>
                <h3>No Opportunities Posted</h3>
                <p>You haven't posted any opportunities yet. Students can only apply to opportunities you create.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('opportunities')}
                >
                  <i className="fas fa-plus"></i>
                  Post Your First Opportunity
                </button>
              </div>
            ) : (
              <div className="opportunities-selector">
                <h3>Select an Opportunity to View Applications</h3>
                <div className="opportunities-grid">
                  {opportunities.map(opportunity => (
                    <div 
                      key={opportunity.id} 
                      className={`opportunity-card ${selectedOpportunity?.id === opportunity.id ? 'selected' : ''}`}
                      onClick={() => fetchApplications(opportunity.id)}
                    >
                      <div className="opportunity-header">
                        <h4>{opportunity.title}</h4>
                        <span className={`opportunity-type-badge ${opportunity.type}`}>
                          {opportunity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="opportunity-description">{opportunity.description}</p>
                      <div className="opportunity-meta">
                        <span>📍 {opportunity.location}</span>
                        <span>💰 {opportunity.stipend || 'Not specified'}</span>
                        <span>⏱️ {opportunity.duration || 'Not specified'}</span>
                      </div>
                      <div className="opportunity-actions">
                        <button 
                          className="view-applications-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            fetchApplications(opportunity.id)
                          }}
                        >
                          <i className="fas fa-eye"></i>
                          View Applications
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOpportunity && (
              <div className="applications-list">
                <div className="applications-header">
                  <h3>Applications for: {selectedOpportunity.title}</h3>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedOpportunity(null)
                      setApplications([])
                    }}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Opportunities
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>No Applications Yet</h3>
                    <p>No students have applied to this opportunity yet.</p>
                  </div>
                ) : (
                  <div className="applications-grid">
                    {applications.map(application => (
                      <div key={application.id} className="application-card">
                        <div className="application-header">
                          <div className="student-info">
                            <div className="student-avatar">
                              {getAvatar(application.student_name)}
                            </div>
                            <div>
                              <h4>{application.student_name}</h4>
                              <p>{application.student_email}</p>
                            </div>
                          </div>
                          <span className={`status-badge ${application.status}`}>
                            {application.status}
                          </span>
                        </div>

                        <div className="application-details">
                          <div className="detail-item">
                            <label>Applied:</label>
                            <span>{new Date(application.application_date).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <label>GPA:</label>
                            <span>{application.gpa || 'Not specified'}</span>
                          </div>
                          <div className="detail-item">
                            <label>Expected Graduation:</label>
                            <span>{application.expected_graduation ? new Date(application.expected_graduation).toLocaleDateString() : 'Not specified'}</span>
                          </div>
                        </div>

                        {application.cover_letter && (
                          <div className="cover-letter">
                            <h5>Cover Letter:</h5>
                            <p>{application.cover_letter}</p>
                          </div>
                        )}

                        <div className="application-actions">
                          <button 
                            className="view-profile-btn"
                            onClick={() => handleViewApplication(application)}
                          >
                            <i className="fas fa-eye"></i>
                            View Full Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Application Review Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="modal-overlay">
            <div className="application-modal">
              <div className="modal-header">
                <h3>Review Application - {selectedApplication.student_name}</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-content">
                <div className="student-profile-section">
                  <h4>Student Profile</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>Name:</label>
                      <span>{selectedApplication.student_name}</span>
                    </div>
                    <div className="profile-item">
                      <label>Email:</label>
                      <span>{selectedApplication.student_email}</span>
                    </div>
                    <div className="profile-item">
                      <label>Phone:</label>
                      <span>{selectedApplication.student_phone || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Address:</label>
                      <span>{selectedApplication.student_address || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Bio:</label>
                      <span>{selectedApplication.student_bio || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="academic-section">
                  <h4>Academic Information</h4>
                  <div className="academic-grid">
                    <div className="academic-item">
                      <label>GPA:</label>
                      <span>{selectedApplication.gpa || 'Not specified'}</span>
                    </div>
                    <div className="academic-item">
                      <label>Expected Graduation:</label>
                      <span>{selectedApplication.expected_graduation ? new Date(selectedApplication.expected_graduation).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                    <div className="academic-item">
                      <label>Highest Degree:</label>
                      <span>{selectedApplication.highest_degree || 'Not specified'}</span>
                    </div>
                    <div className="academic-item">
                      <label>Field of Study:</label>
                      <span>{selectedApplication.field_of_study || 'Not specified'}</span>
                    </div>
                    <div className="academic-item">
                      <label>Institution:</label>
                      <span>{selectedApplication.institution || 'Not specified'}</span>
                    </div>
                    <div className="academic-item">
                      <label>Completion Year:</label>
                      <span>{selectedApplication.completion_year || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {selectedApplication.relevant_courses && (
                  <div className="courses-section">
                    <h4>Relevant Courses</h4>
                    <div className="courses-text">
                      {selectedApplication.relevant_courses}
                    </div>
                  </div>
                )}

                {selectedApplication.skills && (
                  <div className="skills-section">
                    <h4>Skills</h4>
                    <div className="skills-text">
                      {selectedApplication.skills}
                    </div>
                  </div>
                )}

                {selectedApplication.experience_summary && (
                  <div className="experience-section">
                    <h4>Experience Summary</h4>
                    <div className="experience-text">
                      {selectedApplication.experience_summary}
                    </div>
                  </div>
                )}

                {selectedApplication.cover_letter && (
                  <div className="cover-letter-section">
                    <h4>Cover Letter</h4>
                    <div className="cover-letter-text">
                      {selectedApplication.cover_letter}
                    </div>
                  </div>
                )}

                <div className="review-section">
                  <h4>Review Decision</h4>
                  <div className="review-form">
                    <div className="form-group">
                      <label>Status:</label>
                      <select 
                        value={applicationStatus}
                        onChange={(e) => setApplicationStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Review Notes:</label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add your review notes here..."
                        rows="4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleUpdateApplicationStatus}
                >
                  <i className="fas fa-save"></i>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

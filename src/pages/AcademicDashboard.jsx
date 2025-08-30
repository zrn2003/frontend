import { useEffect, useState } from 'react'
import { api } from '../config/api.js'
import './AcademicDashboard.css'

export default function AcademicDashboard() {
  const [activeTab, setActiveTab] = useState('profile')
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
    type: 'research_paper',
    requirements: '',
    deadline: '',
    stipend: '',
    location: '',
    duration: '',
    contact_email: '',
    contact_phone: ''
  })

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
  const handlePostOpportunity = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (userData && userData.id) {
        await api.postOpportunity({
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
        alert('Opportunity posted successfully!')
      }
    } catch (e) {
      alert('Failed to post opportunity: ' + e.message)
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

  return (
    <div className="academic-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎓 Academic Leader Dashboard</h1>
            <p>Manage your profile and university students</p>
          </div>
          <div className="header-right">
            <button 
              className="logout-btn"
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="user-info">
              <div className="user-avatar">
                {userProfile ? getAvatar(userProfile.name) : 'AL'}
              </div>
              <div className="user-details">
                <h3>{userProfile?.name || 'Academic Leader'}</h3>
                <p>{userProfile?.email || 'Loading...'}</p>
                <span className="user-role">Academic Leader</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              title="View and edit your academic profile"
            >
              <i className="fas fa-user"></i>
              <span>My Profile</span>
            </button>
            
            <button 
              className={`sidebar-nav-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
              title="Manage university students"
            >
              <i className="fas fa-users"></i>
              <span>University Students</span>
              <span className="nav-badge">{students.length}</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'opportunities' ? 'active' : ''}`}
              onClick={() => setActiveTab('opportunities')}
              title="Post and manage opportunities for students"
            >
              <i className="fas fa-briefcase"></i>
              <span>Opportunities</span>
              <span className="nav-badge">{opportunities.length}</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
              title="View and manage student applications"
            >
              <i className="fas fa-file-alt"></i>
              <span>Applications</span>
              <span className="nav-badge">{applications.length}</span>
            </button>

            <div className="sidebar-divider"></div>

            <button 
              className="sidebar-nav-item"
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
              title="Sign out of your account"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
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
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {getAvatar(userProfile.name)}
                  </div>
                  <div className="profile-info">
                    <h3>{userProfile.name}</h3>
                    <p className="profile-role">Academic Leader</p>
                    <p className="profile-email">{userProfile.email}</p>
                  </div>
                </div>

                <div className="profile-details">
                  {/* Basic Information */}
                  <div className="profile-section-group">
                    <h4><i className="fas fa-info-circle"></i> Basic Information</h4>
                    
                    <div className="detail-row">
                      <label>Full Name:</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.name || ''}
                          onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      ) : (
                        <span>{userProfile.name || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Email:</label>
                      <span>{userProfile.email}</span>
                    </div>

                    <div className="detail-row">
                      <label>Phone:</label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <span>{userProfile.phone || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Address:</label>
                      {isEditingProfile ? (
                        <textarea
                          value={editedProfile.address || ''}
                          onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                          placeholder="Enter address"
                          rows="3"
                        />
                      ) : (
                        <span>{userProfile.address || 'Not specified'}</span>
                      )}
                    </div>
                  </div>

                  {/* University & Position */}
                  <div className="profile-section-group">
                    <h4><i className="fas fa-university"></i> University & Position</h4>
                    
                    <div className="detail-row">
                      <label>Associated University:</label>
                      <span>{userProfile.university_name || 'Not specified'}</span>
                    </div>

                    <div className="detail-row">
                      <label>Position:</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.position || ''}
                          onChange={(e) => handleProfileFieldChange('position', e.target.value)}
                          placeholder="e.g., Professor, Associate Professor, Head of Department"
                        />
                      ) : (
                        <span>{userProfile.position || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Department:</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.department || ''}
                          onChange={(e) => handleProfileFieldChange('department', e.target.value)}
                          placeholder="Enter department"
                        />
                      ) : (
                        <span>{userProfile.department || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Years of Experience:</label>
                      {isEditingProfile ? (
                        <input
                          type="number"
                          value={editedProfile.years_experience || ''}
                          onChange={(e) => handleProfileFieldChange('years_experience', e.target.value)}
                          placeholder="Enter years of experience"
                          min="0"
                        />
                      ) : (
                        <span>{userProfile.years_experience || 'Not specified'} years</span>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="profile-section-group">
                    <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                    
                    <div className="detail-row">
                      <label>Highest Degree:</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.highest_degree || ''}
                          onChange={(e) => handleProfileFieldChange('highest_degree', e.target.value)}
                          placeholder="e.g., Ph.D., M.Tech, M.Sc"
                        />
                      ) : (
                        <span>{userProfile.highest_degree || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Field of Study:</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.field_of_study || ''}
                          onChange={(e) => handleProfileFieldChange('field_of_study', e.target.value)}
                          placeholder="e.g., Computer Science, Electronics"
                        />
                      ) : (
                        <span>{userProfile.field_of_study || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Institution:</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.institution || ''}
                          onChange={(e) => handleProfileFieldChange('institution', e.target.value)}
                          placeholder="University/Institution name"
                        />
                      ) : (
                        <span>{userProfile.institution || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Year of Completion:</label>
                      {isEditingProfile ? (
                        <input
                          type="number"
                          value={editedProfile.completion_year || ''}
                          onChange={(e) => handleProfileFieldChange('completion_year', e.target.value)}
                          placeholder="Year"
                          min="1950"
                          max="2030"
                        />
                      ) : (
                        <span>{userProfile.completion_year || 'Not specified'}</span>
                      )}
                    </div>
                  </div>

                  {/* Research & Publications */}
                  <div className="profile-section-group">
                    <h4><i className="fas fa-microscope"></i> Research & Publications</h4>
                    
                    <div className="detail-row">
                      <label>Research Papers Published:</label>
                      {isEditingProfile ? (
                        <input
                          type="number"
                          value={editedProfile.research_papers || ''}
                          onChange={(e) => handleProfileFieldChange('research_papers', e.target.value)}
                          placeholder="Number of research papers"
                          min="0"
                        />
                      ) : (
                        <span>{userProfile.research_papers || '0'} papers</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Research Areas:</label>
                      {isEditingProfile ? (
                        <textarea
                          value={editedProfile.research_areas || ''}
                          onChange={(e) => handleProfileFieldChange('research_areas', e.target.value)}
                          placeholder="e.g., Machine Learning, Data Science, IoT"
                          rows="3"
                        />
                      ) : (
                        <span>{userProfile.research_areas || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Publications:</label>
                      {isEditingProfile ? (
                        <textarea
                          value={editedProfile.publications || ''}
                          onChange={(e) => handleProfileFieldChange('publications', e.target.value)}
                          placeholder="List your key publications"
                          rows="4"
                        />
                      ) : (
                        <span>{userProfile.publications || 'No publications listed'}</span>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="profile-section-group">
                    <h4><i className="fas fa-project-diagram"></i> Projects</h4>
                    
                    <div className="detail-row">
                      <label>Projects Completed:</label>
                      {isEditingProfile ? (
                        <input
                          type="number"
                          value={editedProfile.projects_completed || ''}
                          onChange={(e) => handleProfileFieldChange('projects_completed', e.target.value)}
                          placeholder="Number of projects"
                          min="0"
                        />
                      ) : (
                        <span>{userProfile.projects_completed || '0'} projects</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Current Projects:</label>
                      {isEditingProfile ? (
                        <textarea
                          value={editedProfile.current_projects || ''}
                          onChange={(e) => handleProfileFieldChange('current_projects', e.target.value)}
                          placeholder="Describe your current projects"
                          rows="3"
                        />
                      ) : (
                        <span>{userProfile.current_projects || 'No current projects'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Project Experience:</label>
                      {isEditingProfile ? (
                        <textarea
                          value={editedProfile.project_experience || ''}
                          onChange={(e) => handleProfileFieldChange('project_experience', e.target.value)}
                          placeholder="Describe your project experience"
                          rows="4"
                        />
                      ) : (
                        <span>{userProfile.project_experience || 'No project experience listed'}</span>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="profile-section-group">
                    <h4><i className="fas fa-file-alt"></i> Additional Information</h4>
                    
                    <div className="detail-row">
                      <label>Bio:</label>
                      {isEditingProfile ? (
                        <textarea
                          value={editedProfile.bio || ''}
                          onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                          placeholder="Tell us about yourself"
                          rows="4"
                        />
                      ) : (
                        <span>{userProfile.bio || 'No bio available'}</span>
                      )}
                    </div>

                    <div className="detail-row">
                      <label>Status:</label>
                      <span className={`status-badge ${userProfile.approval_status || 'pending'}`}>
                        {userProfile.approval_status || 'Pending'}
                      </span>
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
          <div className="modal-overlay">
            <div className="opportunity-form-modal">
              <div className="modal-header">
                <h3>{opportunityForm.id ? 'Edit Opportunity' : 'Post New Opportunity'}</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => {
                    setShowOpportunityForm(false)
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
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form className="opportunity-form" onSubmit={(e) => { e.preventDefault(); opportunityForm.id ? handleUpdateOpportunity() : handlePostOpportunity(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Opportunity Type *</label>
                    <select 
                      value={opportunityForm.type}
                      onChange={(e) => handleOpportunityFieldChange('type', e.target.value)}
                      required
                    >
                      <option value="research_paper">Research Paper</option>
                      <option value="project">Project</option>
                      <option value="internship">Internship</option>
                      <option value="job">Job</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={opportunityForm.title}
                      onChange={(e) => handleOpportunityFieldChange('title', e.target.value)}
                      placeholder="Enter opportunity title"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={opportunityForm.description}
                    onChange={(e) => handleOpportunityFieldChange('description', e.target.value)}
                    placeholder="Describe the opportunity in detail"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Requirements</label>
                    <textarea
                      value={opportunityForm.requirements}
                      onChange={(e) => handleOpportunityFieldChange('requirements', e.target.value)}
                      placeholder="Skills, qualifications, etc."
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="date"
                      value={opportunityForm.deadline}
                      onChange={(e) => handleOpportunityFieldChange('deadline', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stipend/Salary</label>
                    <input
                      type="text"
                      value={opportunityForm.stipend}
                      onChange={(e) => handleOpportunityFieldChange('stipend', e.target.value)}
                      placeholder="e.g., $500/month, Competitive salary"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={opportunityForm.location}
                      onChange={(e) => handleOpportunityFieldChange('location', e.target.value)}
                      placeholder="e.g., Remote, On-campus, City"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={opportunityForm.duration}
                      onChange={(e) => handleOpportunityFieldChange('duration', e.target.value)}
                      placeholder="e.g., 3 months, 6 months, Full-time"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contact Email *</label>
                    <input
                      type="email"
                      value={opportunityForm.contact_email}
                      onChange={(e) => handleOpportunityFieldChange('contact_email', e.target.value)}
                      placeholder="Your email for applications"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={opportunityForm.contact_phone}
                    onChange={(e) => handleOpportunityFieldChange('contact_phone', e.target.value)}
                    placeholder="Optional phone number"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => {
                    setShowOpportunityForm(false)
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
                  }}>
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button type="submit" className="post-btn">
                    <i className="fas fa-paper-plane"></i>
                    {opportunityForm.id ? 'Update Opportunity' : 'Post Opportunity'}
                  </button>
                </div>
              </form>
            </div>
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
    </div>
  )
}

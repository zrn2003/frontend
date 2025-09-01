import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';
import './UniversityDashboard.css';

const UniversityDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditingUniversity, setIsEditingUniversity] = useState(false);
  const [editedUniversity, setEditedUniversity] = useState({});
  const profileRef = useRef();

  // Dashboard Data States
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [academicLeaders, setAcademicLeaders] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [academicLeaderRequests, setAcademicLeaderRequests] = useState([]);
  const [universityInfo, setUniversityInfo] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Keep sidebar always open - no responsive closing
  useEffect(() => {
    setSidebarOpen(true);
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle click outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Keep sidebar always open
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleUniversityEdit = () => {
    setIsEditingUniversity(true);
    setEditedUniversity({ ...universityInfo });
  };

  const handleUniversitySave = async () => {
    try {
      console.log('Saving university changes:', editedUniversity);
      
      // Call API to update university profile in database
      const response = await api.updateUniversityProfile(user?.university_id || 1, editedUniversity);
      
      // Update local state with the response from server
      if (response.university) {
        setUniversityInfo(response.university);
        setIsEditingUniversity(false);
        
        showNotification('University profile updated successfully!', 'success');
        console.log('University profile saved successfully:', response.university);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error updating university profile:', error);
      showNotification('Failed to update university profile. Please try again.', 'error');
    }
  };

  const handleUniversityCancel = () => {
    setIsEditingUniversity(false);
    setEditedUniversity({});
  };

  const handleUniversityFieldChange = (field, value) => {
    setEditedUniversity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get user's university_id or use default
      const universityId = user?.university_id || 1;
      
      console.log('Fetching dashboard data for university:', universityId);
      
      // Fetch all dashboard data
      const [statsData, studentsData, requestsData, universityData] = await Promise.all([
        api.getUniversityStats(universityId),
        api.getUniversityStudents(),
        api.getUniversityRegistrationRequests(universityId),
        api.getUniversityProfile(universityId)
      ]);

      console.log('Dashboard data received:', {
        stats: statsData,
        students: studentsData,
        requests: requestsData,
        university: universityData
      });

      setStats(statsData);
      setStudents(studentsData.students || []);
      setAcademicLeaders(studentsData.academicLeaders || []);
      
      // Filter requests by role and log the filtering
      const studentReqs = requestsData.requests?.filter(req => req.role === 'student') || [];
      const academicReqs = requestsData.requests?.filter(req => req.role === 'academic_leader') || [];
      
      console.log('Filtered requests:', {
        allRequests: requestsData.requests || [],
        studentRequests: studentReqs,
        academicRequests: academicReqs
      });
      
      setStudentRequests(studentReqs);
      setAcademicLeaderRequests(academicReqs);
      setUniversityInfo(universityData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to load dashboard data. Please try again.', 'error');
      
      // Set fallback data
      setStats({
        totalStudents: 0,
        totalAcademicLeaders: 0,
        pendingRequests: 0,
        activePrograms: 0
      });
      setStudents([]);
      setAcademicLeaders([]);
      setStudentRequests([]);
      setAcademicLeaderRequests([]);
      setUniversityInfo({
        name: 'University Name',
        domain: 'university.edu'
      });
      } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action, rejectionReason = '') => {
    try {
      console.log('=== REQUEST ACTION START ===');
      console.log('Handling request action:', { requestId, action, rejectionReason });
      console.log('Current student requests before action:', studentRequests.length);
      console.log('Current academic leader requests before action:', academicLeaderRequests.length);
      
      await api.updateRegistrationRequest(requestId, {
        action,
        rejection_reason: rejectionReason
      });
      
      console.log('API call successful, updating UI...');
      
      showNotification(`Request ${action}d successfully!`, 'success');
      
      // Immediately remove the request from both lists
      setStudentRequests(prev => {
        const filtered = prev.filter(req => req.id !== requestId);
        console.log('Updated student requests:', filtered.length);
        return filtered;
      });
      
      setAcademicLeaderRequests(prev => {
        const filtered = prev.filter(req => req.id !== requestId);
        console.log('Updated academic leader requests:', filtered.length);
        return filtered;
      });
      
      // Update stats immediately
      setStats(prev => {
        const newStats = {
          ...prev,
          pendingRequests: Math.max(0, (prev.pendingRequests || 0) - 1)
        };
        console.log('Updated stats:', newStats);
        return newStats;
      });
      
      console.log('=== REQUEST ACTION COMPLETE ===');
      
      // Refresh all data to ensure consistency
      setTimeout(() => {
        console.log('Refreshing dashboard data...');
        fetchDashboardData();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating request:', error);
      showNotification('Failed to update request. Please try again.', 'error');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profileData = await api.getUserProfile(user?.id || 1);
      setUserProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setEditedProfile(userProfile);
  };

  const handleProfileSave = async () => {
    try {
      console.log('Saving profile changes:', editedProfile);
      
      // Call API to update profile in database
      const updatedProfile = await api.updateUserProfile(user?.id || 1, editedProfile);
      
      // Update local state with the response from server
      setUserProfile(updatedProfile);
      setIsEditingProfile(false);
      
      // Update user context if needed
      if (user && user.id === (user?.id || 1)) {
        // Update the user context with new profile data
        localStorage.setItem('userData', JSON.stringify(updatedProfile));
      }
      
      showNotification('Profile updated successfully!', 'success');
      console.log('Profile saved successfully:', updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setEditedProfile(userProfile);
  };

  const handleProfileFieldChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewUserProfile = async (userId) => {
    try {
      console.log('=== VIEW USER PROFILE START ===');
      console.log('Fetching user profile for:', userId);
      console.log('Current user data:', user);
      console.log('User ID from localStorage:', localStorage.getItem('userData'));
      
      // Show loading state
      setSelectedUserProfile(null);
      setShowUserProfileModal(true);
      
      const profileData = await api.getUserProfile(userId);
      console.log('Profile data received:', profileData);
      
      if (profileData) {
        setSelectedUserProfile(profileData);
        console.log('Profile modal should be visible now');
      } else {
        console.error('No profile data received');
        showNotification('No profile data received', 'error');
        setShowUserProfileModal(false);
      }
    } catch (error) {
      console.error('=== VIEW USER PROFILE ERROR ===');
      console.error('Error fetching user profile:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      showNotification('Failed to load user profile. Please try again.', 'error');
      setShowUserProfileModal(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      console.log('Deleting user:', userToDelete);
      
      await api.deleteUser(userToDelete.id);
      
      showNotification(`User ${userToDelete.name} has been removed successfully.`, 'success');
      
      // Remove user from local state
      if (userToDelete.role === 'student') {
        setStudents(prev => prev.filter(student => student.id !== userToDelete.id));
      } else if (userToDelete.role === 'academic_leader') {
        setAcademicLeaders(prev => prev.filter(leader => leader.id !== userToDelete.id));
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalStudents: userToDelete.role === 'student' ? Math.max(0, prev.totalStudents - 1) : prev.totalStudents,
        totalAcademicLeaders: userToDelete.role === 'academic_leader' ? Math.max(0, prev.totalAcademicLeaders - 1) : prev.totalAcademicLeaders
      }));
      
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      
      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user. Please try again.', 'error');
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
  };

  // Test function to verify modal works
  const testUserProfileModal = () => {
    console.log('Testing user profile modal');
    const testProfile = {
      id: 999,
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      university_id: 4,
      approval_status: 'approved',
      is_active: 1,
      department: 'Computer Science',
      position: 'Student',
      phone: '+1234567890',
      address: '123 Test Street',
      join_date: '2024-01-01',
      university_name: 'Test University',
      university_domain: 'test.edu',
      registration_date: '2024-01-01T00:00:00.000Z',
      last_login: '2024-01-15T10:30:00.000Z',
      bio: 'This is a test user profile for testing purposes.'
    };
    setSelectedUserProfile(testProfile);
    setShowUserProfileModal(true);
  };

  const renderOverviewTab = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2><i className="fas fa-chart-line"></i> Dashboard Overview</h2>
      </div>
      
      <div className="dashboard-overview">
        <div className="welcome-section">
          <div className="welcome-header">
            <h3><i className="fas fa-sun"></i> Welcome back, {user?.name || 'Administrator'}!</h3>
            <p>Here's what's happening with your university today.</p>
          </div>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalStudents || 0}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          
          {/* Test button for user profile modal */}
          <div className="stat-card test" style={{ cursor: 'pointer' }} onClick={testUserProfileModal}>
            <div className="stat-icon">
              <i className="fas fa-flask"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">Test</div>
              <div className="stat-label">Profile Modal</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAcademicLeaders || 0}</div>
              <div className="stat-label">Academic Leaders</div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingRequests || 0}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activePrograms || 0}</div>
              <div className="stat-label">Active Programs</div>
          </div>
            </div>
          </div>
        
        <div className="recent-activity">
          <h4><i className="fas fa-history"></i> Recent Activity</h4>
          {studentRequests.length > 0 || academicLeaderRequests.length > 0 ? (
            <div className="activity-list">
              {studentRequests.slice(0, 3).map(request => (
                <div key={request.id} className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <div className="activity-content">
                    <p>New student registration request from <strong>{request.user_name}</strong></p>
                    <span className="activity-status pending">Pending Review</span>
                  </div>
                </div>
              ))}
              {academicLeaderRequests.slice(0, 3).map(request => (
                <div key={request.id} className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className="activity-content">
                    <p>New academic leader request from <strong>{request.user_name}</strong></p>
                    <span className="activity-status pending">Pending Review</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activity">
              <i className="fas fa-inbox"></i>
              <p>No recent activity</p>
                  </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2><i className="fas fa-user-graduate"></i> Students</h2>
        <span className="count-badge"><i className="fas fa-users"></i> {students.length} Students</span>
      </div>
      
      {students.length > 0 ? (
        <div className="data-table">
          <div className="table-header">
            <div className="header-cell"><i className="fas fa-user"></i> Name</div>
            <div className="header-cell"><i className="fas fa-envelope"></i> Email</div>
            <div className="header-cell"><i className="fas fa-university"></i> Department</div>
            <div className="header-cell"><i className="fas fa-cogs"></i> Actions</div>
          </div>
          <div className="table-body">
            {students.map(student => (
              <div key={student.id} className="table-row">
                <div className="table-cell">
                  <i className="fas fa-user-graduate"></i>
                  {student.name}
                </div>
                <div className="table-cell">
                  <i className="fas fa-envelope"></i>
                  {student.email}
                </div>
                <div className="table-cell">
                  <i className="fas fa-university"></i>
                  {student.institute_name || 'Not specified'}
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleViewUserProfile(student.id)}
                      title="View Profile"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(student)}
                      title="Delete Student"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                    </div>
                  ))}
                </div>
        </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-user-graduate"></i>
          <p>No students found</p>
        </div>
      )}
    </div>
  );

  const renderAcademicLeadersTab = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2><i className="fas fa-chalkboard-teacher"></i> Academic Leaders</h2>
        <span className="count-badge"><i className="fas fa-users"></i> {academicLeaders.length} Leaders</span>
      </div>
      
      {academicLeaders.length > 0 ? (
        <div className="data-table">
          <div className="table-header">
            <div className="header-cell"><i className="fas fa-user"></i> Name</div>
            <div className="header-cell"><i className="fas fa-envelope"></i> Email</div>
            <div className="header-cell"><i className="fas fa-university"></i> Department</div>
            <div className="header-cell"><i className="fas fa-cogs"></i> Actions</div>
          </div>
          <div className="table-body">
            {academicLeaders.map(leader => (
              <div key={leader.id} className="table-row">
                <div className="table-cell">
                  <i className="fas fa-chalkboard-teacher"></i>
                  {leader.name}
                </div>
                <div className="table-cell">
                  <i className="fas fa-envelope"></i>
                  {leader.email}
                </div>
                <div className="table-cell">
                  <i className="fas fa-university"></i>
                  {leader.institute_name || 'Not specified'}
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleViewUserProfile(leader.id)}
                      title="View Profile"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(leader)}
                      title="Delete Academic Leader"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                    </div>
                  ))}
                </div>
        </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-chalkboard-teacher"></i>
          <p>No academic leaders found</p>
        </div>
      )}
    </div>
  );

  const renderStudentRequestsTab = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2><i className="fas fa-user-plus"></i> Student Registration Requests</h2>
        <span className="count-badge"><i className="fas fa-clock"></i> {studentRequests.length} Pending</span>
                </div>
      
      {studentRequests.length > 0 ? (
        <div className="requests-grid">
          {studentRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-avatar">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="request-info">
                  <h4><i className="fas fa-user"></i> {request.user_name}</h4>
                  <p><i className="fas fa-envelope"></i> {request.user_email}</p>
                  <p><i className="fas fa-university"></i> {request.institute_name}</p>
                </div>
                <div className="request-status">
                  <span className="request-status-text">
                    <i className="fas fa-clock"></i> Pending
                  </span>
                </div>
                  </div>
              <div className="request-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => handleRequestAction(request.id, 'approve')}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleRequestAction(request.id, 'reject')}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
                  </div>
                </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-check-circle"></i>
          <p>No pending student requests</p>
        </div>
      )}
    </div>
  );

  const renderAcademicLeaderRequestsTab = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2><i className="fas fa-user-tie"></i> Academic Leader Registration Requests</h2>
        <span className="count-badge"><i className="fas fa-clock"></i> {academicLeaderRequests.length} Pending</span>
      </div>
      
      {academicLeaderRequests.length > 0 ? (
        <div className="requests-grid">
          {academicLeaderRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-avatar">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="request-info">
                  <h4><i className="fas fa-user"></i> {request.user_name}</h4>
                  <p><i className="fas fa-envelope"></i> {request.user_email}</p>
                  <p><i className="fas fa-university"></i> {request.institute_name}</p>
                      </div>
                                <div className="request-status">
                  <span className="request-status-text">
                    <i className="fas fa-clock"></i> Pending
                  </span>
                </div>
                      </div>
              <div className="request-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => handleRequestAction(request.id, 'approve')}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleRequestAction(request.id, 'reject')}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
                      </div>
                    </div>
                  ))}
                </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-check-circle"></i>
          <p>No pending academic leader requests</p>
        </div>
      )}
    </div>
  );

  const renderUniversityProfileTab = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h2><i className="fas fa-university"></i> University Profile</h2>
        <div className="section-actions">
          {!isEditingUniversity ? (
            <button className="btn btn-outline" onClick={handleUniversityEdit}>
              <i className="fas fa-edit"></i>
              Edit Profile
            </button>
          ) : (
            <>
              <button className="btn btn-success" onClick={handleUniversitySave}>
                <i className="fas fa-save"></i>
                Save
              </button>
              <button className="btn btn-outline" onClick={handleUniversityCancel}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </>
          )}
          <span className="count-badge"><i className="fas fa-info-circle"></i> {universityInfo.name || 'University'}</span>
        </div>
      </div>
      
      <div className="university-profile-content">
        <div className="university-header">
          <div className="university-avatar">
            <i className="fas fa-university"></i>
          </div>
          <div className="university-info">
            {isEditingUniversity ? (
              <>
                <input
                  type="text"
                  className="university-edit-input"
                  value={editedUniversity.name || ''}
                  onChange={(e) => handleUniversityFieldChange('name', e.target.value)}
                  placeholder="Enter university name"
                />
                <input
                  type="text"
                  className="university-edit-input"
                  value={editedUniversity.domain || ''}
                  onChange={(e) => handleUniversityFieldChange('domain', e.target.value)}
                  placeholder="Enter domain"
                />
                <textarea
                  className="university-edit-textarea"
                  value={editedUniversity.address || ''}
                  onChange={(e) => handleUniversityFieldChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows="2"
                />
                <div className="university-status">
                  <label className="university-checkbox">
                    <input
                      type="checkbox"
                      checked={editedUniversity.is_active || false}
                      onChange={(e) => handleUniversityFieldChange('is_active', e.target.checked)}
                    />
                    <span>Active University</span>
                  </label>
                  <input
                    type="number"
                    className="university-edit-input"
                    value={editedUniversity.established_year || ''}
                    onChange={(e) => handleUniversityFieldChange('established_year', e.target.value)}
                    placeholder="Established year"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </>
            ) : (
              <>
                <h3><i className="fas fa-university"></i> {universityInfo.name || 'University Name'}</h3>
                <p className="university-domain"><i className="fas fa-globe"></i> {universityInfo.domain || 'university.edu'}</p>
                <p className="university-address"><i className="fas fa-map-marker-alt"></i> {universityInfo.address || 'Address not specified'}</p>
                <div className="university-status">
                  <span className="university-status-text">
                    <i className={`fas ${universityInfo.is_active ? 'fa-check-circle' : 'fa-pause-circle'}`}></i>
                    {universityInfo.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="established-year">
                    <i className="fas fa-calendar-alt"></i> Established: {universityInfo.established_year || 'Not specified'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="university-stats-grid">
          <div className="stat-item">
            <div className="stat-number"><i className="fas fa-user-graduate"></i> {stats.totalStudents || 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-number"><i className="fas fa-chalkboard-teacher"></i> {stats.totalAcademicLeaders || 0}</div>
            <div className="stat-label">Academic Leaders</div>
          </div>
          <div className="stat-item">
            <div className="stat-number"><i className="fas fa-clock"></i> {stats.pendingRequests || 0}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-item">
            <div className="stat-number"><i className="fas fa-graduation-cap"></i> {stats.activePrograms || 0}</div>
            <div className="stat-label">Active Programs</div>
          </div>
        </div>
        
        <div className="university-details">
          <div className="detail-section">
            <h4><i className="fas fa-address-book"></i> Contact Information</h4>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-envelope"></i> Email:</span>
              {isEditingUniversity ? (
                <input
                  type="email"
                  className="university-edit-input"
                  value={editedUniversity.contact_email || ''}
                  onChange={(e) => handleUniversityFieldChange('contact_email', e.target.value)}
                  placeholder="Enter contact email"
                />
              ) : (
                <span className="detail-value">{universityInfo.contact_email || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-phone"></i> Phone:</span>
              {isEditingUniversity ? (
                <input
                  type="tel"
                  className="university-edit-input"
                  value={editedUniversity.contact_phone || ''}
                  onChange={(e) => handleUniversityFieldChange('contact_phone', e.target.value)}
                  placeholder="Enter contact phone"
                />
              ) : (
                <span className="detail-value">{universityInfo.contact_phone || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-globe"></i> Website:</span>
              {isEditingUniversity ? (
                <input
                  type="url"
                  className="university-edit-input"
                  value={editedUniversity.website || ''}
                  onChange={(e) => handleUniversityFieldChange('website', e.target.value)}
                  placeholder="Enter website URL"
                />
              ) : (
                <span className="detail-value">
                  {universityInfo.website ? (
                    <a href={universityInfo.website} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-external-link-alt"></i> {universityInfo.website}
                    </a>
                  ) : 'Not specified'}
                </span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-map-marker-alt"></i> Address:</span>
              {isEditingUniversity ? (
                <textarea
                  className="university-edit-textarea"
                  value={editedUniversity.address || ''}
                  onChange={(e) => handleUniversityFieldChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows="2"
                />
              ) : (
                <span className="detail-value">{universityInfo.address || 'Not specified'}</span>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h4><i className="fas fa-info-circle"></i> University Information</h4>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-university"></i> Name:</span>
              {isEditingUniversity ? (
                <input
                  type="text"
                  className="university-edit-input"
                  value={editedUniversity.name || ''}
                  onChange={(e) => handleUniversityFieldChange('name', e.target.value)}
                  placeholder="Enter university name"
                />
              ) : (
                <span className="detail-value">{universityInfo.name || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-globe"></i> Domain:</span>
              {isEditingUniversity ? (
                <input
                  type="text"
                  className="university-edit-input"
                  value={editedUniversity.domain || ''}
                  onChange={(e) => handleUniversityFieldChange('domain', e.target.value)}
                  placeholder="Enter domain"
                />
              ) : (
                <span className="detail-value">{universityInfo.domain || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-calendar-alt"></i> Established:</span>
              {isEditingUniversity ? (
                <input
                  type="number"
                  className="university-edit-input"
                  value={editedUniversity.established_year || ''}
                  onChange={(e) => handleUniversityFieldChange('established_year', e.target.value)}
                  placeholder="Enter established year"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              ) : (
                <span className="detail-value">{universityInfo.established_year || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-check-circle"></i> Status:</span>
              {isEditingUniversity ? (
                <label className="university-checkbox">
                  <input
                    type="checkbox"
                    checked={editedUniversity.is_active || false}
                    onChange={(e) => handleUniversityFieldChange('is_active', e.target.checked)}
                  />
                  <span>Active University</span>
                </label>
              ) : (
                <span className="detail-value">
                  {/* <span className={`status-badge ${universityInfo.is_active ? 'approved' : 'inactive'}`}>
                    <i className={`fas ${universityInfo.is_active ? 'fa-check' : 'fa-pause'}`}></i>
                    {universityInfo.is_active ? 'Active' : 'Inactive'}
                  </span> */}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="university-additional-info">
          <div className="detail-section">
            <h4><i className="fas fa-chart-bar"></i> Academic Statistics</h4>
            <div className="stats-row">
              <div className="stat-card-mini">
                <div className="stat-number-mini"><i className="fas fa-user-graduate"></i> {stats.totalStudents || 0}</div>
                <div className="stat-label-mini">Enrolled Students</div>
              </div>
              <div className="stat-card-mini">
                <div className="stat-number-mini"><i className="fas fa-chalkboard-teacher"></i> {stats.totalAcademicLeaders || 0}</div>
                <div className="stat-label-mini">Faculty Members</div>
              </div>
              <div className="stat-card-mini">
                <div className="stat-number-mini"><i className="fas fa-graduation-cap"></i> {stats.activePrograms || 0}</div>
                <div className="stat-label-mini">Degree Programs</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4><i className="fas fa-cogs"></i> Administrative Information</h4>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-calendar-plus"></i> Registration Date:</span>
              <span className="detail-value">
                {universityInfo.created_at ? new Date(universityInfo.created_at).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-edit"></i> Last Updated:</span>
              <span className="detail-value">
                {universityInfo.updated_at ? new Date(universityInfo.updated_at).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-id-card"></i> University ID:</span>
              <span className="detail-value">{universityInfo.id || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              {/* <span className="detail-label"><i className="fas fa-award"></i> Accreditation Status:</span>
              {isEditingUniversity ? (
                // <select
                //   className="university-edit-input"
                //   value={editedUniversity.accreditation_status || 'pending'}
                //   onChange={(e) => handleUniversityFieldChange('accreditation_status', e.target.value)}
                // >
                //   <option value="pending">Pending</option>
                //   <option value="accredited">Accredited</option>
                //   <option value="provisional">Provisional</option>
                // </select>
              ) : (
                <span className="detail-value">
                  <span className="accreditation-status-text">
                    <i className={`fas ${universityInfo.accreditation_status === 'accredited' ? 'fa-check' : universityInfo.accreditation_status === 'provisional' ? 'fa-clock' : 'fa-clock'}`}></i>
                    {universityInfo.accreditation_status ? universityInfo.accreditation_status.charAt(0).toUpperCase() + universityInfo.accreditation_status.slice(1) : 'Pending'}
                  </span>
                </span>
              )} */}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-users"></i> Student Capacity:</span>
              {isEditingUniversity ? (
                <input
                  type="number"
                  className="university-edit-input"
                  value={editedUniversity.student_capacity || ''}
                  onChange={(e) => handleUniversityFieldChange('student_capacity', e.target.value)}
                  placeholder="Enter student capacity"
                  min="1"
                />
              ) : (
                <span className="detail-value">{universityInfo.student_capacity || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label"><i className="fas fa-graduation-cap"></i> Program Types:</span>
              {isEditingUniversity ? (
                <input
                  type="text"
                  className="university-edit-input"
                  value={editedUniversity.program_types || ''}
                  onChange={(e) => handleUniversityFieldChange('program_types', e.target.value)}
                  placeholder="e.g., Undergraduate, Graduate, PhD"
                />
              ) : (
                <span className="detail-value">{universityInfo.program_types || 'Not specified'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileModal = () => (
    <div className={`profile-modal ${showProfileModal ? 'show' : ''}`}>
      <div className="modal-overlay" onClick={() => setShowProfileModal(false)}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Employee Profile</h2>
          <div className="modal-actions">
            {!isEditingProfile ? (
              <button className="btn btn-outline" onClick={handleProfileEdit}>
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            ) : (
              <>
                <button className="btn btn-success" onClick={handleProfileSave}>
                  <i className="fas fa-save"></i>
                  Save
                </button>
                <button className="btn btn-outline" onClick={handleProfileCancel}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
          </>
        )}
            <button className="modal-close" onClick={() => setShowProfileModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {userProfile ? (
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar-large">
                <i className="fas fa-user"></i>
              </div>
              <div className="profile-info-main">
                {isEditingProfile ? (
                  <input
                    type="text"
                    className="profile-edit-input"
                    value={editedProfile.name || ''}
                    onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                    placeholder="Enter name"
                  />
                ) : (
                  <h3>{userProfile.name || user?.name || 'User'}</h3>
                )}
                <p className="profile-title">{userProfile.position || 'University Administrator'}</p>
                <p className="profile-department">{userProfile.department || 'University Administration'}</p>
              </div>
            </div>
            
            <div className="profile-details-grid">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      className="profile-edit-input"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  ) : (
                    <span className="detail-value">{userProfile.email || user?.email || 'Not specified'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      className="profile-edit-input"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                      placeholder="Enter phone"
                    />
                  ) : (
                    <span className="detail-value">{userProfile.phone || 'Not specified'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  {isEditingProfile ? (
                    <textarea
                      className="profile-edit-textarea"
                      value={editedProfile.address || ''}
                      onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                      placeholder="Enter address"
                      rows="2"
                    />
                  ) : (
                    <span className="detail-value">{userProfile.address || 'Not specified'}</span>
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Professional Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Position:</span>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="profile-edit-input"
                      value={editedProfile.position || ''}
                      onChange={(e) => handleProfileFieldChange('position', e.target.value)}
                      placeholder="Enter position"
                    />
                  ) : (
                    <span className="detail-value">{userProfile.position || 'University Administrator'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="profile-edit-input"
                      value={editedProfile.department || ''}
                      onChange={(e) => handleProfileFieldChange('department', e.target.value)}
                      placeholder="Enter department"
                    />
                  ) : (
                    <span className="detail-value">{userProfile.department || 'University Administration'}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Join Date:</span>
                  <span className="detail-value">
                    {userProfile.join_date ? new Date(userProfile.join_date).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">
                    <span className="role-text">
                      {userProfile.role || 'University Admin'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {isEditingProfile && (
              <div className="profile-edit-section">
                <h4>Additional Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Bio:</span>
                  <textarea
                    className="profile-edit-textarea"
                    value={editedProfile.bio || ''}
                    onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                    placeholder="Enter bio"
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-loading">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading profile data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserProfileModal = () => (
    <div className={`user-profile-modal ${showUserProfileModal ? 'show' : ''}`}>
      <div className="modal-overlay" onClick={() => setShowUserProfileModal(false)}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>User Profile</h2>
          <div className="modal-actions">
            <button className="modal-close" onClick={() => setShowUserProfileModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {selectedUserProfile ? (
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar-large">
                <i className="fas fa-user"></i>
              </div>
              <div className="profile-info-main">
                <h3><i className="fas fa-user"></i> {selectedUserProfile.name || 'User'}</h3>
                <p className="profile-title"><i className="fas fa-briefcase"></i> {selectedUserProfile.position || 'Not specified'}</p>
                <p className="profile-department"><i className="fas fa-building"></i> {selectedUserProfile.department || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="profile-details-grid">
              <div className="detail-section">
                <h4><i className="fas fa-address-card"></i> Personal Information</h4>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-envelope"></i> Email:</span>
                  <span className="detail-value">{selectedUserProfile.email || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-phone"></i> Phone:</span>
                  <span className="detail-value">{selectedUserProfile.phone || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-map-marker-alt"></i> Address:</span>
                  <span className="detail-value">{selectedUserProfile.address || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-university"></i> University:</span>
                  <span className="detail-value">{selectedUserProfile.university_name || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4><i className="fas fa-briefcase"></i> Professional Information</h4>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-user-tie"></i> Position:</span>
                  <span className="detail-value">{selectedUserProfile.position || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-building"></i> Department:</span>
                  <span className="detail-value">{selectedUserProfile.department || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-calendar-plus"></i> Join Date:</span>
                  <span className="detail-value">
                    {selectedUserProfile.join_date ? new Date(selectedUserProfile.join_date).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-user-shield"></i> Role:</span>
                  <span className="detail-value">
                    <span className="role-text">
                      <i className={`fas ${selectedUserProfile.role === 'student' ? 'fa-user-graduate' : selectedUserProfile.role === 'academic_leader' ? 'fa-chalkboard-teacher' : 'fa-user'}`}></i>
                      {selectedUserProfile.role || 'User'}
                    </span>
                  </span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4><i className="fas fa-info-circle"></i> Account Status</h4>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-check-circle"></i> Approval Status:</span>
                  <span className="detail-value">
                    <span className="approval-status-text">
                      <i className={`fas ${selectedUserProfile.approval_status === 'approved' ? 'fa-check' : selectedUserProfile.approval_status === 'rejected' ? 'fa-times' : 'fa-clock'}`}></i>
                      {selectedUserProfile.approval_status || 'Pending'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-toggle-on"></i> Account Status:</span>
                  <span className="detail-value">
                    <span className="account-status-text">
                      <i className={`fas ${selectedUserProfile.is_active ? 'fa-check' : 'fa-times'}`}></i>
                      {selectedUserProfile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-calendar-alt"></i> Registration Date:</span>
                  <span className="detail-value">
                    {selectedUserProfile.registration_date ? new Date(selectedUserProfile.registration_date).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-sign-in-alt"></i> Last Login:</span>
                  <span className="detail-value">
                    {selectedUserProfile.last_login ? new Date(selectedUserProfile.last_login).toLocaleString() : 'Never logged in'}
                  </span>
                </div>
              </div>
            </div>

            {selectedUserProfile.bio && (
              <div className="profile-edit-section">
                <h4><i className="fas fa-file-alt"></i> Additional Information</h4>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-quote-left"></i> Bio:</span>
                  <span className="detail-value">{selectedUserProfile.bio}</span>
                </div>
              </div>
            )}

            {/* Education Section */}
            {selectedUserProfile.education_details && selectedUserProfile.education_details.length > 0 && (
              <div className="profile-section">
                <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                <div className="education-list">
                  {selectedUserProfile.education_details.map((edu, index) => (
                    <div key={index} className="education-item">
                      <div className="education-header">
                        <h5>{edu.degree}</h5>
                        <span className="education-status-text">
                          <i className={`fas ${edu.is_current ? 'fa-clock' : 'fa-check'}`}></i>
                          {edu.is_current ? 'Current' : 'Completed'}
                        </span>
                      </div>
                      <p className="institution"><i className="fas fa-university"></i> {edu.institution}</p>
                      <p className="field"><i className="fas fa-book"></i> {edu.field_of_study}</p>
                      <div className="education-details">
                        <span><i className="fas fa-calendar"></i> {new Date(edu.start_date).getFullYear()} - {edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}</span>
                        {edu.grade && <span><i className="fas fa-star"></i> Grade: {edu.grade}</span>}
                      </div>
                      {edu.description && <p className="description">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {selectedUserProfile.experience_details && selectedUserProfile.experience_details.length > 0 && (
              <div className="profile-section">
                <h4><i className="fas fa-briefcase"></i> Work Experience</h4>
                <div className="experience-list">
                  {selectedUserProfile.experience_details.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <div className="experience-header">
                        <h5>{exp.title}</h5>
                        <span className="experience-status-text">
                          <i className={`fas ${exp.is_current ? 'fa-clock' : 'fa-check'}`}></i>
                          {exp.is_current ? 'Current' : 'Completed'}
                        </span>
                      </div>
                      <p className="company"><i className="fas fa-building"></i> {exp.company}</p>
                      {exp.location && <p className="location"><i className="fas fa-map-marker-alt"></i> {exp.location}</p>}
                      <div className="experience-details">
                        <span><i className="fas fa-calendar"></i> {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}</span>
                      </div>
                      <p className="description">{exp.description}</p>
                      {exp.achievements && <p className="achievements"><strong>Achievements:</strong> {exp.achievements}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedUserProfile.skills_details && selectedUserProfile.skills_details.length > 0 && (
              <div className="profile-section">
                <h4><i className="fas fa-tools"></i> Skills</h4>
                <div className="skills-grid">
                  {selectedUserProfile.skills_details.map((skill, index) => (
                    <div key={index} className={`skill-item ${skill.skill_category}`}>
                      <div className="skill-header">
                        <h5>{skill.skill_name}</h5>
                        <span className={`proficiency-badge ${skill.proficiency_level}`}>
                          <i className="fas fa-star"></i>
                          {skill.proficiency_level}
                        </span>
                      </div>
                      <p className="skill-category"><i className="fas fa-tag"></i> {skill.skill_category}</p>
                      {skill.years_of_experience && <p className="experience"><i className="fas fa-clock"></i> {skill.years_of_experience} years</p>}
                      {skill.description && <p className="description">{skill.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {selectedUserProfile.projects_details && selectedUserProfile.projects_details.length > 0 && (
              <div className="profile-section">
                <h4><i className="fas fa-project-diagram"></i> Projects</h4>
                <div className="projects-grid">
                  {selectedUserProfile.projects_details.map((project, index) => (
                    <div key={index} className="project-item">
                      <div className="project-header">
                        <h5>{project.project_name}</h5>
                        <span className="project-status-text">
                          <i className={`fas ${project.is_current ? 'fa-clock' : 'fa-check'}`}></i>
                          {project.is_current ? 'Ongoing' : 'Completed'}
                        </span>
                      </div>
                      <p className="project-type"><i className="fas fa-tag"></i> {project.project_type}</p>
                      <p className="description">{project.description}</p>
                      {project.technologies_used && (
                        <p className="technologies"><i className="fas fa-code"></i> <strong>Technologies:</strong> {project.technologies_used}</p>
                      )}
                      <div className="project-details">
                        {project.start_date && <span><i className="fas fa-calendar"></i> {new Date(project.start_date).toLocaleDateString()} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Present'}</span>}
                      </div>
                      <div className="project-links">
                        {project.project_url && (
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="project-link">
                            <i className="fas fa-external-link-alt"></i> Live Demo
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="project-link">
                            <i className="fab fa-github"></i> GitHub
                          </a>
                        )}
                      </div>
                      {project.achievements && <p className="achievements"><strong>Achievements:</strong> {project.achievements}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-loading">
            <div className="mini-loader">
              <div className="mini-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <p>Loading user profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeleteConfirmModal = () => (
    <div className={`delete-confirm-modal ${showDeleteConfirmModal ? 'show' : ''}`}>
      <div className="modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={cancelDeleteUser}>
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDeleteUser}>
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete <strong>{userToDelete?.name || 'this user'}</strong>? This action cannot be undone.</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="professional-loader">
          <div className="loader-content">
            <div className="loader-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Loading University Dashboard</h3>
            <p>Please wait while we fetch your data...</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
    </div>
    );
  }

  return (
    <div className={`university-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {notification && (
        <div className={`notification ${notification.type}`}>
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="notification-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      {/* Mobile Overlay - Disabled to keep sidebar always open */}
      <div 
        className="sidebar-overlay"
        style={{display: 'none'}}
      ></div>
      
      {/* Modern Sidebar */}
      <aside className="sidebar open">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <span className="logo-text">TrustTeams</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => handleTabChange('students')}
          >
            <i className="fas fa-user-graduate"></i>
            <span>Students</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'academic-leaders' ? 'active' : ''}`}
            onClick={() => handleTabChange('academic-leaders')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            <span>Academic Leaders</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'student-requests' ? 'active' : ''}`}
            onClick={() => handleTabChange('student-requests')}
          >
            <i className="fas fa-user-plus"></i>
            <span>Student Requests</span>
            {studentRequests.length > 0 && (
              <span className="notification-badge">{studentRequests.length}</span>
            )}
          </button>
          
          <button
            className={`nav-item ${activeTab === 'academic-leader-requests' ? 'active' : ''}`}
            onClick={() => handleTabChange('academic-leader-requests')}
          >
            <i className="fas fa-user-tie"></i>
            <span>Academic Leader Requests</span>
            {academicLeaderRequests.length > 0 && (
              <span className="notification-badge">{academicLeaderRequests.length}</span>
            )}
          </button>
          
          <button
            className={`nav-item ${activeTab === 'university-profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('university-profile')}
          >
            <i className="fas fa-university"></i>
            <span>University Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="theme-toggle"
            onClick={handleThemeToggle}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            <div className="toggle-switch">
              <div className="toggle-slider"></div>
            </div>
          </button>
          
          <button 
            className="logout-button"
            onClick={logout}
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content sidebar-open">
        <div className="content-header">
          <div className="header-left">
            <h1>{universityInfo.name || 'University Dashboard'}</h1>
            <p style={{color: '#8969b1'}}>Manage students, academic leaders, and registration requests</p>
          </div>
          <div className="header-right">
            {/* Mobile menu toggle removed - sidebar always stays open */}
          </div>
        </div>

        <div className="content-body">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'students' && renderStudentsTab()}
          {activeTab === 'academic-leaders' && renderAcademicLeadersTab()}
          {activeTab === 'student-requests' && renderStudentRequestsTab()}
          {activeTab === 'academic-leader-requests' && renderAcademicLeaderRequestsTab()}
          {activeTab === 'university-profile' && renderUniversityProfileTab()}
        </div>
      </main>

      {renderProfileModal()}
      {renderUserProfileModal()}
      {renderDeleteConfirmModal()}
    </div>
  );
};

export default UniversityDashboard;


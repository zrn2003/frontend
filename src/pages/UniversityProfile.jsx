import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';
import './UniversityProfile.css';

const UniversityProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchUniversityData();
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const fetchUniversityData = async () => {
    setLoading(true);
    try {
      // Fetch university profile data
      const profileData = await api.getUniversityProfile(user?.university_id || 1);
      setProfile(profileData);

      // Set stats from profile data
      setStats(profileData.stats || {});

      // Set requests from profile data
      setRequests(profileData.requests || []);

    } catch (error) {
      console.error('Error fetching university data:', error);
      showNotification('Failed to load university data. Please try again.', 'error');
      
      // Set fallback data
      setProfile({
        id: user?.university_id || 1,
        name: 'University Name',
        domain: 'university.edu',
        address: 'University Address',
        website: 'https://university.edu',
        contact_email: 'contact@university.edu',
        contact_phone: '+1-555-123-4567',
        established_year: 2020,
        is_active: true
      });
      
      setStats({
        totalStudents: 0,
        totalAcademicLeaders: 0,
        pendingRequests: 0,
        activePrograms: 0
      });
      
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action, rejectionReason = '') => {
    try {
      console.log('Updating registration request:', { requestId, action, rejectionReason });
      
      const response = await api.updateRegistrationRequest(requestId, {
        action,
        rejection_reason: rejectionReason
      });
      
      console.log('Update response:', response);
      
      showNotification(`Request ${action}d successfully!`, 'success');
      
      // Refresh data after action
      fetchUniversityData();
    } catch (error) {
      console.error('Error updating request:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      let errorMessage = 'Failed to update request. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const debugUserInfo = async () => {
    try {
      console.log('Debugging user info...');
      const userInfo = await api.getDebugUserInfo();
      console.log('User info:', userInfo);
      showNotification('User info logged to console. Check browser console for details.', 'success');
    } catch (error) {
      console.error('Debug error:', error);
      showNotification('Debug failed. Check console for details.', 'error');
    }
  };

  const renderOverviewTab = () => (
    <div className="profile-overview">
      <div className="university-header">
        <div className="university-avatar">
          <i className="fas fa-university"></i>
        </div>
        <div className="university-info">
          <h1>{profile?.name || 'University Name'}</h1>
          <p className="university-domain">{profile?.domain || 'university.edu'}</p>
          <p className="university-description">{profile?.description || 'University description'}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalStudents?.toLocaleString() || '0'}</h3>
            <p>Total Students</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalAcademicLeaders?.toLocaleString() || '0'}</h3>
            <p>Academic Leaders</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingRequests?.toLocaleString() || '0'}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activePrograms?.toLocaleString() || '0'}</h3>
            <p>Active Programs</p>
          </div>
        </div>
      </div>

      <div className="university-details">
        <div className="detail-section">
          <h3>University Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Established:</span>
              <span className="detail-value">{profile?.established_year || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Website:</span>
              <span className="detail-value">
                <a href={profile?.website} target="_blank" rel="noopener noreferrer">
                  {profile?.website || 'N/A'}
                </a>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Email:</span>
              <span className="detail-value">{profile?.contact_email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Phone:</span>
              <span className="detail-value">{profile?.contact_phone || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{profile?.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="requests-section">
      <div className="section-header">
        <h2>Registration Requests</h2>
        <span className="request-count">{requests.length} total requests</span>
      </div>
      
      {requests.length === 0 ? (
        <div className="no-requests">
          <i className="fas fa-check-circle"></i>
          <p>No pending registration requests</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-user">
                  <div className="user-avatar">
                    <i className={`fas fa-${request.role === 'student' ? 'user-graduate' : 'user-tie'}`}></i>
                  </div>
                  <div className="user-info">
                    <h4>{request.user_name}</h4>
                    <p>{request.user_email}</p>
                    <span className="user-role">{request.role === 'student' ? 'Student' : 'Academic Leader'}</span>
                  </div>
                </div>
                <div className="request-date">
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Institute:</span>
                  <span className="detail-value">{request.institute_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Request Date:</span>
                  <span className="detail-value">{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleRequestAction(request.id, 'approve')}
                  >
                    <i className="fas fa-check"></i>
                    Approve
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleRequestAction(request.id, 'reject', 'Request rejected by university admin')}
                  >
                    <i className="fas fa-times"></i>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>University Settings</h2>
      </div>
      
      <div className="settings-form">
        <div className="form-group">
          <label>University Name</label>
          <input 
            type="text" 
            value={profile?.name || ''} 
            placeholder="University Name"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label>Domain</label>
          <input 
            type="text" 
            value={profile?.domain || ''} 
            placeholder="university.edu"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label>Contact Email</label>
          <input 
            type="email" 
            value={profile?.contact_email || ''} 
            placeholder="contact@university.edu"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label>Contact Phone</label>
          <input 
            type="tel" 
            value={profile?.contact_phone || ''} 
            placeholder="+1-555-123-4567"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label>Address</label>
          <textarea 
            value={profile?.address || ''} 
            placeholder="University Address"
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            value={profile?.description || ''} 
            placeholder="University description"
            readOnly
          />
        </div>
        
        <div className="form-actions">
          <button className="btn btn-primary" disabled>
            <i className="fas fa-edit"></i>
            Edit Settings (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="university-profile">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading university profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="university-profile">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="notification-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="profile-header">
        <div className="header-content">
          <div>
            <h1>University Profile</h1>
            <p>Manage university information and registration requests</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={debugUserInfo}>
              <i className="fas fa-bug"></i>
              Debug User Info
            </button>
            <button className="btn btn-outline" onClick={() => window.history.back()}>
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-line"></i>
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <i className="fas fa-user-plus"></i>
          Registration Requests
          {requests.length > 0 && (
            <span className="request-badge">{requests.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog"></i>
          Settings
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default UniversityProfile;

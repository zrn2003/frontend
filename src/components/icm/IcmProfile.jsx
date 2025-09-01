import React, { useState, useEffect } from 'react';
import { api } from '../../config/api.js';
import './IcmProfile.css';

const IcmProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalUniversities: 0,
    totalStudents: 0,
    totalOpportunities: 0,
    totalPartnerships: 0,
    activeOpportunities: 0,
    completedProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    specialization: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    address: '',
    description: '',
    establishedYear: '',
    employeeCount: '',
    annualRevenue: ''
  });

  useEffect(() => {
    fetchProfileData();
    fetchIndustryStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
      setProfile(userData);
      
      // Set form data with existing profile info
      setFormData({
        companyName: userData.companyName || '',
        industry: userData.industry || '',
        specialization: userData.specialization || '',
        contactEmail: userData.email || '',
        contactPhone: userData.phone || '',
        website: userData.website || '',
        address: userData.address || '',
        description: userData.description || '',
        establishedYear: userData.establishedYear || '',
        employeeCount: userData.employeeCount || '',
        annualRevenue: userData.annualRevenue || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustryStats = async () => {
    try {
      const response = await api.getIcmStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching industry stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically update the profile via API
      // For now, we'll just update local storage
      const updatedProfile = { ...profile, ...formData };
      localStorage.setItem('userData', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const renderProfileSection = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-industry"></i>
        </div>
        <div className="profile-info">
          <h2>{profile?.name || 'Industry Manager'}</h2>
          <p className="profile-role">Industry Collaboration Manager</p>
          <p className="profile-company">{formData.companyName || 'Company Name'}</p>
        </div>
        <button 
          className="btn btn-primary edit-btn"
          onClick={() => setEditing(!editing)}
        >
          <i className="fas fa-edit"></i>
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>
            
            <div className="form-group">
              <label>Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="consulting">Consulting</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., AI, Data Science, Software Development"
              />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Enter contact email"
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="Enter contact phone"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://company.com"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter company address"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Established Year</label>
              <input
                type="number"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleInputChange}
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label>Employee Count</label>
              <select
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleInputChange}
              >
                <option value="">Select Range</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>

            <div className="form-group">
              <label>Annual Revenue</label>
              <select
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleInputChange}
              >
                <option value="">Select Range</option>
                <option value="<1M">Less than $1M</option>
                <option value="1M-10M">$1M - $10M</option>
                <option value="10M-50M">$10M - $50M</option>
                <option value="50M-100M">$50M - $100M</option>
                <option value="100M-500M">$100M - $500M</option>
                <option value="500M+">$500M+</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Company Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your company, mission, and focus areas..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save"></i>
              Save Changes
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="details-grid">
            <div className="detail-item">
              <label>Company Name</label>
              <p>{formData.companyName || 'Not specified'}</p>
            </div>
            
            <div className="detail-item">
              <label>Industry</label>
              <p>{formData.industry || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Specialization</label>
              <p>{formData.specialization || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Contact Email</label>
              <p>{formData.contactEmail || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Contact Phone</label>
              <p>{formData.contactPhone || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Website</label>
              <p>
                {formData.website ? (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer">
                    {formData.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>

            <div className="detail-item full-width">
              <label>Address</label>
              <p>{formData.address || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Established Year</label>
              <p>{formData.establishedYear || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Employee Count</label>
              <p>{formData.employeeCount || 'Not specified'}</p>
            </div>

            <div className="detail-item">
              <label>Annual Revenue</label>
              <p>{formData.annualRevenue || 'Not specified'}</p>
            </div>

            <div className="detail-item full-width">
              <label>Company Description</label>
              <p>{formData.description || 'No description provided'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIndustryStats = () => (
    <div className="industry-stats-section">
      <h3>Industry Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-university"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.totalUniversities}</h4>
            <p>Partner Universities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.totalStudents.toLocaleString()}</h4>
            <p>Students Engaged</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.totalOpportunities}</h4>
            <p>Total Opportunities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-handshake"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.totalPartnerships}</h4>
            <p>Active Partnerships</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.activeOpportunities}</h4>
            <p>Active Opportunities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.completedProjects || 0}</h4>
            <p>Completed Projects</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentActivity = () => (
    <div className="recent-activity-section">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon">
            <i className="fas fa-plus"></i>
          </div>
          <div className="activity-content">
            <h4>New Opportunity Posted</h4>
            <p>Software Developer Internship at TechCorp</p>
            <span className="activity-time">2 hours ago</span>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-icon">
            <i className="fas fa-handshake"></i>
          </div>
          <div className="activity-content">
            <h4>Partnership Established</h4>
            <p>New collaboration with IIT Delhi</p>
            <span className="activity-time">1 day ago</span>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="activity-content">
            <h4>Student Application Approved</h4>
            <p>15 applications approved for Data Science project</p>
            <span className="activity-time">3 days ago</span>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="activity-content">
            <h4>Monthly Report Generated</h4>
            <p>August 2024 industry collaboration report</p>
            <span className="activity-time">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="icm-profile-container">
      <div className="profile-header-section">
        <h1>ICM Profile</h1>
        <p>Manage your industry collaboration profile and view industry statistics</p>
      </div>

      <div className="profile-content">
        <div className="main-content">
          {renderProfileSection()}
          {renderIndustryStats()}
        </div>
        
        <div className="sidebar-content">
          {renderRecentActivity()}
        </div>
      </div>
    </div>
  );
};

export default IcmProfile;

import React, { useState, useEffect } from 'react';
import './IcmDashboard.css';

const IcmDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activePartnerships: 0,
    totalStudents: 0,
    completedProjects: 0
  });

  useEffect(() => {
    // Simulate loading stats with counter animation
    const timer = setTimeout(() => {
      setStats({
        totalOpportunities: 45,
        activePartnerships: 12,
        totalStudents: 2340,
        completedProjects: 89
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const renderOverviewTab = () => (
    <div className="icm-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalOpportunities}</h3>
            <p>Active Opportunities</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-handshake"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activePartnerships}</h3>
            <p>Active Partnerships</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalStudents.toLocaleString()}</h3>
            <p>Students Engaged</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.completedProjects}</h3>
            <p>Completed Projects</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-row">
          <div className="content-card">
            <h3>Recent Opportunities</h3>
            <div className="opportunities-list">
              <div className="opportunity-item">
                <div className="opportunity-header">
                  <h4>Software Developer Intern</h4>
                  <span className="opportunity-status active">Active</span>
                </div>
                <p>Looking for talented computer science students for summer internship</p>
                <div className="opportunity-meta">
                  <span><i className="fas fa-map-marker-alt"></i> Remote</span>
                  <span><i className="fas fa-clock"></i> 3 months</span>
                  <span><i className="fas fa-users"></i> 5 positions</span>
                </div>
              </div>
              
              <div className="opportunity-item">
                <div className="opportunity-header">
                  <h4>Data Science Project</h4>
                  <span className="opportunity-status active">Active</span>
                </div>
                <p>Collaborative project with university for data analysis</p>
                <div className="opportunity-meta">
                  <span><i className="fas fa-map-marker-alt"></i> Hybrid</span>
                  <span><i className="fas fa-clock"></i> 6 months</span>
                  <span><i className="fas fa-users"></i> 3 positions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn">
                <i className="fas fa-plus"></i>
                Post Opportunity
              </button>
              <button className="action-btn">
                <i className="fas fa-handshake"></i>
                New Partnership
              </button>
              <button className="action-btn">
                <i className="fas fa-users"></i>
                View Students
              </button>
              <button className="action-btn">
                <i className="fas fa-chart-bar"></i>
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpportunitiesTab = () => (
    <div className="icm-opportunities">
      <div className="section-header">
        <h2>Manage Opportunities</h2>
        <button className="btn btn-primary">
          <i className="fas fa-plus"></i>
          Post New Opportunity
        </button>
      </div>
      
      <div className="opportunities-grid">
        <div className="opportunity-card">
          <div className="opportunity-header">
            <h3>Software Developer Intern</h3>
            <span className="status active">Active</span>
          </div>
          <div className="opportunity-details">
            <p><strong>Duration:</strong> 3 months</p>
            <p><strong>Location:</strong> Remote</p>
            <p><strong>Positions:</strong> 5</p>
            <p><strong>Applications:</strong> 23</p>
          </div>
          <div className="opportunity-actions">
            <button className="btn btn-sm btn-outline">View Applications</button>
            <button className="btn btn-sm btn-outline">Edit</button>
            <button className="btn btn-sm btn-danger">Close</button>
          </div>
        </div>
        
        <div className="opportunity-card">
          <div className="opportunity-header">
            <h3>Data Science Project</h3>
            <span className="status active">Active</span>
          </div>
          <div className="opportunity-details">
            <p><strong>Duration:</strong> 6 months</p>
            <p><strong>Location:</strong> Hybrid</p>
            <p><strong>Positions:</strong> 3</p>
            <p><strong>Applications:</strong> 15</p>
          </div>
          <div className="opportunity-actions">
            <button className="btn btn-sm btn-outline">View Applications</button>
            <button className="btn btn-sm btn-outline">Edit</button>
            <button className="btn btn-sm btn-danger">Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPartnershipsTab = () => (
    <div className="icm-partnerships">
      <div className="section-header">
        <h2>Partnerships</h2>
        <button className="btn btn-primary">
          <i className="fas fa-plus"></i>
          New Partnership
        </button>
      </div>
      
      <div className="partnerships-table">
        <table>
          <thead>
            <tr>
              <th>Partner Name</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Projects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TechCorp Inc.</td>
              <td>Internship Program</td>
              <td>Jan 2024</td>
              <td><span className="status active">Active</span></td>
              <td>12</td>
              <td>
                <button className="btn btn-sm btn-outline">View</button>
                <button className="btn btn-sm btn-outline">Edit</button>
              </td>
            </tr>
            <tr>
              <td>DataFlow Solutions</td>
              <td>Research Project</td>
              <td>Mar 2024</td>
              <td><span className="status active">Active</span></td>
              <td>3</td>
              <td>
                <button className="btn btn-sm btn-outline">View</button>
                <button className="btn btn-sm btn-outline">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="icm-dashboard">
      <div className="dashboard-header">
        <h1>Industry Partner Dashboard</h1>
        <p>Welcome to the Industry/Corporate Management Panel</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          Opportunities
        </button>
        <button
          className={`tab-btn ${activeTab === 'partnerships' ? 'active' : ''}`}
          onClick={() => setActiveTab('partnerships')}
        >
          Partnerships
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'opportunities' && renderOpportunitiesTab()}
        {activeTab === 'partnerships' && renderPartnershipsTab()}
      </div>
    </div>
  );
};

export default IcmDashboard;

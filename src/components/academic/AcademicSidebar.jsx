import React from 'react';
import './AcademicSidebar.css';

const AcademicSidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'students', label: 'Students', icon: 'fas fa-user-graduate' },
    { id: 'faculty', label: 'Faculty', icon: 'fas fa-chalkboard-teacher' },
    { id: 'courses', label: 'Courses', icon: 'fas fa-book' },
    { id: 'partnerships', label: 'Partnerships', icon: 'fas fa-handshake' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { id: 'institute', label: 'Institute Profile', icon: 'fas fa-university' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
  ];

  return (
    <aside className="academic-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-graduation-cap"></i>
          <span className="logo-text">Academic Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
              >
                <i className={item.icon}></i>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-details">
            <p className="user-name">Academic Leader</p>
            <p className="user-role">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AcademicSidebar;

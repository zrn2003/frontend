import React from 'react';
import './PlatformAdminSidebar.css';

const PlatformAdminSidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'server-health', label: 'Server Health', icon: '🖥️' },
    { id: 'user-permissions', label: 'User Permissions', icon: '👥' },
    { id: 'system-upgrades', label: 'System Upgrades', icon: '🔄' },
    { id: 'security-patches', label: 'Security Patches', icon: '🔒' },
    { id: 'audit-logs', label: 'Audit Logs', icon: '📝' },
    { id: 'compliance', label: 'Compliance', icon: '📋' },
    { id: 'incident-alerts', label: 'Incident Alerts', icon: '🚨' }
  ];

  return (
    <aside className="platform-admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">⚙️</div>
          <div className="logo-text">
            <div className="logo-title">Platform Admin</div>
            <div className="logo-subtitle">System Management</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Administration</div>
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <div className="avatar-initial">A</div>
          </div>
          <div className="user-details">
            <div className="user-name">Administrator</div>
            <div className="user-role">System Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PlatformAdminSidebar;

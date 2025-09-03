import React, { useState, useEffect } from 'react'
import './IncidentAlertManager.css'

const IncidentAlertManager = () => {
  const [incidents, setIncidents] = useState([])
  const [alertSettings, setAlertSettings] = useState({
    email: true,
    sms: false,
    push: true,
    slack: true,
    criticalOnly: false
  })
  const [notificationHistory, setNotificationHistory] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadIncidents()
    loadNotificationHistory()
  }, [])

  const loadIncidents = () => {
    setIncidents([
      {
        id: 1,
        title: 'Database Connection Failure',
        description: 'Primary database connection lost, switching to backup',
        severity: 'critical',
        status: 'active',
        component: 'Database',
        discoveredAt: '2025-09-03T15:45:00Z',
        assignedTo: 'admin@trustteams.com',
        priority: 'high',
        impact: 'High - Users cannot access data',
        resolution: 'Investigating connection pool issues',
        notifications: ['email', 'push', 'slack']
      },
      {
        id: 2,
        title: 'High CPU Usage Alert',
        description: 'Server CPU usage exceeded 90% threshold',
        severity: 'warning',
        status: 'resolved',
        component: 'Server Infrastructure',
        discoveredAt: '2025-09-03T14:20:00Z',
        resolvedAt: '2025-09-03T14:45:00Z',
        assignedTo: 'admin@trustteams.com',
        priority: 'medium',
        impact: 'Medium - Performance degradation',
        resolution: 'Scaling up server resources',
        notifications: ['email', 'push']
      },
      {
        id: 3,
        title: 'Security Breach Attempt',
        description: 'Multiple failed login attempts detected',
        severity: 'critical',
        status: 'investigating',
        component: 'Authentication',
        discoveredAt: '2025-09-03T13:15:00Z',
        assignedTo: 'security@trustteams.com',
        priority: 'high',
        impact: 'High - Potential security threat',
        resolution: 'Blocking suspicious IP addresses',
        notifications: ['email', 'sms', 'push', 'slack']
      }
    ])
  }

  const loadNotificationHistory = () => {
    setNotificationHistory([
      {
        id: 1,
        incidentId: 1,
        type: 'email',
        recipient: 'admin@trustteams.com',
        sentAt: '2025-09-03T15:45:30Z',
        status: 'delivered',
        content: 'Critical: Database Connection Failure'
      },
      {
        id: 2,
        incidentId: 1,
        type: 'push',
        recipient: 'admin@trustteams.com',
        sentAt: '2025-09-03T15:45:35Z',
        status: 'delivered',
        content: '🚨 Critical Incident: Database Connection Failure'
      },
      {
        id: 3,
        incidentId: 1,
        type: 'slack',
        recipient: '#alerts',
        sentAt: '2025-09-03T15:45:40Z',
        status: 'delivered',
        content: 'Critical incident reported in #alerts'
      }
    ])
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical'
      case 'high': return 'severity-high'
      case 'medium': return 'severity-medium'
      case 'low': return 'severity-low'
      default: return 'severity-unknown'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'investigating': return 'status-investigating'
      case 'resolved': return 'status-resolved'
      case 'closed': return 'status-closed'
      default: return 'status-unknown'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-unknown'
    }
  }

  const createIncident = (incidentData) => {
    const newIncident = {
      id: Date.now(),
      ...incidentData,
      status: 'active',
      discoveredAt: new Date().toISOString(),
      assignedTo: 'admin@trustteams.com'
    }
    
    setIncidents(prev => [newIncident, ...prev])
    
    // Send notifications based on settings
    sendNotifications(newIncident)
    
    setShowCreateModal(false)
  }

  const sendNotifications = (incident) => {
    const notifications = []
    
    if (alertSettings.email) {
      notifications.push({
        id: Date.now(),
        incidentId: incident.id,
        type: 'email',
        recipient: 'admin@trustteams.com',
        sentAt: new Date().toISOString(),
        status: 'sending',
        content: `${incident.severity.toUpperCase()}: ${incident.title}`
      })
    }
    
    if (alertSettings.push) {
      notifications.push({
        id: Date.now() + 1,
        incidentId: incident.id,
        type: 'push',
        recipient: 'admin@trustteams.com',
        sentAt: new Date().toISOString(),
        status: 'sending',
        content: `🚨 ${incident.severity.toUpperCase()}: ${incident.title}`
      })
    }
    
    if (alertSettings.slack) {
      notifications.push({
        id: Date.now() + 2,
        incidentId: incident.id,
        type: 'slack',
        recipient: '#alerts',
        sentAt: new Date().toISOString(),
        status: 'sending',
        content: `New ${incident.severity} incident: ${incident.title}`
      })
    }
    
    setNotificationHistory(prev => [...notifications, ...prev])
    
    // Simulate notification delivery
    notifications.forEach(notification => {
      setTimeout(() => {
        setNotificationHistory(prev => prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: 'delivered' }
            : n
        ))
      }, 2000)
    })
  }

  const updateIncidentStatus = (incidentId, newStatus) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: newStatus,
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : incident.resolvedAt
          }
        : incident
    ))
  }

  const testNotification = (type) => {
    const testIncident = {
      id: 'test',
      title: 'Test Notification',
      description: 'This is a test notification to verify the alert system',
      severity: 'low',
      status: 'active'
    }
    
    sendNotifications(testIncident)
  }

  return (
    <div className="incident-alert-manager">
      <div className="manager-header">
        <h2>🚨 Incident Alert Manager</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Create Incident
          </button>
          <button className="btn btn-secondary" onClick={() => testNotification('email')}>
            📧 Test Email
          </button>
        </div>
      </div>

      <div className="alert-settings">
        <h3>🔔 Alert Settings</h3>
        <div className="settings-grid">
          <label className="setting-item">
            <input
              type="checkbox"
              checked={alertSettings.email}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, email: e.target.checked }))}
            />
            <span>Email Notifications</span>
          </label>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={alertSettings.sms}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, sms: e.target.checked }))}
            />
            <span>SMS Notifications</span>
          </label>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={alertSettings.push}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, push: e.target.checked }))}
            />
            <span>Push Notifications</span>
          </label>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={alertSettings.slack}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, slack: e.target.checked }))}
            />
            <span>Slack Notifications</span>
          </label>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={alertSettings.criticalOnly}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, criticalOnly: e.target.checked }))}
            />
            <span>Critical Incidents Only</span>
          </label>
        </div>
      </div>

      <div className="incidents-section">
        <h3>Active Incidents ({incidents.filter(i => i.status === 'active').length})</h3>
        <div className="incidents-list">
          {incidents.map(incident => (
            <div key={incident.id} className={`incident-card ${getSeverityColor(incident.severity)}`}>
              <div className="incident-header">
                <h4>{incident.title}</h4>
                <div className="incident-badges">
                  <span className={`severity-badge ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`status-badge ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                  <span className={`priority-badge ${getPriorityColor(incident.priority)}`}>
                    {incident.priority}
                  </span>
                </div>
              </div>
              
              <p className="incident-description">{incident.description}</p>
              
              <div className="incident-meta">
                <div className="meta-row">
                  <span className="meta-item">
                    🔧 Component: {incident.component}
                  </span>
                  <span className="meta-item">
                    👤 Assigned: {incident.assignedTo}
                  </span>
                  <span className="meta-item">
                    📅 Discovered: {new Date(incident.discoveredAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="meta-row">
                  <span className="meta-item">
                    💥 Impact: {incident.impact}
                  </span>
                  <span className="meta-item">
                    🔍 Resolution: {incident.resolution}
                  </span>
                </div>
              </div>
              
              <div className="incident-actions">
                {incident.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                    >
                      🔍 Investigate
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                    >
                      ✅ Resolve
                    </button>
                  </>
                )}
                
                {incident.status === 'investigating' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                  >
                    ✅ Resolve
                  </button>
                )}
                
                <button className="btn btn-secondary">
                  📝 Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="notifications-section">
        <h3>Notification History ({notificationHistory.length})</h3>
        <div className="notifications-list">
          {notificationHistory.map(notification => (
            <div key={notification.id} className="notification-item">
              <div className="notification-info">
                <div className="notification-type">
                  {notification.type === 'email' && '📧'}
                  {notification.type === 'sms' && '📱'}
                  {notification.type === 'push' && '📱'}
                  {notification.type === 'slack' && '💬'}
                  {notification.type}
                </div>
                <div className="notification-content">
                  <span className="notification-text">{notification.content}</span>
                  <span className="notification-recipient">→ {notification.recipient}</span>
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {new Date(notification.sentAt).toLocaleString()}
                  </span>
                  <span className={`notification-status ${notification.status}`}>
                    {notification.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Incident</h3>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p>Incident creation form would go here...</p>
              <button 
                className="btn btn-primary"
                onClick={() => createIncident({
                  title: 'Test Incident',
                  description: 'This is a test incident',
                  severity: 'medium',
                  component: 'System',
                  priority: 'medium',
                  impact: 'Low - System monitoring',
                  resolution: 'Under investigation'
                })}
              >
                Create Test Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IncidentAlertManager

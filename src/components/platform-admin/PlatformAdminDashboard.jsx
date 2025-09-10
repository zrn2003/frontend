import React, { useState, useEffect } from 'react'
import './PlatformAdminDashboard.css'
import PlatformAdminSidebar from './PlatformAdminSidebar'
import ServerHealthMonitor from './ServerHealthMonitor'
import UserPermissionsManager from './UserPermissionsManager'
import SystemUpgradeManager from './SystemUpgradeManager'
import SecurityPatchManager from './SecurityPatchManager'
import ComplianceReporter from './ComplianceReporter'
import IncidentAlertManager from './IncidentAlertManager'
import AuditLogViewer from './AuditLogViewer'

const PlatformAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [systemStatus, setSystemStatus] = useState({
    overall: 'healthy',
    servers: 'operational',
    database: 'connected',
    email: 'configured',
    security: 'up-to-date'
  })
  const [notifications, setNotifications] = useState([])
  const [userCount, setUserCount] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial dashboard data
    fetchDashboardData()
    
    // Set up real-time monitoring
    const interval = setInterval(fetchSystemStatus, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSystemStatus(),
        fetchUserCounts(),
        fetchNotifications()
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/system-status')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      // Fallback to mock data if API fails
      setSystemStatus(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }))
    }
  }

  const fetchUserCounts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/user-stats')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUserCount({
        total: data.total || 0,
        active: data.active || 0,
        pending: data.pending || 0,
        suspended: data.suspended || 0
      })
    } catch (error) {
      console.error('Failed to fetch user counts:', error)
      // Fallback to mock data if API fails
      setUserCount({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0
      })
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/notifications')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Fallback to mock data if API fails
      setNotifications([
        {
          id: 1,
          type: 'warning',
          message: 'Database connection pool reaching capacity',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          read: false
        },
        {
          id: 2,
          type: 'info',
          message: 'Security patch deployment completed successfully',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          read: true
        }
      ])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'connected':
      case 'configured':
        return '#10b981'
      case 'warning':
      case 'degraded':
        return '#f59e0b'
      case 'critical':
      case 'disconnected':
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'connected':
      case 'configured':
        return '✓'
      case 'warning':
      case 'degraded':
        return '⚠'
      case 'critical':
      case 'disconnected':
      case 'error':
        return '✗'
      default:
        return '?'
    }
  }

  const renderOverview = () => (
    <div className="overview-section">
      <div className="overview-header">
        <h2>System Overview</h2>
        <p className="last-updated">
          Last updated: {systemStatus.lastUpdated ? new Date(systemStatus.lastUpdated).toLocaleString() : 'Never'}
        </p>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="card-header">
            <h3>System Status</h3>
            <span className={`status-badge ${systemStatus.overall}`}>
              {getStatusIcon(systemStatus.overall)} {systemStatus.overall}
            </span>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <span>Servers</span>
              <span className={`status ${systemStatus.servers}`}>
                {getStatusIcon(systemStatus.servers)} {systemStatus.servers}
              </span>
            </div>
            <div className="status-item">
              <span>Database</span>
              <span className={`status ${systemStatus.database}`}>
                {getStatusIcon(systemStatus.database)} {systemStatus.database}
              </span>
            </div>
            <div className="status-item">
              <span>Email</span>
              <span className={`status ${systemStatus.email}`}>
                {getStatusIcon(systemStatus.email)} {systemStatus.email}
              </span>
            </div>
            <div className="status-item">
              <span>Security</span>
              <span className={`status ${systemStatus.security}`}>
                {getStatusIcon(systemStatus.security)} {systemStatus.security}
              </span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>User Statistics</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{userCount.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userCount.active}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userCount.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userCount.suspended}</div>
              <div className="stat-label">Suspended</div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>Recent Notifications</h3>
          </div>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-content">
                    <span className="notification-message">{notification.message}</span>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {!notification.read && <span className="unread-indicator">•</span>}
                </div>
              ))
            ) : (
              <p className="no-notifications">No recent notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'server-health':
        return <ServerHealthMonitor />
      case 'user-permissions':
        return <UserPermissionsManager />
      case 'system-upgrades':
        return <SystemUpgradeManager />
      case 'security-patches':
        return <SecurityPatchManager />
      case 'audit-logs':
        return <AuditLogViewer />
      case 'compliance':
        return <ComplianceReporter />
      case 'incident-alerts':
        return <IncidentAlertManager />
      default:
        return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="platform-admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="platform-admin-dashboard">
      <PlatformAdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <main className="dashboard-main">
        {/* Simple Header */}
        <header className="admin-header">
          <div className="header-container">
            <div className="header-left">
              <h1 className="dashboard-title">Platform Administration</h1>
              <p className="dashboard-subtitle">System Management & Monitoring</p>
            </div>
            <div className="header-right">
              <div className="header-actions">
                <button className="header-btn primary">
                  <span>🚨</span>
                  Send Alert
                </button>
                <button className="header-btn secondary">
                  <span>📊</span>
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default PlatformAdminDashboard

import React, { useState, useEffect } from 'react'
import './SystemUpgradeManager.css'

const SystemUpgradeManager = () => {
  const [upgrades, setUpgrades] = useState([])
  const [currentVersion, setCurrentVersion] = useState('2.1.4')
  const [availableUpgrades, setAvailableUpgrades] = useState([])
  const [deploymentProgress, setDeploymentProgress] = useState({})
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedUpgrade, setSelectedUpgrade] = useState(null)

  useEffect(() => {
    loadUpgrades()
    loadAvailableUpgrades()
  }, [])

  const loadUpgrades = () => {
    setUpgrades([
      {
        id: 1,
        version: '2.2.0',
        name: 'Performance Enhancement Update',
        description: 'Major performance improvements and bug fixes',
        type: 'major',
        status: 'completed',
        scheduledDate: '2025-09-01T10:00:00Z',
        completedDate: '2025-09-01T11:30:00Z',
        deploymentStrategy: 'rolling',
        affectedUsers: 1250,
        rollbackPlan: 'Available',
        changelog: [
          'Improved database query performance by 40%',
          'Enhanced user authentication security',
          'Fixed 15 critical bugs',
          'Added new admin dashboard features'
        ]
      },
      {
        id: 2,
        version: '2.1.5',
        name: 'Security Patch Update',
        description: 'Critical security vulnerabilities fix',
        type: 'patch',
        status: 'in-progress',
        scheduledDate: '2025-09-03T14:00:00Z',
        completedDate: null,
        deploymentStrategy: 'immediate',
        affectedUsers: 1250,
        rollbackPlan: 'Available',
        changelog: [
          'Fixed SQL injection vulnerability',
          'Updated authentication tokens',
          'Enhanced input validation'
        ]
      },
      {
        id: 3,
        version: '2.2.1',
        name: 'Feature Update',
        description: 'New features and minor improvements',
        type: 'minor',
        status: 'scheduled',
        scheduledDate: '2025-09-05T09:00:00Z',
        completedDate: null,
        deploymentStrategy: 'staged',
        affectedUsers: 1250,
        rollbackPlan: 'Available',
        changelog: [
          'Added advanced reporting tools',
          'Improved mobile responsiveness',
          'Enhanced notification system'
        ]
      }
    ])
  }

  const loadAvailableUpgrades = () => {
    setAvailableUpgrades([
      {
        version: '2.3.0',
        name: 'Next Generation Update',
        description: 'Complete UI overhaul and new features',
        type: 'major',
        size: '45.2 MB',
        estimatedTime: '2 hours',
        compatibility: '100%',
        breakingChanges: ['API v2 deprecated', 'New database schema'],
        features: [
          'Modern React 18 components',
          'Advanced analytics dashboard',
          'Real-time collaboration tools',
          'Enhanced mobile app'
        ]
      },
      {
        version: '2.2.2',
        name: 'Bug Fix Update',
        description: 'Critical bug fixes and stability improvements',
        type: 'patch',
        size: '12.8 MB',
        estimatedTime: '45 minutes',
        compatibility: '100%',
        breakingChanges: [],
        features: [
          'Fixed user session timeout issues',
          'Resolved email delivery problems',
          'Improved error handling'
        ]
      }
    ])
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'in-progress': return 'status-in-progress'
      case 'scheduled': return 'status-scheduled'
      case 'failed': return 'status-failed'
      default: return 'status-unknown'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'major': return 'type-major'
      case 'minor': return 'type-minor'
      case 'patch': return 'type-patch'
      default: return 'type-default'
    }
  }

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'rolling': return 'strategy-rolling'
      case 'staged': return 'strategy-staged'
      case 'immediate': return 'strategy-immediate'
      default: return 'strategy-default'
    }
  }

  const scheduleUpgrade = (upgrade) => {
    const newUpgrade = {
      id: Date.now(),
      ...upgrade,
      status: 'scheduled',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      completedDate: null
    }
    setUpgrades(prev => [...prev, newUpgrade])
    setShowUpgradeModal(false)
  }

  const startDeployment = (upgradeId) => {
    setUpgrades(prev => prev.map(upgrade => 
      upgrade.id === upgradeId 
        ? { ...upgrade, status: 'in-progress' }
        : upgrade
    ))
    
    // Simulate deployment progress
    setDeploymentProgress(prev => ({
      ...prev,
      [upgradeId]: 0
    }))
    
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        const current = prev[upgradeId] || 0
        if (current >= 100) {
          clearInterval(interval)
          // Mark upgrade as completed
          setUpgrades(prev => prev.map(upgrade => 
            upgrade.id === upgradeId 
              ? { ...upgrade, status: 'completed', completedDate: new Date().toISOString() }
              : upgrade
          ))
          return prev
        }
        return { ...prev, [upgradeId]: current + 10 }
      })
    }, 1000)
  }

  const rollbackUpgrade = (upgradeId) => {
    if (window.confirm('Are you sure you want to rollback this upgrade? This will revert all changes.')) {
      setUpgrades(prev => prev.map(upgrade => 
        upgrade.id === upgradeId 
          ? { ...upgrade, status: 'rolled-back' }
          : upgrade
      ))
    }
  }

  const cancelUpgrade = (upgradeId) => {
    if (window.confirm('Are you sure you want to cancel this upgrade?')) {
      setUpgrades(prev => prev.filter(upgrade => upgrade.id !== upgradeId))
    }
  }

  return (
    <div className="system-upgrade-manager">
      <div className="manager-header">
        <h2>🔄 System Upgrade Manager</h2>
        <div className="version-info">
          <span className="current-version">Current Version: {currentVersion}</span>
        </div>
      </div>

      <div className="upgrade-sections">
        {/* Available Upgrades */}
        <div className="available-upgrades-section">
          <h3>📦 Available Upgrades ({availableUpgrades.length})</h3>
          <div className="upgrades-grid">
            {availableUpgrades.map(upgrade => (
              <div key={upgrade.version} className="upgrade-card available">
                <div className="upgrade-header">
                  <h4>{upgrade.name}</h4>
                  <span className={`version-badge ${getTypeColor(upgrade.type)}`}>
                    v{upgrade.version}
                  </span>
                </div>
                <p className="upgrade-description">{upgrade.description}</p>
                <div className="upgrade-details">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className={`detail-value ${getTypeColor(upgrade.type)}`}>
                      {upgrade.type.charAt(0).toUpperCase() + upgrade.type.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{upgrade.size}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Est. Time:</span>
                    <span className="detail-value">{upgrade.estimatedTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Compatibility:</span>
                    <span className="detail-value">{upgrade.compatibility}</span>
                  </div>
                </div>
                
                {upgrade.breakingChanges.length > 0 && (
                  <div className="breaking-changes">
                    <h5>⚠️ Breaking Changes:</h5>
                    <ul>
                      {upgrade.breakingChanges.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="upgrade-features">
                  <h5>🚀 New Features:</h5>
                  <ul>
                    {upgrade.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="upgrade-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => scheduleUpgrade(upgrade)}
                  >
                    📅 Schedule Upgrade
                  </button>
                  <button className="btn btn-secondary">
                    📋 View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled and Active Upgrades */}
        <div className="active-upgrades-section">
          <h3>📋 Upgrade History & Status ({upgrades.length})</h3>
          <div className="upgrades-list">
            {upgrades.map(upgrade => (
              <div key={upgrade.id} className={`upgrade-item ${getStatusColor(upgrade.status)}`}>
                <div className="upgrade-info">
                  <div className="upgrade-main">
                    <h4>{upgrade.name}</h4>
                    <span className={`version-badge ${getTypeColor(upgrade.type)}`}>
                      v{upgrade.version}
                    </span>
                    <span className={`status-badge ${getStatusColor(upgrade.status)}`}>
                      {upgrade.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="upgrade-description">{upgrade.description}</p>
                  <div className="upgrade-meta">
                    <span className="meta-item">
                      📅 Scheduled: {new Date(upgrade.scheduledDate).toLocaleString()}
                    </span>
                    <span className="meta-item">
                      🎯 Strategy: <span className={getStrategyColor(upgrade.deploymentStrategy)}>
                        {upgrade.deploymentStrategy}
                      </span>
                    </span>
                    <span className="meta-item">
                      👥 Users: {upgrade.affectedUsers}
                    </span>
                    {upgrade.completedDate && (
                      <span className="meta-item">
                        ✅ Completed: {new Date(upgrade.completedDate).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {upgrade.status === 'in-progress' && (
                  <div className="deployment-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${deploymentProgress[upgrade.id] || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {deploymentProgress[upgrade.id] || 0}% Complete
                    </span>
                  </div>
                )}
                
                <div className="upgrade-actions">
                  {upgrade.status === 'scheduled' && (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={() => startDeployment(upgrade.id)}
                      >
                        🚀 Start Deployment
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => cancelUpgrade(upgrade.id)}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}
                  
                  {upgrade.status === 'completed' && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => rollbackUpgrade(upgrade.id)}
                    >
                      🔄 Rollback
                    </button>
                  )}
                  
                  <button className="btn btn-secondary">
                    📋 View Changelog
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedUpgrade && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule Upgrade: {selectedUpgrade.name}</h3>
              <button onClick={() => setShowUpgradeModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p>Upgrade scheduling modal would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemUpgradeManager

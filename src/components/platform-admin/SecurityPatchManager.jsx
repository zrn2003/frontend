import React, { useState, useEffect } from 'react'
import './SecurityPatchManager.css'

const SecurityPatchManager = () => {
  const [securityPatches, setSecurityPatches] = useState([])
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [deploymentQueue, setDeploymentQueue] = useState([])
  const [scanStatus, setScanStatus] = useState('idle')
  const [autoDeploy, setAutoDeploy] = useState(true)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = () => {
    setSecurityPatches([
      {
        id: 1,
        name: 'SQL Injection Protection',
        description: 'Enhanced input validation and prepared statements',
        severity: 'critical',
        cve: 'CVE-2025-001',
        affectedComponents: ['Database Layer', 'API Endpoints'],
        patchSize: '2.1 MB',
        deploymentTime: '15 minutes',
        status: 'deployed',
        deployedAt: '2025-09-03T08:00:00Z',
        rollbackAvailable: true
      },
      {
        id: 2,
        name: 'Authentication Token Security',
        description: 'Updated JWT implementation with enhanced security',
        severity: 'high',
        cve: 'CVE-2025-002',
        affectedComponents: ['Authentication System'],
        patchSize: '1.8 MB',
        deploymentTime: '10 minutes',
        status: 'pending',
        deployedAt: null,
        rollbackAvailable: true
      },
      {
        id: 3,
        name: 'XSS Protection Update',
        description: 'Enhanced content sanitization and CSP headers',
        severity: 'medium',
        cve: 'CVE-2025-003',
        affectedComponents: ['Frontend', 'Content Management'],
        patchSize: '3.2 MB',
        deploymentTime: '25 minutes',
        status: 'available',
        deployedAt: null,
        rollbackAvailable: true
      }
    ])

    setVulnerabilities([
      {
        id: 1,
        title: 'Cross-Site Scripting (XSS)',
        severity: 'high',
        cve: 'CVE-2025-004',
        description: 'Potential XSS vulnerability in user input fields',
        affectedComponent: 'User Profile Forms',
        discoveredAt: '2025-09-03T12:00:00Z',
        status: 'patched',
        riskScore: 8.5
      },
      {
        id: 2,
        title: 'SQL Injection Risk',
        severity: 'critical',
        cve: 'CVE-2025-005',
        description: 'SQL injection vulnerability in search functionality',
        affectedComponent: 'Search API',
        discoveredAt: '2025-09-03T10:30:00Z',
        status: 'investigating',
        riskScore: 9.2
      },
      {
        id: 3,
        title: 'Authentication Bypass',
        severity: 'medium',
        cve: 'CVE-2025-006',
        description: 'Potential authentication bypass in admin panel',
        affectedComponent: 'Admin Dashboard',
        discoveredAt: '2025-09-03T14:15:00Z',
        status: 'open',
        riskScore: 6.8
      }
    ])

    setDeploymentQueue([
      {
        id: 1,
        patchId: 2,
        scheduledAt: '2025-09-03T16:00:00Z',
        priority: 'high',
        status: 'queued'
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
      case 'deployed': return 'status-deployed'
      case 'pending': return 'status-pending'
      case 'available': return 'status-available'
      case 'failed': return 'status-failed'
      default: return 'status-unknown'
    }
  }

  const startVulnerabilityScan = () => {
    setScanStatus('scanning')
    // Simulate scan progress
    setTimeout(() => {
      setScanStatus('completed')
      // Add new vulnerabilities found
      setVulnerabilities(prev => [...prev, {
        id: Date.now(),
        title: 'New Vulnerability Detected',
        severity: 'medium',
        cve: 'CVE-2025-007',
        description: 'Automated scan discovered new security issue',
        affectedComponent: 'System Components',
        discoveredAt: new Date().toISOString(),
        status: 'open',
        riskScore: 7.1
      }])
    }, 3000)
  }

  const deployPatch = (patchId) => {
    setSecurityPatches(prev => prev.map(patch => 
      patch.id === patchId 
        ? { ...patch, status: 'deploying' }
        : patch
    ))

    // Simulate deployment
    setTimeout(() => {
      setSecurityPatches(prev => prev.map(patch => 
        patch.id === patchId 
          ? { ...patch, status: 'deployed', deployedAt: new Date().toISOString() }
          : patch
      ))
    }, 2000)
  }

  const queuePatch = (patchId) => {
    const patch = securityPatches.find(p => p.id === patchId)
    if (patch) {
      const newQueueItem = {
        id: Date.now(),
        patchId,
        scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        priority: patch.severity === 'critical' ? 'high' : 'normal',
        status: 'queued'
      }
      setDeploymentQueue(prev => [...prev, newQueueItem])
    }
  }

  const toggleAutoDeploy = () => {
    setAutoDeploy(!autoDeploy)
  }

  const rollbackPatch = (patchId) => {
    if (window.confirm('Are you sure you want to rollback this security patch? This may expose the system to vulnerabilities.')) {
      setSecurityPatches(prev => prev.map(patch => 
        patch.id === patchId 
          ? { ...patch, status: 'rolled-back' }
          : patch
      ))
    }
  }

  return (
    <div className="security-patch-manager">
      <div className="manager-header">
        <h2>🔒 Security Patch Manager</h2>
        <div className="header-controls">
          <label className="auto-deploy-toggle">
            <input
              type="checkbox"
              checked={autoDeploy}
              onChange={toggleAutoDeploy}
            />
            <span>Auto-deploy Critical Patches</span>
          </label>
          <button 
            className="btn btn-primary"
            onClick={startVulnerabilityScan}
            disabled={scanStatus === 'scanning'}
          >
            {scanStatus === 'scanning' ? '🔍 Scanning...' : '🔍 Start Security Scan'}
          </button>
        </div>
      </div>

      <div className="security-overview">
        <div className="overview-card">
          <h3>Security Status</h3>
          <div className="security-metrics">
            <div className="metric">
              <span className="metric-value">{vulnerabilities.filter(v => v.status === 'open').length}</span>
              <span className="metric-label">Open Vulnerabilities</span>
            </div>
            <div className="metric">
              <span className="metric-value">{securityPatches.filter(p => p.status === 'available').length}</span>
              <span className="metric-label">Available Patches</span>
            </div>
            <div className="metric">
              <span className="metric-value">{deploymentQueue.length}</span>
              <span className="metric-label">Queued Deployments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="security-sections">
        {/* Security Patches */}
        <div className="patches-section">
          <h3>🛡️ Security Patches ({securityPatches.length})</h3>
          <div className="patches-grid">
            {securityPatches.map(patch => (
              <div key={patch.id} className={`patch-card ${getStatusColor(patch.status)}`}>
                <div className="patch-header">
                  <h4>{patch.name}</h4>
                  <span className={`severity-badge ${getSeverityColor(patch.severity)}`}>
                    {patch.severity}
                  </span>
                </div>
                <p className="patch-description">{patch.description}</p>
                <div className="patch-details">
                  <div className="detail-item">
                    <span className="detail-label">CVE:</span>
                    <span className="detail-value">{patch.cve}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Components:</span>
                    <span className="detail-value">{patch.affectedComponents.join(', ')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{patch.patchSize}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deployment:</span>
                    <span className="detail-value">{patch.deploymentTime}</span>
                  </div>
                </div>
                
                <div className="patch-actions">
                  {patch.status === 'available' && (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={() => deployPatch(patch.id)}
                      >
                        🚀 Deploy Now
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => queuePatch(patch.id)}
                      >
                        📅 Queue Deployment
                      </button>
                    </>
                  )}
                  
                  {patch.status === 'deployed' && (
                    <>
                      <span className="deployed-info">
                        ✅ Deployed at {new Date(patch.deployedAt).toLocaleString()}
                      </span>
                      {patch.rollbackAvailable && (
                        <button 
                          className="btn btn-warning"
                          onClick={() => rollbackPatch(patch.id)}
                        >
                          🔄 Rollback
                        </button>
                      )}
                    </>
                  )}
                  
                  <button className="btn btn-secondary">
                    📋 View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="vulnerabilities-section">
          <h3>⚠️ Security Vulnerabilities ({vulnerabilities.length})</h3>
          <div className="vulnerabilities-list">
            {vulnerabilities.map(vulnerability => (
              <div key={vulnerability.id} className={`vulnerability-item ${getSeverityColor(vulnerability.severity)}`}>
                <div className="vulnerability-header">
                  <h4>{vulnerability.title}</h4>
                  <span className={`severity-badge ${getSeverityColor(vulnerability.severity)}`}>
                    {vulnerability.severity}
                  </span>
                  <span className="risk-score">Risk: {vulnerability.riskScore}</span>
                </div>
                <p className="vulnerability-description">{vulnerability.description}</p>
                <div className="vulnerability-meta">
                  <span className="meta-item">
                    🏷️ CVE: {vulnerability.cve}
                  </span>
                  <span className="meta-item">
                    🔧 Component: {vulnerability.affectedComponent}
                  </span>
                  <span className="meta-item">
                    📅 Discovered: {new Date(vulnerability.discoveredAt).toLocaleDateString()}
                  </span>
                  <span className={`status-badge ${vulnerability.status}`}>
                    {vulnerability.status}
                  </span>
                </div>
                <div className="vulnerability-actions">
                  <button className="btn btn-secondary">🔍 Investigate</button>
                  <button className="btn btn-primary">🛡️ Create Patch</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Queue */}
        <div className="deployment-queue-section">
          <h3>📋 Deployment Queue ({deploymentQueue.length})</h3>
          <div className="queue-list">
            {deploymentQueue.length === 0 ? (
              <div className="empty-queue">No patches in deployment queue</div>
            ) : (
              deploymentQueue.map(item => {
                const patch = securityPatches.find(p => p.id === item.patchId)
                return (
                  <div key={item.id} className="queue-item">
                    <div className="queue-info">
                      <h4>{patch?.name || 'Unknown Patch'}</h4>
                      <span className="queue-priority">{item.priority}</span>
                      <span className="queue-status">{item.status}</span>
                    </div>
                    <div className="queue-schedule">
                      Scheduled for: {new Date(item.scheduledAt).toLocaleString()}
                    </div>
                    <div className="queue-actions">
                      <button className="btn btn-primary">Deploy Now</button>
                      <button className="btn btn-secondary">Reschedule</button>
                      <button className="btn btn-danger">Remove</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityPatchManager

import React, { useState, useEffect } from 'react'
import './ServerHealthMonitor.css'

const ServerHealthMonitor = () => {
  const [serverMetrics, setServerMetrics] = useState({})
  const [uptime, setUptime] = useState({})
  const [alerts, setAlerts] = useState([])
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    // Fetch initial server health data
    fetchServerHealth()
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      fetchServerHealth()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const fetchServerHealth = async () => {
    try {
      setLoading(true)
      
      // Fetch system status from backend
      const response = await fetch('http://localhost:3001/api/admin/system-status')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Only set data that actually exists
      const metrics = {}
      const uptimeData = {}
      
      // CPU metrics (if available)
      if (data.cpuUsage !== undefined) {
        metrics.cpu = {
          usage: data.cpuUsage,
          status: getStatusFromUsage(data.cpuUsage, 80),
          threshold: 80
        }
      }
      
      // Memory metrics (if available)
      if (data.memoryUsage !== undefined) {
        metrics.memory = {
          usage: data.memoryUsage,
          status: getStatusFromUsage(data.memoryUsage, 85),
          threshold: 85
        }
      }
      
      // Disk metrics (if available)
      if (data.diskUsage !== undefined) {
        metrics.disk = {
          usage: data.diskUsage,
          status: getStatusFromUsage(data.diskUsage, 90),
          threshold: 90
        }
      }
      
      // Network metrics (if available)
      if (data.networkLatency !== undefined) {
        metrics.network = {
          status: data.networkStatus || 'operational',
          latency: data.networkLatency
        }
      }
      
      // Database metrics (if available)
      if (data.databaseConnections !== undefined) {
        metrics.database = {
          connections: data.databaseConnections,
          maxConnections: data.maxConnections || 100,
          status: data.databaseStatus || 'healthy'
        }
      }
      
      // Email metrics (if available)
      if (data.emailQueueSize !== undefined) {
        metrics.email = {
          status: data.emailStatus || 'operational',
          queueSize: data.emailQueueSize
        }
      }
      
      // Uptime data (if available)
      if (data.uptime) {
        uptimeData.server = data.uptime
      }
      if (data.databaseUptime) {
        uptimeData.database = data.databaseUptime
      }
      if (data.emailUptime) {
        uptimeData.email = data.emailUptime
      }
      
      setServerMetrics(metrics)
      setUptime(uptimeData)
      setLastUpdated(new Date().toISOString())
      
    } catch (error) {
      console.error('Failed to fetch server health:', error)
      setError('Failed to fetch server health data')
      // Don't set any mock data - keep it empty
    } finally {
      setLoading(false)
    }
  }

  const getStatusFromUsage = (usage, threshold) => {
    if (usage >= threshold) return 'critical'
    if (usage >= threshold * 0.8) return 'warning'
    return 'normal'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'operational':
        return 'status-healthy'
      case 'warning':
        return 'status-warning'
      case 'critical':
      case 'error':
        return 'status-critical'
      default:
        return 'status-unknown'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'operational':
        return '✓'
      case 'warning':
        return '⚠'
      case 'critical':
      case 'error':
        return '✗'
      default:
        return '?'
    }
  }

  const handleRefreshIntervalChange = (e) => {
    setRefreshInterval(parseInt(e.target.value))
  }

  const handleManualRefresh = () => {
    fetchServerHealth()
  }

  const sendAlert = (message) => {
    setAlerts(prev => [...prev, {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
      type: 'info'
    }])
  }

  // Check if we have any metrics to show
  const hasMetrics = Object.keys(serverMetrics).length > 0
  const hasUptime = Object.keys(uptime).length > 0

  if (loading) {
    return (
      <div className="server-health-monitor">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading server health data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="server-health-monitor">
        <div className="error-message">
          <h3>Error Loading Server Health</h3>
          <p>{error}</p>
          <button onClick={fetchServerHealth} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  if (!hasMetrics && !hasUptime) {
    return (
      <div className="server-health-monitor">
        <div className="no-data-message">
          <h3>No Server Health Data Available</h3>
          <p>Server health monitoring is not configured or no metrics are being collected.</p>
          <p>Please check your server configuration or contact your system administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="server-health-monitor">
      <div className="monitor-header">
        <h2>Server Health Monitor</h2>
        <div className="monitor-controls">
          <label>
            Refresh Interval:
            <select value={refreshInterval} onChange={handleRefreshIntervalChange}>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </label>
          <button className="btn btn-primary" onClick={handleManualRefresh}>
            Refresh Now
          </button>
        </div>
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      {/* Only show metrics grid if we have metrics */}
      {hasMetrics && (
        <div className="metrics-grid">
          {/* CPU Usage - only show if available */}
          {serverMetrics.cpu && (
            <div className={`metric-card ${getStatusColor(serverMetrics.cpu.status)}`}>
              <div className="metric-header">
                <h3>CPU Usage</h3>
                <span className="status-icon">{getStatusIcon(serverMetrics.cpu.status)}</span>
              </div>
              <div className="metric-value">{serverMetrics.cpu.usage}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${serverMetrics.cpu.usage}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>Status: {serverMetrics.cpu.status}</span>
                <span>Threshold: {serverMetrics.cpu.threshold}%</span>
              </div>
            </div>
          )}

          {/* Memory Usage - only show if available */}
          {serverMetrics.memory && (
            <div className={`metric-card ${getStatusColor(serverMetrics.memory.status)}`}>
              <div className="metric-header">
                <h3>Memory Usage</h3>
                <span className="status-icon">{getStatusIcon(serverMetrics.memory.status)}</span>
              </div>
              <div className="metric-value">{serverMetrics.memory.usage}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${serverMetrics.memory.usage}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>Status: {serverMetrics.memory.status}</span>
                <span>Threshold: {serverMetrics.memory.threshold}%</span>
              </div>
            </div>
          )}

          {/* Disk Usage - only show if available */}
          {serverMetrics.disk && (
            <div className={`metric-card ${getStatusColor(serverMetrics.disk.status)}`}>
              <div className="metric-header">
                <h3>Disk Usage</h3>
                <span className="status-icon">{getStatusIcon(serverMetrics.disk.status)}</span>
              </div>
              <div className="metric-value">{serverMetrics.disk.usage}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${serverMetrics.disk.usage}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>Status: {serverMetrics.disk.status}</span>
                <span>Threshold: {serverMetrics.disk.threshold}%</span>
              </div>
            </div>
          )}

          {/* Network Status - only show if available */}
          {serverMetrics.network && (
            <div className={`metric-card ${getStatusColor(serverMetrics.network.status)}`}>
              <div className="metric-header">
                <h3>Network</h3>
                <span className="status-icon">{getStatusIcon(serverMetrics.network.status)}</span>
              </div>
              <div className="metric-value">{serverMetrics.network.latency}ms</div>
              <div className="metric-details">
                <span>Status: {serverMetrics.network.status}</span>
                <span>Latency: {serverMetrics.network.latency}ms</span>
              </div>
            </div>
          )}

          {/* Database Status - only show if available */}
          {serverMetrics.database && (
            <div className={`metric-card ${getStatusColor(serverMetrics.database.status)}`}>
              <div className="metric-header">
                <h3>Database</h3>
                <span className="status-icon">{getStatusIcon(serverMetrics.database.status)}</span>
              </div>
              <div className="metric-value">{serverMetrics.database.connections}/{serverMetrics.database.maxConnections}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(serverMetrics.database.connections / serverMetrics.database.maxConnections) * 100}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>Status: {serverMetrics.database.status}</span>
                <span>Connections: {serverMetrics.database.connections}</span>
              </div>
            </div>
          )}

          {/* Email Service - only show if available */}
          {serverMetrics.email && (
            <div className={`metric-card ${getStatusColor(serverMetrics.email.status)}`}>
              <div className="metric-header">
                <h3>Email Service</h3>
                <span className="status-icon">{getStatusIcon(serverMetrics.email.status)}</span>
              </div>
              <div className="metric-value">{serverMetrics.email.queueSize}</div>
              <div className="metric-details">
                <span>Status: {serverMetrics.email.status}</span>
                <span>Queue: {serverMetrics.email.queueSize} emails</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Only show uptime section if we have uptime data */}
      {hasUptime && (
        <div className="uptime-section">
          <h3>System Uptime</h3>
          <div className="uptime-grid">
            {uptime.server && (
              <div className="uptime-card">
                <h4>Server</h4>
                <div className="uptime-value">{uptime.server}</div>
              </div>
            )}
            {uptime.database && (
              <div className="uptime-card">
                <h4>Database</h4>
                <div className="uptime-value">{uptime.database}</div>
              </div>
            )}
            {uptime.email && (
              <div className="uptime-card">
                <h4>Email Service</h4>
                <div className="uptime-value">{uptime.email}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerts section - only show if we have alerts or if user generates them */}
      <div className="alerts-section">
        <h3>Recent Alerts</h3>
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <div className="no-alerts">No recent alerts</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => sendAlert('Test alert generated at ' + new Date().toLocaleTimeString())}
        >
          Generate Test Alert
        </button>
      </div>
    </div>
  )
}

export default ServerHealthMonitor

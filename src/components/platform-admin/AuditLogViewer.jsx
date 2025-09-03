import React, { useState, useEffect } from 'react'
import './AuditLogViewer.css'

const AuditLogViewer = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [filters, setFilters] = useState({
    severity: 'all',
    category: 'all',
    dateRange: '7d',
    search: ''
  })
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  // Mock audit log data
  const mockAuditLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: 'admin@trustteams.com',
      action: 'User login',
      category: 'Authentication',
      severity: 'low',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Successful login from trusted IP address'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: 'manager@trustteams.com',
      action: 'Permission change',
      category: 'User Management',
      severity: 'medium',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Changed user role from viewer to manager for user@example.com'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      user: 'system',
      action: 'Security scan',
      category: 'Security',
      severity: 'high',
      ipAddress: '127.0.0.1',
      userAgent: 'System Process',
      details: 'Vulnerability scan completed - 2 medium, 1 high severity issues found'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      user: 'admin@trustteams.com',
      action: 'System configuration',
      category: 'System',
      severity: 'medium',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Updated database connection pool settings'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      user: 'viewer@trustteams.com',
      action: 'Data export',
      category: 'Data Access',
      severity: 'low',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Linux x86_64)',
      details: 'Exported user list (50 records) to CSV format'
    }
  ]

  useEffect(() => {
    setAuditLogs(mockAuditLogs)
    setFilteredLogs(mockAuditLogs)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, auditLogs])

  const applyFilters = () => {
    let filtered = [...auditLogs]

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity)
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(log => log.category === filters.category)
    }

    // Apply date range filter
    const now = new Date()
    switch (filters.dateRange) {
      case '1h':
        filtered = filtered.filter(log => new Date(log.timestamp) > new Date(now - 1000 * 60 * 60))
        break
      case '24h':
        filtered = filtered.filter(log => new Date(log.timestamp) > new Date(now - 1000 * 60 * 60 * 24))
        break
      case '7d':
        filtered = filtered.filter(log => new Date(log.timestamp) > new Date(now - 1000 * 60 * 60 * 24 * 7))
        break
      case '30d':
        filtered = filtered.filter(log => new Date(log.timestamp) > new Date(now - 1000 * 60 * 60 * 24 * 30))
        break
      default:
        break
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        log.ipAddress.includes(searchLower)
      )
    }

    setFilteredLogs(filtered)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const exportLogs = (format) => {
    setLoading(true)
    
    // Simulate export process
    setTimeout(() => {
      const data = filteredLogs.map(log => ({
        Timestamp: formatTimestamp(log.timestamp),
        User: log.user,
        Action: log.action,
        Category: log.category,
        Severity: log.severity,
        IP: log.ipAddress,
        Details: log.details
      }))

      if (format === 'csv') {
        const csvContent = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }

      setLoading(false)
    }, 1000)
  }

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      setAuditLogs([])
      setFilteredLogs([])
    }
  }

  return (
    <div className="audit-log-viewer">
      <div className="audit-header">
        <div className="audit-title">
          <h2>🔍 Audit Log Viewer</h2>
          <p>Monitor and review all platform activities and security events</p>
        </div>
        <div className="audit-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => exportLogs('csv')}
            disabled={loading}
          >
            {loading ? 'Exporting...' : '📊 Export CSV'}
          </button>
          <button 
            className="btn btn-danger" 
            onClick={clearLogs}
            disabled={filteredLogs.length === 0}
          >
            🗑️ Clear Logs
          </button>
        </div>
      </div>

      <div className="audit-filters">
        <div className="filter-group">
          <label>Severity:</label>
          <select 
            value={filters.severity} 
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="all">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="User Management">User Management</option>
            <option value="Security">Security</option>
            <option value="System">System</option>
            <option value="Data Access">Data Access</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time Range:</label>
          <select 
            value={filters.dateRange} 
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
      </div>

      <div className="audit-stats">
        <div className="stat-card">
          <div className="stat-number">{filteredLogs.length}</div>
          <div className="stat-label">Total Logs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredLogs.filter(log => log.severity === 'high').length}</div>
          <div className="stat-label">High Severity</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredLogs.filter(log => log.severity === 'medium').length}</div>
          <div className="stat-label">Medium Severity</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredLogs.filter(log => log.severity === 'low').length}</div>
          <div className="stat-label">Low Severity</div>
        </div>
      </div>

      <div className="audit-logs">
        <div className="logs-header">
          <h3>Activity Logs ({filteredLogs.length} entries)</h3>
          <div className="logs-info">
            Showing logs from {filters.dateRange === 'all' ? 'all time' : `last ${filters.dateRange}`}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            <div className="no-logs-icon">📝</div>
            <h4>No logs found</h4>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="logs-table">
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`log-entry log-${log.severity}`}
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              >
                <div className="log-main">
                  <div className="log-severity">
                    <span className="severity-icon">{getSeverityIcon(log.severity)}</span>
                    <span className="severity-text">{log.severity}</span>
                  </div>
                  <div className="log-action">{log.action}</div>
                  <div className="log-user">{log.user}</div>
                  <div className="log-category">{log.category}</div>
                  <div className="log-time">{formatTimestamp(log.timestamp)}</div>
                </div>
                
                {selectedLog?.id === log.id && (
                  <div className="log-details">
                    <div className="detail-row">
                      <strong>IP Address:</strong> {log.ipAddress}
                    </div>
                    <div className="detail-row">
                      <strong>User Agent:</strong> {log.userAgent}
                    </div>
                    <div className="detail-row">
                      <strong>Details:</strong> {log.details}
                    </div>
                    <div className="detail-row">
                      <strong>Timestamp:</strong> {new Date(log.timestamp).toISOString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogViewer

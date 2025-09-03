import React, { useState, useEffect } from 'react'
import './ComplianceReporter.css'

const ComplianceReporter = () => {
  const [complianceData, setComplianceData] = useState({})
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    loadComplianceData()
    loadReports()
  }, [])

  const loadComplianceData = () => {
    setComplianceData({
      gdpr: {
        status: 'compliant',
        score: 95,
        lastAudit: '2025-08-15',
        nextAudit: '2025-11-15',
        items: [
          { name: 'Data Consent Management', status: 'compliant', score: 100 },
          { name: 'Right to be Forgotten', status: 'compliant', score: 95 },
          { name: 'Data Portability', status: 'compliant', score: 90 },
          { name: 'Privacy Notices', status: 'compliant', score: 100 }
        ]
      },
      ccpa: {
        status: 'compliant',
        score: 88,
        lastAudit: '2025-08-20',
        nextAudit: '2025-11-20',
        items: [
          { name: 'Consumer Rights', status: 'compliant', score: 85 },
          { name: 'Data Disclosure', status: 'compliant', score: 90 },
          { name: 'Opt-out Mechanisms', status: 'compliant', score: 88 }
        ]
      },
      hipaa: {
        status: 'non-compliant',
        score: 65,
        lastAudit: '2025-07-10',
        nextAudit: '2025-10-10',
        items: [
          { name: 'Data Encryption', status: 'non-compliant', score: 60 },
          { name: 'Access Controls', status: 'compliant', score: 85 },
          { name: 'Audit Logging', status: 'compliant', score: 90 },
          { name: 'Data Backup', status: 'non-compliant', score: 40 }
        ]
      }
    })
  }

  const loadReports = () => {
    setReports([
      {
        id: 1,
        name: 'Q3 2025 Compliance Report',
        type: 'quarterly',
        generatedAt: '2025-09-01T10:00:00Z',
        status: 'completed',
        overallScore: 83,
        frameworks: ['GDPR', 'CCPA', 'HIPAA'],
        recommendations: 5
      },
      {
        id: 2,
        name: 'GDPR Compliance Audit',
        type: 'audit',
        generatedAt: '2025-08-15T14:30:00Z',
        status: 'completed',
        overallScore: 95,
        frameworks: ['GDPR'],
        recommendations: 2
      }
    ])
  }

  const generateReport = () => {
    const newReport = {
      id: Date.now(),
      name: `Compliance Report ${new Date().toLocaleDateString()}`,
      type: 'on-demand',
      generatedAt: new Date().toISOString(),
      status: 'generating',
      overallScore: 0,
      frameworks: Object.keys(complianceData),
      recommendations: 0
    }
    
    setReports(prev => [newReport, ...prev])
    
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: 'completed', overallScore: 87 }
          : report
      ))
    }, 3000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'status-compliant'
      case 'non-compliant': return 'status-non-compliant'
      case 'pending': return 'status-pending'
      default: return 'status-unknown'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent'
    if (score >= 80) return 'score-good'
    if (score >= 70) return 'score-fair'
    if (score >= 60) return 'score-poor'
    return 'score-critical'
  }

  return (
    <div className="compliance-reporter">
      <div className="reporter-header">
        <h2>📋 Compliance Reporter</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={generateReport}>
            📊 Generate Report
          </button>
          <button className="btn btn-secondary">
            📧 Export Report
          </button>
        </div>
      </div>

      <div className="compliance-overview">
        <h3>Compliance Status Overview</h3>
        <div className="compliance-grid">
          {Object.entries(complianceData).map(([framework, data]) => (
            <div key={framework} className={`compliance-card ${getStatusColor(data.status)}`}>
              <div className="framework-header">
                <h4>{framework}</h4>
                <span className={`status-badge ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
              
              <div className="compliance-score">
                <div className={`score-circle ${getScoreColor(data.score)}`}>
                  <span className="score-value">{data.score}%</span>
                </div>
              </div>
              
              <div className="compliance-details">
                <div className="detail-item">
                  <span className="detail-label">Last Audit:</span>
                  <span className="detail-value">{data.lastAudit}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next Audit:</span>
                  <span className="detail-value">{data.nextAudit}</span>
                </div>
              </div>
              
              <div className="compliance-items">
                {data.items.map((item, index) => (
                  <div key={index} className="compliance-item">
                    <span className="item-name">{item.name}</span>
                    <span className={`item-score ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-section">
        <h3>Generated Reports ({reports.length})</h3>
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-item">
              <div className="report-info">
                <h4>{report.name}</h4>
                <div className="report-meta">
                  <span className="meta-item">
                    📅 Generated: {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                  <span className="meta-item">
                    🏷️ Type: {report.type}
                  </span>
                  <span className="meta-item">
                    📊 Score: <span className={getScoreColor(report.overallScore)}>
                      {report.overallScore}%
                    </span>
                  </span>
                  <span className="meta-item">
                    🔧 Frameworks: {report.frameworks.join(', ')}
                  </span>
                </div>
              </div>
              
              <div className="report-actions">
                <button className="btn btn-secondary">
                  👁️ View
                </button>
                <button className="btn btn-primary">
                  📥 Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ComplianceReporter

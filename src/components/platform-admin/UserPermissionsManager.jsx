import React, { useState, useEffect } from 'react'
import './UserPermissionsManager.css'

const UserPermissionsManager = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load initial data
    loadUsers()
    loadRoles()
    loadPermissions()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/admin/users')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      setError('Failed to load users from database')
      // Fallback to empty array
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = () => {
    // Define available roles based on database schema
    setRoles([
      {
        id: 1,
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        permissions: ['read', 'write', 'delete', 'admin', 'user_management', 'system_config'],
        userCount: 0
      },
      {
        id: 2,
        name: 'manager',
        displayName: 'Manager',
        description: 'Manage users and content',
        permissions: ['read', 'write', 'user_management'],
        userCount: 0
      },
      {
        id: 3,
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access',
        permissions: ['read'],
        userCount: 0
      },
      {
        id: 4,
        name: 'student',
        displayName: 'Student',
        description: 'Student access',
        permissions: ['read'],
        userCount: 0
      },
      {
        id: 5,
        name: 'academic_leader',
        displayName: 'Academic Leader',
        description: 'Academic leadership access',
        permissions: ['read', 'write'],
        userCount: 0
      },
      {
        id: 6,
        name: 'university_admin',
        displayName: 'University Admin',
        description: 'University administration access',
        permissions: ['read', 'write', 'user_management'],
        userCount: 0
      }
    ])
  }

  const loadPermissions = () => {
    setPermissions([
      { id: 1, name: 'read', description: 'Read data and content' },
      { id: 2, name: 'write', description: 'Create and modify content' },
      { id: 3, name: 'delete', description: 'Delete content and data' },
      { id: 4, name: 'admin', description: 'Administrative functions' },
      { id: 5, name: 'user_management', description: 'Manage user accounts' },
      { id: 6, name: 'system_config', description: 'System configuration' }
    ])
  }

  // Update role counts based on actual users
  useEffect(() => {
    if (users.length > 0 && roles.length > 0) {
      const updatedRoles = roles.map(role => ({
        ...role,
        userCount: users.filter(user => user.role === role.name).length
      }))
      setRoles(updatedRoles)
    }
  }, [users])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      // Reload users to get updated data
      await loadUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert('Failed to update user role. Please try again.')
    }
  }

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ))

      // Reload users to get updated data
      await loadUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
      alert('Failed to update user status. Please try again.')
    }
  }

  const handlePermissionToggle = (userId, permission) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const hasPermission = user.permissions.includes(permission)
        const newPermissions = hasPermission
          ? user.permissions.filter(p => p !== permission)
          : [...user.permissions, permission]
        return { ...user, permissions: newPermissions }
      }
      return user
    }))
  }

  const createRole = (roleData) => {
    const newRole = {
      id: Date.now(),
      ...roleData,
      userCount: 0
    }
    setRoles(prev => [...prev, newRole])
    setShowRoleModal(false)
  }

  const deleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? Users with this role will be affected.')) {
      setRoles(prev => prev.filter(role => role.id !== roleId))
      // Update users with deleted role
      setUsers(prev => prev.map(user => 
        user.role === roles.find(r => r.id === roleId)?.name 
          ? { ...user, role: 'viewer' } 
          : user
      ))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-active'
      case 'pending': return 'status-pending'
      case 'rejected': return 'status-suspended'
      default: return 'status-unknown'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'role-admin'
      case 'manager': return 'role-manager'
      case 'viewer': return 'role-viewer'
      case 'student': return 'role-student'
      case 'academic_leader': return 'role-academic'
      case 'university_admin': return 'role-university'
      default: return 'role-default'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return 'Invalid Date'
    }
  }

  if (loading) {
    return (
      <div className="user-permissions-manager">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users from database...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-permissions-manager">
        <div className="error-message">
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button onClick={loadUsers} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="user-permissions-manager">
      <div className="manager-header">
        <h2>User Permissions Manager</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
            Add User
          </button>
          <button className="btn btn-secondary" onClick={() => setShowRoleModal(true)}>
            Create Role
          </button>
        </div>
      </div>

      <div className="manager-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-section">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.displayName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="manager-content">
        <div className="users-section">
          <h3>Users ({filteredUsers.length})</h3>
          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Role</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Last Login</div>
              <div className="header-cell">Permissions</div>
              <div className="header-cell">Actions</div>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <p>No users found matching your criteria.</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="table-row">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    {user.phone && <div className="user-phone">{user.phone}</div>}
                    {user.position && <div className="user-position">{user.position}</div>}
                    {user.department && <div className="user-department">{user.department}</div>}
                    {user.instituteName && <div className="user-institute">{user.instituteName}</div>}
                    {user.universityName && <div className="user-university">{user.universityName}</div>}
                  </div>
                  <div className="role-cell">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                      className={`role-select ${getRoleColor(user.role)}`}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="status-cell">
                    <select
                      value={user.status}
                      onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
                      className={`status-select ${getStatusColor(user.status)}`}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="last-login">
                    {formatDate(user.lastLogin)}
                  </div>
                  <div className="permissions-cell">
                    <div className="permissions-list">
                      {permissions.map(permission => (
                        <label key={permission.id} className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={user.permissions.includes(permission.name)}
                            onChange={() => handlePermissionToggle(user.id, permission.name)}
                          />
                          <span className="permission-name">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="actions-cell">
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => setSelectedUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleUserStatusChange(user.id, 'rejected')}
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="roles-section">
          <h3>Roles ({roles.length})</h3>
          <div className="roles-grid">
            {roles.map(role => (
              <div key={role.id} className="role-card">
                <div className="role-header">
                  <h4>{role.displayName}</h4>
                  <span className="role-name">{role.name}</span>
                </div>
                <p className="role-description">{role.description}</p>
                <div className="role-stats">
                  <span className="user-count">{role.userCount} users</span>
                  <span className="permission-count">{role.permissions.length} permissions</span>
                </div>
                <div className="role-permissions">
                  {role.permissions.map(permission => (
                    <span key={permission} className="permission-tag">
                      {permission}
                    </span>
                  ))}
                </div>
                <div className="role-actions">
                  <button className="btn btn-small btn-secondary">Edit</button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => deleteRole(role.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p>User creation modal would go here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button onClick={() => setShowRoleModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p>Role creation modal would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserPermissionsManager

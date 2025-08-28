// API Configuration
const API_BASE_URL = 'https://trustteams-backend.vercel.app'

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/auth/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Opportunities
  OPPORTUNITIES: `${API_BASE_URL}/api/opportunities`,
  OPPORTUNITY_BY_ID: (id) => `${API_BASE_URL}/api/opportunities/${id}`,
  OPPORTUNITY_AUDIT: (id) => `${API_BASE_URL}/api/opportunities/${id}/audit`,
  AUTO_CLOSE_EXPIRED: `${API_BASE_URL}/api/opportunities/auto-close-expired`,
  
  // Health
  HEALTH: `${API_BASE_URL}/api/health`
}

// API utility functions
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  // Add user ID header if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.id) {
    defaultOptions.headers['x-user-id'] = user.id
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }

  return data
}

// Specific API functions
export const api = {
  // Authentication
  login: (credentials) => apiRequest(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  signup: (userData) => apiRequest(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  getProfile: () => apiRequest(API_ENDPOINTS.PROFILE),

  updateProfile: (profileData) => apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Opportunities
  getOpportunities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${API_ENDPOINTS.OPPORTUNITIES}?${queryString}` : API_ENDPOINTS.OPPORTUNITIES
    return apiRequest(url)
  },

  getOpportunity: (id) => apiRequest(API_ENDPOINTS.OPPORTUNITY_BY_ID(id)),

  createOpportunity: (opportunityData) => apiRequest(API_ENDPOINTS.OPPORTUNITIES, {
    method: 'POST',
    body: JSON.stringify(opportunityData)
  }),

  updateOpportunity: (id, opportunityData) => apiRequest(API_ENDPOINTS.OPPORTUNITY_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(opportunityData)
  }),

  deleteOpportunity: (id) => apiRequest(API_ENDPOINTS.OPPORTUNITY_BY_ID(id), {
    method: 'DELETE'
  }),

  getOpportunityAudit: (id) => apiRequest(API_ENDPOINTS.OPPORTUNITY_AUDIT(id)),

  autoCloseExpired: () => apiRequest(API_ENDPOINTS.AUTO_CLOSE_EXPIRED, {
    method: 'POST'
  }),

  // Health
  health: () => apiRequest(API_ENDPOINTS.HEALTH)
}

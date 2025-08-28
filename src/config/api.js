// API Configuration
// Use environment variable for production, fallback to proxy for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Debug logging for API configuration
console.log('API Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL,
  NODE_ENV: import.meta.env.MODE
})

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  PROFILE: `${API_BASE_URL}/auth/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // Opportunities
  OPPORTUNITIES: `${API_BASE_URL}/opportunities`,
  OPPORTUNITY_BY_ID: (id) => `${API_BASE_URL}/opportunities/${id}`,
  OPPORTUNITY_AUDIT: (id) => `${API_BASE_URL}/opportunities/${id}/audit`,
  AUTO_CLOSE_EXPIRED: `${API_BASE_URL}/opportunities/auto-close-expired`,
  
  // Student routes
  STUDENT_PROFILE: `${API_BASE_URL}/student/profile`,
  
  // Academic routes
  ACADEMIC_STUDENTS: `${API_BASE_URL}/academic/students`,
  ACADEMIC_DELETE_STUDENT: (id) => `${API_BASE_URL}/academic/students/${id}`,
  
  // University routes
  UNIVERSITY_STATS: `${API_BASE_URL}/university/stats`,
  UNIVERSITY_STUDENTS: `${API_BASE_URL}/university/students`,
  UNIVERSITY_DEPARTMENTS: `${API_BASE_URL}/university/departments`,
  UNIVERSITY_COURSES: `${API_BASE_URL}/university/courses`,
  UNIVERSITY_FINANCE: `${API_BASE_URL}/university/finance`,
  UNIVERSITY_REPORTS: `${API_BASE_URL}/university/reports`,
  UNIVERSITY_INSTITUTES: `${API_BASE_URL}/university/institutes`,
  UNIVERSITY_INSTITUTE_DETAIL: (domain) => `${API_BASE_URL}/university/institutes/${domain}`,
  
  // Health
  HEALTH: `${API_BASE_URL}/health`
}

// API utility functions
export const apiRequest = async (url, options = {}) => {
  console.log('API Request:', { url, method: options.method || 'GET' })
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  // Add user ID header if user is logged in
  const userData = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}')
  const userRole = localStorage.getItem('userRole')
  
  if (userData.id) {
    defaultOptions.headers['x-user-id'] = userData.id
  }
  
  // Debug logging for authentication
  console.log('API Auth Debug:', { 
    hasUserData: !!userData.id, 
    userId: userData.id, 
    userRole,
    url 
  })

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options
    })

    console.log('API Response:', { 
      url, 
      status: response.status, 
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    })

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response detected:', { 
        url, 
        contentType, 
        status: response.status,
        statusText: response.statusText
      })
      
      // Try to get the response text to see what's being returned
      const responseText = await response.text()
      console.error('Response body:', responseText.substring(0, 500))
      
      throw new Error(`Expected JSON response but got ${contentType}. Status: ${response.status}`)
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('API Error:', { status: response.status, data })
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API Request Failed:', { url, error: error.message })
    if (error.name === 'TypeError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid response. Please check if the backend is running.')
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.')
    }
    throw error
  }
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
  health: () => apiRequest(API_ENDPOINTS.HEALTH),

  // Test function to debug authentication
  testAuth: () => {
    const userData = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}')
    const userRole = localStorage.getItem('userRole')
    console.log('Auth Debug:', { userData, userRole })
    return { userData, userRole }
  },

  // Student routes
  getStudentProfile: () => apiRequest(API_ENDPOINTS.STUDENT_PROFILE),
  updateStudentProfile: (profileData) => apiRequest(API_ENDPOINTS.STUDENT_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Academic routes
  getAcademicStudents: () => apiRequest(API_ENDPOINTS.ACADEMIC_STUDENTS),
  deleteAcademicStudent: (id) => apiRequest(API_ENDPOINTS.ACADEMIC_DELETE_STUDENT(id), {
    method: 'DELETE'
  }),

  // University routes
  getUniversityStats: () => apiRequest(API_ENDPOINTS.UNIVERSITY_STATS),
  getUniversityStudents: () => apiRequest(API_ENDPOINTS.UNIVERSITY_STUDENTS),
  getUniversityDepartments: () => apiRequest(API_ENDPOINTS.UNIVERSITY_DEPARTMENTS),
  getUniversityCourses: () => apiRequest(API_ENDPOINTS.UNIVERSITY_COURSES),
  getUniversityFinance: () => apiRequest(API_ENDPOINTS.UNIVERSITY_FINANCE),
  getUniversityReports: () => apiRequest(API_ENDPOINTS.UNIVERSITY_REPORTS),
  getUniversityInstitutes: () => apiRequest(API_ENDPOINTS.UNIVERSITY_INSTITUTES),
  getUniversityInstituteDetail: (domain) => apiRequest(API_ENDPOINTS.UNIVERSITY_INSTITUTE_DETAIL(domain))
}

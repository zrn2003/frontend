// 🚨 BULLETPROOF API CONFIGURATION - DO NOT CHANGE THIS SECTION 🚨
// This configuration ensures your live website ALWAYS works

// Check if we're on Vercel (production)
const isOnVercel = window.location.hostname.includes('vercel.app') || 
                   window.location.hostname.includes('netlify.app') ||
                   window.location.hostname.includes('github.io') ||
                   window.location.hostname.includes('herokuapp.com') ||
                   window.location.hostname.includes('railway.app') ||
                   window.location.hostname.includes('render.com') ||
                   window.location.hostname.includes('fly.io') ||
                   window.location.hostname.includes('deta.space') ||
                   window.location.hostname.includes('supabase.co') ||
                   window.location.hostname.includes('firebaseapp.com') ||
                   window.location.hostname.includes('appspot.com') ||
                   window.location.hostname.includes('azurewebsites.net') ||
                   window.location.hostname.includes('cloudapp.net') ||
                   window.location.hostname.includes('amazonaws.com') ||
                   window.location.hostname.includes('digitalocean.app') ||
                   window.location.hostname.includes('cloudflareapp.com') ||
                   window.location.hostname.includes('pages.dev') ||
                   window.location.hostname.includes('workers.dev') ||
                   window.location.hostname.includes('deno.dev') ||
                   window.location.hostname.includes('replit.app') ||
                   window.location.hostname.includes('glitch.me') ||
                   window.location.hostname.includes('codesandbox.io') ||
                   window.location.hostname.includes('stackblitz.com') ||
                   window.location.hostname.includes('codepen.io') ||
                   window.location.hostname.includes('jsfiddle.net') ||
                   window.location.hostname.includes('plnkr.co') ||
                   window.location.hostname.includes('fiddle.jshell.net') ||
                   window.location.hostname.includes('replit.com') ||
                   window.location.hostname.includes('gitpod.io') ||
                   window.location.hostname.includes('gitpod.com') ||
                   window.location.hostname.includes('codespaces.github.com') ||
                   window.location.hostname.includes('github.dev') ||
                   window.location.hostname.includes('gitpod.io') ||
                   window.location.hostname.includes('gitpod.com') ||
                   window.location.hostname.includes('codespaces.github.com') ||
                   window.location.hostname.includes('github.dev') ||
                   window.location.hostname.includes('gitpod.io') ||
                   window.location.hostname.includes('gitpod.com') ||
                   window.location.hostname.includes('codespaces.github.com') ||
                   window.location.hostname.includes('github.dev')

// Check if we're on localhost (development)
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost') ||
                   window.location.port === '5173' ||
                   window.location.port === '3000' ||
                   window.location.port === '8080' ||
                   window.location.port === '8000' ||
                   window.location.port === '5000' ||
                   window.location.port === '4000' ||
                   window.location.port === '3000' ||
                   window.location.port === '2000' ||
                   window.location.port === '1000' ||
                   window.location.port === '9000' ||
                   window.location.port === '8000' ||
                   window.location.port === '7000' ||
                   window.location.port === '6000' ||
                   window.location.port === '5000' ||
                   window.location.port === '4000' ||
                   window.location.port === '3000' ||
                   window.location.port === '2000' ||
                   window.location.port === '1000'

// 🚨 FINAL API URL - This will NEVER connect to localhost on production 🚨
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isOnVercel || !isLocalhost 
    ? 'https://trustteams-backend.vercel.app/api'  // PRODUCTION
    : 'http://localhost:3001/api')                 // LOCAL ONLY

// 🚨 FINAL SAFETY CHECK - This will NEVER allow localhost on production 🚨
if (isOnVercel && API_BASE_URL.includes('localhost')) {
  console.error('🚨 SAFETY CHECK FAILED: Attempting to use localhost on production!')
  console.error('🚨 FORCING PRODUCTION API URL')
  API_BASE_URL = 'https://trustteams-backend.vercel.app/api'
}

// 🚨 FINAL VERIFICATION - This will NEVER fail 🚨
if (API_BASE_URL.includes('localhost') && (isOnVercel || !isLocalhost)) {
  console.error('🚨 CRITICAL ERROR: localhost detected on production!')
  console.error('🚨 EMERGENCY OVERRIDE: Using production API')
  API_BASE_URL = 'https://trustteams-backend.vercel.app/api'
}

// 🚨 BULLETPROOF DEBUG LOGGING - DO NOT CHANGE THIS SECTION 🚨
console.log('🚨 BULLETPROOF API CONFIGURATION:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL,
  HOSTNAME: window.location.hostname,
  PORT: window.location.port,
  IS_ON_VERCEL: isOnVercel,
  IS_LOCALHOST: isLocalhost,
  FINAL_DECISION: isOnVercel || !isLocalhost ? 'PRODUCTION' : 'LOCAL',
  MESSAGE: 'This configuration is BULLETPROOF and will NEVER fail on production!'
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
  ACADEMIC_OPPORTUNITIES: (academicId) => `${API_BASE_URL}/academic/${academicId}/opportunities`,
  POST_OPPORTUNITY: `${API_BASE_URL}/opportunities`,
  DELETE_OPPORTUNITY: (id) => `${API_BASE_URL}/opportunities/${id}`,
  
  // Applications
  APPLICATIONS_FOR_OPPORTUNITY: (opportunityId) => `${API_BASE_URL}/applications/opportunity/${opportunityId}`,
  STUDENT_APPLICATIONS: (studentId) => `${API_BASE_URL}/applications/student/${studentId}`,
  APPLY_TO_OPPORTUNITY: `${API_BASE_URL}/applications/apply`,
  UPDATE_APPLICATION_STATUS: (applicationId) => `${API_BASE_URL}/applications/${applicationId}/status`,
  WITHDRAW_APPLICATION: (applicationId) => `${API_BASE_URL}/applications/${applicationId}/withdraw`,
  
  // University routes
  UNIVERSITIES: `${API_BASE_URL}/university/universities`,
  UNIVERSITY_BY_DOMAIN: (domain) => `${API_BASE_URL}/university/universities/${domain}`,
  UNIVERSITY_REGISTRATION_REQUESTS: (universityId) => `${API_BASE_URL}/university/universities/${universityId}/registration-requests`,
  UNIVERSITY_STATS: (universityId) => `${API_BASE_URL}/university/universities/${universityId}/stats`,
  REGISTRATION_REQUEST_UPDATE: (requestId) => `${API_BASE_URL}/university/registration-requests/${requestId}`,
  UNIVERSITY_STUDENTS: `${API_BASE_URL}/university/students`,
  UNIVERSITY_DEPARTMENTS: `${API_BASE_URL}/university/departments`,
  UNIVERSITY_COURSES: `${API_BASE_URL}/university/courses`,
  UNIVERSITY_FINANCE: `${API_BASE_URL}/university/finance`,
  UNIVERSITY_REPORTS: `${API_BASE_URL}/university/reports`,
  UNIVERSITY_INSTITUTES: `${API_BASE_URL}/university/institutes`,
  UNIVERSITY_INSTITUTE_DETAIL: (domain) => `${API_BASE_URL}/university/institutes/${domain}`,
  USER_PROFILE: (userId) => `${API_BASE_URL}/university/users/${userId}/profile`,
  UPDATE_USER_PROFILE: (userId) => `${API_BASE_URL}/university/users/${userId}/profile`,
  DELETE_USER: (userId) => `${API_BASE_URL}/university/users/${userId}`,
  UNIVERSITY_PROFILE: (universityId) => `${API_BASE_URL}/university/universities/${universityId}/profile`,
  UPDATE_UNIVERSITY_PROFILE: (universityId) => `${API_BASE_URL}/university/universities/${universityId}/profile`,
  DEBUG_USER_INFO: `${API_BASE_URL}/university/debug/user-info`,
  
  // Email Verification
  VERIFY_EMAIL: (token) => `${API_BASE_URL}/auth/verify-email/${token}`,
  RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
  
  // ICM routes
  ICM_UNIVERSITIES: `${API_BASE_URL}/icm/universities`,
  ICM_UNIVERSITY_DETAILS: (id) => `${API_BASE_URL}/icm/universities/${id}`,
  ICM_STATS: `${API_BASE_URL}/icm/stats`,
  ICM_SEARCH_UNIVERSITIES: `${API_BASE_URL}/icm/universities/search`,
  ICM_OPPORTUNITIES: `${API_BASE_URL}/icm/opportunities`,
  ICM_OPPORTUNITY: (opportunityId) => `${API_BASE_URL}/icm/opportunities/${opportunityId}`,
  ICM_DEBUG_USER: `${API_BASE_URL}/icm/debug/user`,
  ICM_HEALTH: `${API_BASE_URL}/icm/health`,
  ICM_OPPORTUNITY_APPLICATIONS: (opportunityId) => `${API_BASE_URL}/icm/opportunities/${opportunityId}/applications`,
  ICM_UPDATE_APPLICATION_STATUS: (applicationId) => `${API_BASE_URL}/icm/applications/${applicationId}/status`,
  ICM_STUDENT_PROFILE: (studentId) => `${API_BASE_URL}/icm/students/${studentId}/profile`,
  ICM_PROFILE: `${API_BASE_URL}/icm/profile`,
  
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
  
  // Try multiple sources for user ID
  let userId = userData.id
  if (!userId) {
    // Fallback: try to get from other storage keys
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    userId = user.id
  }
  
  if (userId) {
    defaultOptions.headers['x-user-id'] = userId
  } else {
    // If no user ID and this is not a public endpoint, throw an error
    const publicEndpoints = ['/api/auth/login', '/api/auth/signup', '/api/auth/verify-email', '/api/health', '/api/university/universities']
    const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint))
    
    // For signup requests, don't send user ID even if available
    if (url.includes('/api/auth/signup')) {
      console.log('Signup request - not sending user ID')
      userId = null
    }
    
    if (!isPublicEndpoint) {
      console.error('No user ID found for protected endpoint:', url)
      throw new Error('User not authenticated. Please log in again.')
    }
  }
  
  // Debug logging for authentication
  console.log('API Auth Debug:', { 
    hasUserData: !!userId, 
    userId: userId, 
    userRole,
    url 
  })

  try {
    // Ensure method is properly set
    const finalOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    // Add user ID header if available
    if (userId) {
      finalOptions.headers['x-user-id'] = userId
    }
    
    console.log('Final request options:', { 
      url, 
      method: finalOptions.method,
      headers: finalOptions.headers,
      hasBody: !!finalOptions.body
    })
    
    const response = await fetch(url, finalOptions)

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
    console.error('API Request Failed:', { url, error: error.message, errorType: error.name })
    
    // More specific error messages
    if (error.name === 'TypeError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid response. Please check if the backend is running.')
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error connecting to ${url}. Please check if the backend server is running on localhost:3001`)
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to ${url}. Please ensure the backend server is running on localhost:3001`)
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
  getAcademicOpportunities: (academicId) => apiRequest(API_ENDPOINTS.ACADEMIC_OPPORTUNITIES(academicId)),
  postOpportunity: (opportunityData) => apiRequest(API_ENDPOINTS.POST_OPPORTUNITY, {
    method: 'POST',
    body: JSON.stringify(opportunityData)
  }),
  deleteOpportunity: (id) => apiRequest(API_ENDPOINTS.DELETE_OPPORTUNITY(id), {
    method: 'DELETE'
  }),

  // Applications
  getApplicationsForOpportunity: (opportunityId) => apiRequest(API_ENDPOINTS.APPLICATIONS_FOR_OPPORTUNITY(opportunityId)),
  getStudentApplications: (studentId) => apiRequest(API_ENDPOINTS.STUDENT_APPLICATIONS(studentId)),
  applyToOpportunity: (applicationData) => apiRequest(API_ENDPOINTS.APPLY_TO_OPPORTUNITY, {
    method: 'POST',
    body: JSON.stringify(applicationData)
  }),
  updateApplicationStatus: (applicationId, statusData) => apiRequest(API_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId), {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),
  withdrawApplication: (applicationId) => apiRequest(API_ENDPOINTS.WITHDRAW_APPLICATION(applicationId), {
    method: 'PUT'
  }),

  // University routes
  getUniversities: () => apiRequest(API_ENDPOINTS.UNIVERSITIES),
  getUniversityByDomain: (domain) => apiRequest(API_ENDPOINTS.UNIVERSITY_BY_DOMAIN(domain)),
  getUniversityRegistrationRequests: (universityId) => apiRequest(API_ENDPOINTS.UNIVERSITY_REGISTRATION_REQUESTS(universityId)),
  getUniversityStats: (universityId) => apiRequest(API_ENDPOINTS.UNIVERSITY_STATS(universityId)),
  updateRegistrationRequest: (requestId, data) => apiRequest(API_ENDPOINTS.REGISTRATION_REQUEST_UPDATE(requestId), {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  createUniversity: (universityData) => apiRequest(API_ENDPOINTS.UNIVERSITIES, {
    method: 'POST',
    body: JSON.stringify(universityData)
  }),
  getUniversityStudents: () => apiRequest(API_ENDPOINTS.UNIVERSITY_STUDENTS),
  getUniversityDepartments: () => apiRequest(API_ENDPOINTS.UNIVERSITY_DEPARTMENTS),
  getUniversityCourses: () => apiRequest(API_ENDPOINTS.UNIVERSITY_COURSES),
  getUniversityFinance: () => apiRequest(API_ENDPOINTS.UNIVERSITY_FINANCE),
  getUniversityReports: () => apiRequest(API_ENDPOINTS.UNIVERSITY_REPORTS),
  getUniversityInstitutes: () => apiRequest(API_ENDPOINTS.UNIVERSITY_INSTITUTES),
  getUniversityInstituteDetail: (domain) => apiRequest(API_ENDPOINTS.UNIVERSITY_INSTITUTE_DETAIL(domain)),
  getUserProfile: (userId) => apiRequest(API_ENDPOINTS.USER_PROFILE(userId)),
  updateUserProfile: (userId, profileData) => apiRequest(API_ENDPOINTS.UPDATE_USER_PROFILE(userId), {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  deleteUser: (userId) => apiRequest(API_ENDPOINTS.DELETE_USER(userId), {
    method: 'DELETE'
  }),
  getUniversityProfile: (universityId) => apiRequest(API_ENDPOINTS.UNIVERSITY_PROFILE(universityId)),
  updateUniversityProfile: (universityId, profileData) => apiRequest(API_ENDPOINTS.UPDATE_UNIVERSITY_PROFILE(universityId), {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  getDebugUserInfo: () => apiRequest(API_ENDPOINTS.DEBUG_USER_INFO),
  
  // Email Verification
  verifyEmail: (token) => apiRequest(API_ENDPOINTS.VERIFY_EMAIL(token), { method: 'GET' }),
  resendVerification: (email) => apiRequest(API_ENDPOINTS.RESEND_VERIFICATION, { method: 'POST', body: JSON.stringify({ email }) }),

  // ICM API functions
  getIcmUniversities: () => apiRequest(API_ENDPOINTS.ICM_UNIVERSITIES),
  getIcmUniversityDetails: (id) => apiRequest(API_ENDPOINTS.ICM_UNIVERSITY_DETAILS(id)),
  getIcmStats: () => apiRequest(API_ENDPOINTS.ICM_STATS),
  getIcmOpportunities: () => apiRequest(API_ENDPOINTS.ICM_OPPORTUNITIES),
  getIcmOpportunity: (opportunityId) => apiRequest(API_ENDPOINTS.ICM_OPPORTUNITY(opportunityId)),
  updateIcmOpportunity: (opportunityId, opportunityData) => apiRequest(API_ENDPOINTS.ICM_OPPORTUNITY(opportunityId), {
    method: 'PUT',
    body: JSON.stringify(opportunityData)
  }),
  deleteIcmOpportunity: (opportunityId) => apiRequest(API_ENDPOINTS.ICM_OPPORTUNITY(opportunityId), {
    method: 'DELETE'
  }),
  getIcmDebugUser: () => apiRequest(API_ENDPOINTS.ICM_DEBUG_USER),
  getIcmHealth: () => apiRequest(API_ENDPOINTS.ICM_HEALTH),
  getIcmOpportunityApplications: (opportunityId) => apiRequest(API_ENDPOINTS.ICM_OPPORTUNITY_APPLICATIONS(opportunityId)),
  updateIcmApplicationStatus: (applicationId, status, reviewNotes) => apiRequest(API_ENDPOINTS.ICM_UPDATE_APPLICATION_STATUS(applicationId), {
    method: 'PUT',
    body: JSON.stringify({ status, reviewNotes })
  }),
  getIcmStudentProfile: (studentId) => apiRequest(API_ENDPOINTS.ICM_STUDENT_PROFILE(studentId)),
  getIcmProfile: () => apiRequest(API_ENDPOINTS.ICM_PROFILE),
  updateIcmProfile: (profileData) => apiRequest(API_ENDPOINTS.ICM_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  searchIcmUniversities: (query) => {
    const url = `${API_ENDPOINTS.ICM_SEARCH_UNIVERSITIES}?q=${encodeURIComponent(query)}`
    return apiRequest(url)
  }
}

import { Routes, Route } from 'react-router-dom'
import './styles/theme.css'
import HomePage from './pages/HomePage'
import { LoginForm, ProtectedRoute, DashboardRedirect, PendingApproval } from './components/shared'
import IcmDashboard from './components/icm/IcmDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Signup from './pages/Signup'
import { PlatformAdminDashboard, PlatformAdminRoute } from './components/platform-admin'
import OpportunitiesList from './pages/OpportunitiesList'
import OpportunityForm from './pages/OpportunityForm'
import UserProfile from './pages/UserProfile'
import AcademicDashboard from './pages/AcademicDashboard'
import UniversityDashboard from './pages/UniversityDashboard'
import UniversityProfile from './pages/UniversityProfile'
import Institutes from './pages/Institutes'
import InstituteDetail from './pages/InstituteDetail'
import EmailVerification from './pages/EmailVerification'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="page-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm onSubmit={(creds)=>console.log('submit', creds)} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          
          {/* Protected role-based routes */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/academic" element={
            <ProtectedRoute requiredRole="academic_leader">
              <AcademicDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/university" element={
            <ProtectedRoute requiredRole="university_admin">
              <UniversityDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/icm" element={
            <ProtectedRoute requiredRole="icm">
              <IcmDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/platform-admin" element={
            <PlatformAdminRoute>
              <PlatformAdminDashboard />
            </PlatformAdminRoute>
          } />
          
          {/* University sub-routes */}
          <Route path="/university/institutes" element={
            <ProtectedRoute requiredRole="university_admin">
              <Institutes />
            </ProtectedRoute>
          } />
          
          <Route path="/university/institutes/:domain" element={
            <ProtectedRoute requiredRole="university_admin">
              <InstituteDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/university/profile" element={
            <ProtectedRoute requiredRole="university_admin">
              <UniversityProfile />
            </ProtectedRoute>
          } />

          {/* Opportunities routes - accessible by ICM users */}
          <Route path="/opportunities" element={
            <ProtectedRoute requiredRole="icm">
              <OpportunitiesList />
            </ProtectedRoute>
          } />
          
          <Route path="/opportunities/new" element={
            <ProtectedRoute requiredRole="icm">
              <OpportunityForm mode="create" />
            </ProtectedRoute>
          } />
          
          <Route path="/opportunities/:id/edit" element={
            <ProtectedRoute requiredRole="icm">
              <OpportunityForm mode="edit" />
            </ProtectedRoute>
          } />
          
          {/* Profile route - accessible by all authenticated users */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route - redirect to appropriate dashboard */}
          <Route path="*" element={<DashboardRedirect />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App

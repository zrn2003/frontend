import { Routes, Route } from 'react-router-dom'
import './styles/theme.css'
import HomePage from './pages/HomePage'
import LoginForm from './components/LoginForm'
import IcmDashboard from './pages/IcmDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Signup from './pages/Signup'
import OpportunitiesList from './pages/OpportunitiesList'
import OpportunityForm from './pages/OpportunityForm'
import UserProfile from './pages/UserProfile'
import StudentRoute from './components/StudentRoute'
import IcmRoute from './components/IcmRoute'

function App() {
  return (
    <div className="page-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm onSubmit={(creds)=>console.log('submit', creds)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/icm" element={<IcmRoute element={<IcmDashboard />} />} />
        <Route path="/student" element={<StudentRoute element={<StudentDashboard />} />} />
        <Route path="/opportunities" element={<OpportunitiesList />} />
        <Route path="/opportunities/new" element={<OpportunityForm mode="create" />} />
        <Route path="/opportunities/:id/edit" element={<OpportunityForm mode="edit" />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </div>
  )
}

export default App

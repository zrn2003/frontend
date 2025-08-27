import { Routes, Route } from 'react-router-dom'
import './styles/theme.css'
import LoginForm from './components/LoginForm'
import IcmDashboard from './pages/IcmDashboard'
import Signup from './pages/Signup'
import OpportunitiesList from './pages/OpportunitiesList'
import OpportunityForm from './pages/OpportunityForm'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <div className="page-container">
      <Routes>
        <Route path="/" element={<LoginForm onSubmit={(creds)=>console.log('submit', creds)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/icm" element={<IcmDashboard />} />
        <Route path="/opportunities" element={<OpportunitiesList />} />
        <Route path="/opportunities/new" element={<OpportunityForm mode="create" />} />
        <Route path="/opportunities/:id/edit" element={<OpportunityForm mode="edit" />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </div>
  )
}

export default App

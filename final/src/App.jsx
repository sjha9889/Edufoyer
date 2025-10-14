import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginModal from './components/LoginModal'
import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'
import DoubtManagement from './components/DoubtManagement'
import NotificationList from './components/NotificationList'
import LiveSession from './components/LiveSession'
import AwaitingSolverPage from './components/AwaitingSolverPage'
import AwaitingSolverDemo from './components/AwaitingSolverDemo'
import TestAwaitingFlow from './components/TestAwaitingFlow'
import LiveKitMeeting from './components/LiveKitMeeting'
import PreviousYearLive from './components/PreviousYearLive'
import JoinPyqRoom from './components/JoinPyqRoom'
import SolveDoubt from './components/SolveDoubt'
import SolvedDoubtsPage from './components/SolvedDoubtsPage'
import SocialDashboard from './components/SocialDashboard'
import CorporateConnect from './components/CorporateConnect'
import OnlineReferralSystem from './components/OnlineReferralSystem'
import LandingPage from './components/LandingPage'
import AdminPanel from './components/AdminPanel'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<LoginModal />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/doubts" element={<DoubtManagement />} />
          <Route path="/dashboard/notifications" element={<NotificationList />} />
          <Route path="/dashboard/awaiting/:doubtId" element={<AwaitingSolverPage />} />
          <Route path="/dashboard/session/:doubtId" element={<LiveKitMeeting />} />
          <Route path="/dashboard/pyq" element={<PreviousYearLive />} />
          <Route path="/dashboard/pyq/:roomName" element={<JoinPyqRoom />} />
          <Route path="/dashboard/solve/:doubtId" element={<SolveDoubt />} />
          <Route path="/dashboard/solved-doubts" element={<SolvedDoubtsPage />} />
          <Route path="/dashboard/corporate-connect" element={<CorporateConnect />} />
          <Route path="/dashboard/referral-system" element={<OnlineReferralSystem />} />
                <Route path="/dashboard/social" element={<SocialDashboard />} />
                <Route path="/dashboard/social/:userId" element={<SocialDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/demo/awaiting-solver" element={<AwaitingSolverDemo />} />
          <Route path="/test/awaiting-flow" element={<TestAwaitingFlow />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

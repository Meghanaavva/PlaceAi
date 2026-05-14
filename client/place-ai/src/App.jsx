import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
 
import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import ResumeBuilder  from './pages/ResumeBuilder'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import SkillGap       from './pages/SkillGap'
import JobRecommendations from './pages/JobRecommendations'
import InterviewPrep  from './pages/InterviewPrep'
import Chatbot        from './pages/Chatbot'
 
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
 
          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/builder"   element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
          <Route path="/analyzer"  element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
          <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
          <Route path="/jobs"      element={<ProtectedRoute><JobRecommendations /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
          <Route path="/chat"      element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
 
          {/* Redirects */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

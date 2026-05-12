import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuth) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
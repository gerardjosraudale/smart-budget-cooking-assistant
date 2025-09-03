import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}

import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { ROUTES } from '../../lib/constants'
import LoadingSpinner from '../common/LoadingSpinner'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <LoadingSpinner size={40} className="text-blue-500" />
      </div>
    )
  }

  if (!loading && !user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}

import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthContext } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import ThemeToggle from '../components/common/ThemeToggle'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { ROUTES, APP_NAME } from '../lib/constants'

export default function Login() {
  const { user, loading } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <LoadingSpinner size={40} className="text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to={ROUTES.HOME} className="text-xl font-bold gradient-text">
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  )
}

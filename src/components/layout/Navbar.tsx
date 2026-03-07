import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Activity } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { signOut } from '../../services/authService'
import ThemeToggle from '../common/ThemeToggle'
import AnimatedButton from '../animations/AnimatedButton'
import { ROUTES, APP_NAME } from '../../lib/constants'

export default function Navbar() {
  const { user, profile, loading } = useAuthContext()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate(ROUTES.HOME)
    } catch {
      // silent
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0F1E]/80 dark:bg-[#0A0F1E]/80 light:bg-white/80 backdrop-blur-md border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <Activity size={24} className="text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link to={ROUTES.DASHBOARD}>
                      <AnimatedButton variant="secondary">Dashboard</AnimatedButton>
                    </Link>
                    <AnimatedButton
                      variant="danger"
                      loading={signingOut}
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </AnimatedButton>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN}>
                      <AnimatedButton variant="secondary">Sign In</AnimatedButton>
                    </Link>
                    <Link to={ROUTES.SIGNUP}>
                      <AnimatedButton variant="primary">Get Started</AnimatedButton>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-800 dark:border-gray-800 light:border-gray-200 bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-white px-4 pb-4 pt-3 flex flex-col gap-2"
          >
            {!loading && (
              <>
                {user ? (
                  <>
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      {profile?.full_name ?? user.email}
                    </div>
                    <Link
                      to={ROUTES.DASHBOARD}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800 transition-all"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); handleSignOut() }}
                      className="text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to={ROUTES.SIGNUP}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl font-semibold text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

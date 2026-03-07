import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Upload,
  MapPin,
  Settings,
  LogOut,
  Activity,
  X,
} from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { signOut } from '../../services/authService'
import { ROUTES, APP_NAME } from '../../lib/constants'
import { useState } from 'react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: ROUTES.DASHBOARD },
  { icon: Upload,          label: 'Upload Report', to: ROUTES.UPLOAD },
  { icon: MapPin,          label: 'Find Doctors',  to: ROUTES.DOCTOR_FINDER },
  { icon: Settings,        label: 'Settings',      to: ROUTES.SETTINGS },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { profile, user } = useAuthContext()
  const navigate = useNavigate()
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
        <div className="flex items-center gap-2">
          <Activity size={22} className="text-blue-500" />
          <span className="font-bold text-white dark:text-white light:text-gray-900 text-lg">
            {APP_NAME}
          </span>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <NavLink
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 pl-[10px]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div className="px-3 py-4 border-t border-gray-800 dark:border-gray-800 light:border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.full_name ?? 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              {(profile?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white dark:text-white light:text-gray-900 text-sm font-medium truncate">
              {profile?.full_name ?? 'User'}
            </p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-60"
        >
          <LogOut size={20} />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 dark:bg-gray-900 light:bg-white border-r border-gray-800 dark:border-gray-800 light:border-gray-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 h-full w-64 bg-gray-900 dark:bg-gray-900 light:bg-white border-r border-gray-800 dark:border-gray-800 light:border-gray-200 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

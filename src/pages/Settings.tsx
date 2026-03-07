import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Trash2,
  Menu,
  CheckCircle,
  AlertCircle,
  Camera,
  Mail,
  LogOut,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import AnimatedButton from '../components/animations/AnimatedButton'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { signOut } from '../services/authService'
import { profileUpdateSchema, type ProfileUpdateFormData } from '../lib/validators'
import { ROUTES } from '../lib/constants'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
}

export default function Settings() {
  const { user, profile } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      email_notifications: profile?.email_notifications ?? true,
      theme: profile?.theme ?? 'dark',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        email_notifications: profile.email_notifications,
        theme: profile.theme,
      })
    }
  }, [profile, reset])

  const emailNotifications = watch('email_notifications')

  const onSubmit = async (data: ProfileUpdateFormData) => {
    if (!user) return
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email_notifications: data.email_notifications,
          theme: data.theme,
        })
        .eq('id', user.id)

      if (error) throw error

      // Sync theme
      if (data.theme !== theme) toggleTheme()

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate(ROUTES.HOME)
    } catch {
      setSigningOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteInput !== 'DELETE') return
    setDeleting(true)
    try {
      // Delete all reports
      await supabase.from('reports').delete().eq('user_id', user.id)
      // Delete profile
      await supabase.from('profiles').delete().eq('id', user.id)
      // Sign out (account deletion requires admin API — we clean data and sign out)
      await signOut()
      navigate(ROUTES.HOME)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  const avatarLetter = (profile?.full_name ?? user?.email ?? 'U')[0].toUpperCase()

  return (
    <div className="flex h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-4 bg-[#0A0F1E]/80 dark:bg-[#0A0F1E]/80 light:bg-white/80 backdrop-blur-md border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
          <button
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white dark:text-white light:text-gray-900">
              Settings
            </h1>
            <p className="text-gray-500 text-xs">Manage your account and preferences</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

          {/* Success / Error banners */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm"
            >
              <CheckCircle size={16} />
              Settings saved successfully!
            </motion.div>
          )}
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              {saveError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Profile Card */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <User size={16} className="text-blue-400" />
                </div>
                <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">
                  Profile
                </h2>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt="Profile"
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-2xl">
                      {avatarLetter}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-gray-800 border border-gray-700">
                    <Camera size={12} className="text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white dark:text-white light:text-gray-900 font-medium">
                    {profile?.full_name ?? 'Your Name'}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                    <Mail size={12} />
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                    {profile?.subscription_tier ?? 'free'} plan
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="Your full name"
                  className="input-dark dark:input-dark light:input-light"
                />
                {errors.full_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>
            </motion.div>

            {/* Notifications Card */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Bell size={16} className="text-amber-400" />
                </div>
                <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">
                  Notifications
                </h2>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white dark:text-white light:text-gray-900 text-sm font-medium">
                    Email Notifications
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Receive email when your report analysis is complete
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('email_notifications', !emailNotifications, { shouldDirty: true })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    emailNotifications ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Theme Card */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Palette size={16} className="text-purple-400" />
                </div>
                <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">
                  Appearance
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('theme', t, { shouldDirty: true })}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                      watch('theme') === t
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                        : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-50 border-gray-700 dark:border-gray-700 light:border-gray-200 text-gray-400 hover:border-blue-500/30'
                    }`}
                  >
                    <span className="text-lg">{t === 'dark' ? '🌙' : '☀️'}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium capitalize">{t} Mode</p>
                    </div>
                    {watch('theme') === t && (
                      <CheckCircle size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatedButton
                type="submit"
                variant="primary"
                fullWidth
                loading={saving}
                disabled={!isDirty}
                className="py-3"
              >
                <Save size={16} />
                Save Changes
              </AnimatedButton>
            </motion.div>
          </form>

          {/* Account Actions */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-red-500/10">
                <Shield size={16} className="text-red-400" />
              </div>
              <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">
                Account
              </h2>
            </div>

            <div className="space-y-3">
              {/* Sign Out */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 dark:bg-gray-800/50 light:bg-gray-50 border border-gray-700 dark:border-gray-700 light:border-gray-200">
                <div>
                  <p className="text-white dark:text-white light:text-gray-900 text-sm font-medium">
                    Sign Out
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Sign out of your MediSense account
                  </p>
                </div>
                <AnimatedButton
                  variant="secondary"
                  loading={signingOut}
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  <LogOut size={14} />
                  Sign Out
                </AnimatedButton>
              </div>

              {/* Delete Account */}
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-sm font-medium">Delete Account</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Permanently delete all your data
                    </p>
                  </div>
                  <AnimatedButton
                    variant="danger"
                    onClick={() => setDeleteConfirm(!deleteConfirm)}
                    className="text-sm"
                  >
                    <Trash2 size={14} />
                    Delete
                  </AnimatedButton>
                </div>

                {/* Confirm delete */}
                {deleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-3"
                  >
                    <p className="text-red-400 text-xs">
                      This action is irreversible. All your reports and data will be permanently deleted.
                      Type <span className="font-bold font-mono">DELETE</span> to confirm.
                    </p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="w-full bg-gray-800 border border-red-500/30 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-600"
                    />
                    <AnimatedButton
                      variant="danger"
                      fullWidth
                      loading={deleting}
                      disabled={deleteInput !== 'DELETE'}
                      onClick={handleDeleteAccount}
                      className="text-sm"
                    >
                      <Trash2 size={14} />
                      Permanently Delete My Account
                    </AnimatedButton>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}

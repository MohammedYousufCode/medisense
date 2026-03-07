import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Menu,
  Trash2,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import AnimatedButton from '../components/animations/AnimatedButton'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthContext } from '../context/AuthContext'
import { useReports } from '../hooks/useReports'
import { ROUTES, STATUS_STYLES, STATUS_LABELS } from '../lib/constants'
import { formatDateTime, truncateText } from '../lib/helpers'
import type { Report } from '../lib/types'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
}

export default function Dashboard() {
  const { user, profile } = useAuthContext()
  const { reports, loading, error, removeReport } = useReports(user?.id)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const stats = {
    total: reports.length,
    completed: reports.filter((r) => r.status === 'completed').length,
    normal: reports.filter((r) => r.overall_status === 'normal').length,
    abnormal: reports.filter((r) => r.overall_status === 'abnormal').length,
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await removeReport(id)
    } finally {
      setDeletingId(null)
    }
  }

  const statCards = [
    { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Normal Results', value: stats.normal, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Needs Attention', value: stats.abnormal, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="flex h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-[#0A0F1E]/80 dark:bg-[#0A0F1E]/80 light:bg-white/80 backdrop-blur-md border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white dark:text-white light:text-gray-900">
                Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="text-gray-500 text-xs">Here's your health overview</p>
            </div>
          </div>
          <Link to={ROUTES.UPLOAD}>
            <AnimatedButton variant="primary" className="text-sm">
              <Upload size={16} />
              Upload Report
            </AnimatedButton>
          </Link>
        </div>

        <div className="px-4 sm:px-6 py-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-4 shadow-xl"
              >
                <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
                  {s.value}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Reports */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white dark:text-white light:text-gray-900 font-semibold text-lg">
                Recent Reports
              </h2>
              {reports.length > 0 && (
                <Link to={ROUTES.UPLOAD} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  + New Report
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size={36} className="text-blue-500" />
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            ) : reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Upload your first medical report to get started with AI-powered analysis."
                action={
                  <Link to={ROUTES.UPLOAD}>
                    <AnimatedButton variant="primary">
                      <Upload size={16} />
                      Upload First Report
                    </AnimatedButton>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reports.map((report: Report, i: number) => (
                  <motion.div
                    key={report.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`${ROUTES.REPORT}/${report.id}`)}
                    className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-4 shadow-xl cursor-pointer transition-all duration-200 hover:border-blue-500/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={18} className="text-blue-400 shrink-0" />
                        <p className="text-white dark:text-white light:text-gray-900 font-medium text-sm truncate">
                          {truncateText(report.file_name, 30)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, report.id)}
                        disabled={deletingId === report.id}
                        className="ml-2 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                        aria-label="Delete report"
                      >
                        {deletingId === report.id ? (
                          <LoadingSpinner size={14} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[report.overall_status]}`}>
                        {STATUS_LABELS[report.overall_status]}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        report.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : report.status === 'processing'
                          ? 'bg-blue-500/10 text-blue-400'
                          : report.status === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-3 text-gray-600 dark:text-gray-600 light:text-gray-400 text-xs">
                      <Clock size={11} />
                      {formatDateTime(report.created_at)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

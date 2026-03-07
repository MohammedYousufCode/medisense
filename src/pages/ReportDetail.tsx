import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import {
  ArrowLeft,
  Download,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Menu,
  Clock,
  RefreshCw,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import AnimatedButton from '../components/animations/AnimatedButton'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getReportById } from '../services/reportService'
import { STATUS_STYLES, STATUS_LABELS } from '../lib/constants'
import { formatDateTime } from '../lib/helpers'
import type { Report, OverallStatus } from '../lib/types'

const statusIcons: Record<OverallStatus, React.ReactNode> = {
  normal: <CheckCircle size={16} className="text-emerald-400" />,
  borderline: <AlertTriangle size={16} className="text-amber-400" />,
  abnormal: <AlertCircle size={16} className="text-red-400" />,
  unknown: <HelpCircle size={16} className="text-gray-400" />,
}

const overallBannerStyles: Record<OverallStatus, string> = {
  normal: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  borderline: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  abnormal: 'bg-red-500/10 border-red-500/30 text-red-400',
  unknown: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35 },
  }),
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getReportById(id)
      .then(setReport)
      .catch((err) => setError(err.message || 'Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  const handleExportPDF = () => {
    if (!report) return
    setExporting(true)

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 18
      const contentWidth = pageWidth - margin * 2
      let y = margin

      const checkPage = (h: number) => {
        if (y + h > pageHeight - 18) {
          pdf.addPage()
          y = margin
        }
      }

      // Status color map
      const statusColors: Record<string, [number, number, number]> = {
        normal: [5, 150, 105],
        borderline: [217, 119, 6],
        abnormal: [220, 38, 38],
        unknown: [107, 114, 128],
      }

      // Row bg for status
      const statusRowBg: Record<string, [number, number, number]> = {
        normal: [240, 253, 244],
        borderline: [255, 251, 235],
        abnormal: [254, 242, 242],
        unknown: [249, 250, 251],
      }

      // ─── HEADER ───────────────────────────────────────────────
      // White header with blue left accent bar
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, 42, 'F')
      // Blue accent bar left
      pdf.setFillColor(37, 99, 235)
      pdf.rect(0, 0, 5, 42, 'F')
      // Bottom border
      pdf.setDrawColor(226, 232, 240)
      pdf.setLineWidth(0.4)
      pdf.line(0, 42, pageWidth, 42)

      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(37, 99, 235)
      pdf.text('MediSense', margin, 16)

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(71, 85, 105)
      pdf.text('AI-Powered Medical Report Analysis', margin, 24)

      pdf.setFontSize(8)
      pdf.setTextColor(148, 163, 184)
      pdf.text(
        `Generated: ${new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}`,
        margin,
        32
      )

      // Status pill top right
      const [hr, hg, hb] = statusColors[report.overall_status] ?? statusColors.unknown
      const hLabel = STATUS_LABELS[report.overall_status].toUpperCase()
      const hWidth = pdf.getTextWidth(hLabel) + 12
      pdf.setFillColor(hr, hg, hb)
      pdf.roundedRect(pageWidth - margin - hWidth, 14, hWidth, 10, 2, 2, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(hLabel, pageWidth - margin - hWidth + 6, 20.5)

      y = 52

      // ─── FILE INFO CARD ────────────────────────────────────────
      pdf.setFillColor(248, 250, 252)
      pdf.setDrawColor(226, 232, 240)
      pdf.setLineWidth(0.3)
      pdf.roundedRect(margin, y, contentWidth, 22, 3, 3, 'FD')

      // Blue left accent on card
      pdf.setFillColor(37, 99, 235)
      pdf.roundedRect(margin, y, 3, 22, 1, 1, 'F')

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(15, 23, 42)
      pdf.text(report.file_name, margin + 8, y + 9)

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)
      pdf.text(`Analyzed: ${formatDateTime(report.created_at)}`, margin + 8, y + 16)

      y += 30

      // ─── OVERALL STATUS BANNER ─────────────────────────────────
      checkPage(22)
      const [sr, sg, sb] = statusColors[report.overall_status] ?? statusColors.unknown
      const [br, bg_, bb] = statusRowBg[report.overall_status] ?? statusRowBg.unknown
      pdf.setFillColor(br, bg_, bb)
      pdf.setDrawColor(sr, sg, sb)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(margin, y, contentWidth, 20, 3, 3, 'FD')
      pdf.setFillColor(sr, sg, sb)
      pdf.roundedRect(margin, y, 4, 20, 1, 1, 'F')

      pdf.setTextColor(sr, sg, sb)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Overall Health Status: ${STATUS_LABELS[report.overall_status]}`, margin + 9, y + 9)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(71, 85, 105)
      pdf.text('Based on AI analysis of your medical report parameters', margin + 9, y + 15)

      y += 28

      // ─── SECTION HEADER HELPER ────────────────────────────────
      const sectionHeader = (title: string, r: number, g: number, b: number) => {
        checkPage(14)
        pdf.setFillColor(r, g, b)
        pdf.rect(margin, y, 4, 10, 'F')
        pdf.setFillColor(r, g, b, 0.08)
        pdf.setFillColor(
          Math.min(r + 200, 255),
          Math.min(g + 200, 255),
          Math.min(b + 200, 255)
        )
        pdf.rect(margin + 4, y, contentWidth - 4, 10, 'F')
        pdf.setTextColor(r, g, b)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(title, margin + 9, y + 7)
        y += 14
      }

      // ─── AI SUMMARY ───────────────────────────────────────────
      if (report.simplified_text) {
        sectionHeader('AI SUMMARY', 8, 145, 178)

        const lines = pdf.splitTextToSize(report.simplified_text, contentWidth - 8)
        pdf.setFillColor(240, 249, 255)
        pdf.setDrawColor(186, 230, 253)
        pdf.setLineWidth(0.3)
        const summaryHeight = lines.length * 5.5 + 8
        checkPage(summaryHeight)
        pdf.roundedRect(margin, y, contentWidth, summaryHeight, 2, 2, 'FD')

        lines.forEach((line: string, idx: number) => {
          pdf.setTextColor(30, 41, 59)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          pdf.text(line, margin + 4, y + 6 + idx * 5.5)
        })
        y += summaryHeight + 8
      }

      // ─── PARAMETERS TABLE ─────────────────────────────────────
      if (report.parameters?.length > 0) {
        sectionHeader('HEALTH PARAMETERS', 37, 99, 235)

        // Table header row
        const cols = [65, 35, 48, 22]
        const headers = ['Parameter', 'Value', 'Normal Range', 'Status']
        checkPage(10)
        pdf.setFillColor(30, 58, 138)
        pdf.rect(margin, y, contentWidth, 9, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        let xp = margin + 3
        headers.forEach((h, i) => {
          pdf.text(h.toUpperCase(), xp, y + 6)
          xp += cols[i]
        })
        y += 9

        report.parameters.forEach((param, i) => {
          checkPage(9)
          const rowStatus = param.status in statusRowBg ? param.status : 'unknown'
          const [rbr, rbg, rbb] = statusRowBg[rowStatus]

          // Alternate: white vs status-tinted
          if (param.status === 'abnormal' || param.status === 'borderline') {
            pdf.setFillColor(rbr, rbg, rbb)
          } else {
            pdf.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252)
          }
          pdf.rect(margin, y, contentWidth, 9, 'F')

          // Draw bottom separator
          pdf.setDrawColor(226, 232, 240)
          pdf.setLineWidth(0.2)
          pdf.line(margin, y + 9, margin + contentWidth, y + 9)

          const [pr, pg, pb] = statusColors[param.status] ?? statusColors.unknown
          xp = margin + 3

          pdf.setTextColor(15, 23, 42)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(8.5)
          pdf.text(param.name, xp, y + 6)
          xp += cols[0]

          pdf.setTextColor(30, 41, 59)
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(8.5)
          pdf.text(`${param.value} ${param.unit}`, xp, y + 6)
          xp += cols[1]

          pdf.setTextColor(71, 85, 105)
          pdf.setFontSize(8)
          pdf.text(param.normal_range, xp, y + 6)
          xp += cols[2]

          // Status pill
          pdf.setFillColor(pr, pg, pb)
          const sLabel = STATUS_LABELS[param.status as OverallStatus] ?? param.status
          const pillW = pdf.getTextWidth(sLabel) + 6
          pdf.roundedRect(xp, y + 1.5, pillW, 6, 1, 1, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(7)
          pdf.text(sLabel, xp + 3, y + 6)

          y += 9
        })
        y += 8
      }

      // ─── HEALTH ADVICE ────────────────────────────────────────
      if (report.advice?.length > 0) {
        sectionHeader('HEALTH ADVICE', 180, 83, 9)

        report.advice.forEach((tip, i) => {
          const tipLines = pdf.splitTextToSize(tip, contentWidth - 16)
          const tipHeight = tipLines.length * 5.5 + 8
          checkPage(tipHeight + 4)

          // Card bg
          pdf.setFillColor(255, 251, 235)
          pdf.setDrawColor(253, 230, 138)
          pdf.setLineWidth(0.3)
          pdf.roundedRect(margin, y, contentWidth, tipHeight, 2, 2, 'FD')

          // Number circle
          pdf.setFillColor(180, 83, 9)
          pdf.circle(margin + 6, y + tipHeight / 2, 4, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'bold')
          pdf.text(String(i + 1), margin + (i + 1 >= 10 ? 3.5 : 4.5), y + tipHeight / 2 + 2.5)

          tipLines.forEach((line: string, li: number) => {
            pdf.setTextColor(30, 41, 59)
            pdf.setFont('helvetica', li === 0 ? 'bold' : 'normal')
            pdf.setFontSize(9)
            pdf.text(line, margin + 14, y + 6 + li * 5.5)
          })

          y += tipHeight + 4
        })
        y += 4
      }

      // ─── DISCLAIMER ───────────────────────────────────────────
      checkPage(18)
      pdf.setFillColor(241, 245, 249)
      pdf.setDrawColor(203, 213, 225)
      pdf.setLineWidth(0.3)
      pdf.roundedRect(margin, y, contentWidth, 16, 3, 3, 'FD')
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(7.5)
      pdf.setFont('helvetica', 'normal')
      const disc =
        '⚠ MediSense is for informational purposes only. This AI-generated analysis is not a substitute for professional medical advice. Always consult a qualified healthcare professional.'
      const discLines = pdf.splitTextToSize(disc, contentWidth - 8)
      discLines.forEach((line: string, i: number) => {
        pdf.text(line, margin + 4, y + 6 + i * 4.5)
      })

      // ─── FOOTER ALL PAGES ─────────────────────────────────────
      const totalPages = (pdf as any).internal.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p)
        pdf.setFillColor(248, 250, 252)
        pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F')
        pdf.setDrawColor(226, 232, 240)
        pdf.setLineWidth(0.3)
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
        pdf.setFontSize(7)
        pdf.setTextColor(148, 163, 184)
        pdf.setFont('helvetica', 'normal')
        pdf.text('MediSense — AI Medical Report Analyzer', margin, pageHeight - 5)
        pdf.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 5)
      }

      const date = new Date().toISOString().split('T')[0]
      pdf.save(`medisense-report-${date}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  // ─── JSX (unchanged) ──────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-[#0A0F1E]/80 dark:bg-[#0A0F1E]/80 light:bg-white/80 backdrop-blur-md border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white dark:text-white light:text-gray-900">
                Report Detail
              </h1>
              <p className="text-gray-500 text-xs">AI-analyzed medical report</p>
            </div>
          </div>
          {report && (
            <AnimatedButton
              variant="secondary"
              loading={exporting}
              onClick={handleExportPDF}
              className="text-sm"
            >
              <Download size={16} />
              Export PDF
            </AnimatedButton>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size={40} className="text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-red-400 font-medium">{error}</p>
              <AnimatedButton variant="secondary" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Go Back
              </AnimatedButton>
            </div>
          ) : !report ? null : (
            <div className="space-y-5">
              <motion.div
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <FileText size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white dark:text-white light:text-gray-900 font-semibold">
                        {report.file_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                        <Clock size={11} />
                        {formatDateTime(report.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_STYLES[report.overall_status]}`}>
                      {STATUS_LABELS[report.overall_status]}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : report.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={`flex items-center gap-3 p-4 rounded-2xl border ${overallBannerStyles[report.overall_status]}`}
              >
                <Activity size={20} />
                <div>
                  <p className="font-semibold text-sm">Overall Health Status: {STATUS_LABELS[report.overall_status]}</p>
                  <p className="text-xs opacity-80 mt-0.5">Based on AI analysis of your medical report parameters</p>
                </div>
              </motion.div>

              {report.simplified_text && (
                <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible"
                  className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10">
                      <RefreshCw size={16} className="text-cyan-400" />
                    </div>
                    <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">AI Summary</h2>
                  </div>
                  <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-sm leading-relaxed">{report.simplified_text}</p>
                </motion.div>
              )}

              {report.parameters && report.parameters.length > 0 && (
                <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible"
                  className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                  <div className="flex items-center gap-2 p-5 border-b border-gray-800 dark:border-gray-800 light:border-gray-100">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <Activity size={16} className="text-blue-400" />
                    </div>
                    <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">Health Parameters</h2>
                    <span className="ml-auto text-xs text-gray-500">{report.parameters.length} parameters</span>
                  </div>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800 dark:border-gray-800 light:border-gray-100">
                          {['Parameter', 'Value', 'Normal Range', 'Status'].map((h) => (
                            <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.parameters.map((param, i) => (
                          <motion.tr key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                            className="border-b border-gray-800/50 dark:border-gray-800/50 light:border-gray-50 last:border-0 hover:bg-gray-800/30 transition-colors">
                            <td className="px-5 py-3.5 text-white dark:text-white light:text-gray-900 text-sm font-medium">{param.name}</td>
                            <td className="px-5 py-3.5 text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm font-mono">{param.value} {param.unit}</td>
                            <td className="px-5 py-3.5 text-gray-500 text-sm">{param.normal_range}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[param.status]}`}>
                                {statusIcons[param.status]}
                                {STATUS_LABELS[param.status]}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="sm:hidden divide-y divide-gray-800">
                    {report.parameters.map((param, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm">{param.name}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[param.status]}`}>
                            {statusIcons[param.status]}
                            {STATUS_LABELS[param.status]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 font-mono">{param.value} {param.unit}</span>
                          <span className="text-gray-500 text-xs">Range: {param.normal_range}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {report.advice && report.advice.length > 0 && (
                <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible"
                  className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <Lightbulb size={16} className="text-amber-400" />
                    </div>
                    <h2 className="text-white dark:text-white light:text-gray-900 font-semibold">Health Advice</h2>
                  </div>
                  <ul className="space-y-3">
                    {report.advice.map((tip, i) => (
                      <motion.li key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                        className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-sm leading-relaxed">{tip}</p>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {report.extracted_text && (
                <motion.details custom={5} variants={cardVariants} initial="hidden" animate="visible"
                  className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <summary className="flex items-center gap-2 px-5 py-4 cursor-pointer text-gray-400 hover:text-white transition-colors text-sm font-medium select-none">
                    <FileText size={16} />
                    View Raw Extracted Text
                  </summary>
                  <div className="px-5 pb-5">
                    <pre className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-4 max-h-60 overflow-y-auto">
                      {report.extracted_text}
                    </pre>
                  </div>
                </motion.details>
              )}

              <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
                className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700">
                <p className="text-gray-500 text-xs text-center leading-relaxed">
                  ⚠️ MediSense is for informational purposes only. This analysis is AI-generated and not a substitute for professional medical advice. Always consult a qualified healthcare professional.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

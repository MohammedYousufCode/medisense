import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, X, CheckCircle, AlertCircle, Loader2, Menu, ChevronRight, Brain } from 'lucide-react'

import Sidebar from '../components/layout/Sidebar'
import AnimatedButton from '../components/animations/AnimatedButton'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthContext } from '../context/AuthContext'
import { analyzeReportFile } from '../services/geminiService'
import { useGemini } from '../hooks/useGemini'
import { uploadReportFile } from '../services/storageService'
import { createReport } from '../services/reportService'
import { validateFile, formatFileSize, isImageFile } from '../lib/helpers'
import { ROUTES, SUPPORTED_FILE_TYPES } from '../lib/constants'

type PipelineStep = 'idle' | 'uploading' | 'ai' | 'saving' | 'done' | 'error'

// ✅ Remove 'ocr' entry, update 'ai' label
const stepLabels: Record<PipelineStep, string> = {
  idle: 'Ready',
  uploading: 'Uploading file...',
  ai: 'Analyzing with Gemini AI...',       // Gemini now handles everything
  saving: 'Saving your report...',
  done: 'Analysis complete!',
  error: 'Something went wrong',
}


export default function UploadReport() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { analyze } = useGemini()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [step, setStep] = useState<PipelineStep>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (selected: File) => {
    const err = validateFile(selected)
    if (err) {
      setFileError(err)
      return
    }
    setFileError(null)
    setFile(selected)
    setStep('idle')

    if (isImageFile(selected.type)) {
      const url = URL.createObjectURL(selected)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setFileError(null)
    setStep('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const runPipeline = async () => {
  if (!file || !user) return

  try {
    // Step 1: Upload to Supabase Storage
    setStep('uploading')
    const filePath = await uploadReportFile(file, user.id)

    // Step 2: Skip OCR — send PDF/image directly to Gemini
    setStep('ai')
    const aiResult = await analyzeReportFile(file)

    // Step 3: Save to DB
    setStep('saving')
    const report = await createReport({
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      file_url: filePath,
      extracted_text: '',           // No OCR needed anymore
      simplified_text: aiResult?.simplified_text ?? null,
      parameters: aiResult?.parameters ?? [],
      advice: aiResult?.advice ?? [],
      overall_status: aiResult?.overall_status ?? 'unknown',
      status: 'completed',
    })

    setStep('done')
    setTimeout(() => {
      navigate(`${ROUTES.REPORT}/${report.id}`)
    }, 1200)
  } catch (err: any) {
    console.error('Pipeline error:', err)
    setStep('error')
  }
}


  const isProcessing = ['uploading', 'ocr', 'ai', 'saving'].includes(step)

  const pipelineSteps = [
  { key: 'uploading', label: 'Upload' },
  { key: 'ai', label: 'AI Analysis' },
  { key: 'saving', label: 'Save' },
  { key: 'done', label: 'Done' },
]

  const currentStepIndex = pipelineSteps.findIndex((s) => s.key === step)

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
              Upload Report
            </h1>
            <p className="text-gray-500 text-xs">PDF or image — we'll analyze it with AI</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Drop Zone */}
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-blue-500/50 hover:bg-blue-500/5'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={SUPPORTED_FILE_TYPES.join(',')}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                  <Upload size={32} className="text-blue-400" />
                </div>
                <p className="text-white dark:text-white light:text-gray-900 font-semibold text-lg mb-1">
                  Drop your report here
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  or click to browse files
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {['PDF', 'JPEG', 'PNG', 'WEBP'].map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1 rounded-full bg-gray-800 dark:bg-gray-800 light:bg-gray-100 text-gray-400 border border-gray-700 dark:border-gray-700 light:border-gray-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-xs mt-3">Max file size: 10MB</p>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isImageFile(file.type) ? (
                      <Image size={20} className="text-blue-400 shrink-0" />
                    ) : (
                      <FileText size={20} className="text-blue-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-white dark:text-white light:text-gray-900 font-medium text-sm">
                        {file.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(file.size)} · {file.type}
                      </p>
                    </div>
                  </div>
                  {!isProcessing && step !== 'done' && (
                    <button
                      onClick={clearFile}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Image preview */}
                {preview && (
                  <img
                    src={preview}
                    alt="Report preview"
                    className="w-full max-h-64 object-cover rounded-2xl mb-4"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* File error */}
          {fileError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} />
              {fileError}
            </div>
          )}

          {/* Pipeline Progress */}
          <AnimatePresence>
            {isProcessing || step === 'done' || step === 'error' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-5 shadow-xl space-y-4"
              >
                {/* Step indicators */}
                <div className="flex items-center justify-between">
                  {pipelineSteps.map((s, i) => {
                    const isDone = currentStepIndex > i || step === 'done'
                    const isActive = s.key === step
                    return (
                      <div key={s.key} className="flex items-center gap-1">
                        <div className={`
                          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                          ${isDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gray-800 text-gray-600 border border-gray-700'}
                        `}>
                          {isDone ? <CheckCircle size={14} /> : isActive ? <Loader2 size={14} className="animate-spin" /> : i + 1}
                        </div>
                        {i < pipelineSteps.length - 1 && (
                          <ChevronRight size={12} className={isDone ? 'text-emerald-500' : 'text-gray-700'} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Status message */}
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  step === 'done' ? 'text-emerald-400'
                  : step === 'error' ? 'text-red-400'
                  : 'text-blue-400'
                }`}>
                  {step === 'done' ? <CheckCircle size={16} /> :
                   step === 'error' ? <AlertCircle size={16} /> :
                   <LoadingSpinner size={16} />}
                  {stepLabels[step]}
                </div>

              

                {step === 'error' && (
                  <button
                    onClick={() => setStep('idle')}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Try again
                  </button>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Analyze Button */}
          {file && !isProcessing && step !== 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnimatedButton
                variant="primary"
                fullWidth
                className="py-3 text-base"
                onClick={runPipeline}
                loading={isProcessing}
              >
                <Brain size={18} />
                Analyze with AI
              </AnimatedButton>
              <p className="text-center text-gray-600 text-xs mt-2">
                This may take 20–60 seconds depending on file size
              </p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  )
}

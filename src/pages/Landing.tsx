import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  Brain,
  MapPin,
  FileText,
  Shield,
  Zap,
  ChevronRight,
  Activity,
  CheckCircle,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AnimatedButton from '../components/animations/AnimatedButton'
import { ROUTES } from '../lib/constants'

const features = [
  {
    icon: Upload,
    title: 'Upload Any Report',
    desc: 'Supports PDF and image formats. Drag and drop or browse your files securely.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Brain,
    title: 'AI Simplification',
    desc: 'Google Gemini AI reads your report and explains it in plain, easy language.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Activity,
    title: 'Color-Coded Results',
    desc: 'Each health parameter is color-coded — green for normal, yellow for borderline, red for abnormal.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: MapPin,
    title: 'Find Nearby Doctors',
    desc: 'Locate specialist doctors near you on an interactive map powered by OpenStreetMap.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: FileText,
    title: 'PDF Export',
    desc: 'Download your simplified report as a clean PDF to share with your doctor.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your reports are protected with Supabase Row-Level Security — only you can see them.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

const steps = [
  { step: '01', title: 'Upload Your Report', desc: 'Upload a PDF or image of your medical report.' },
  { step: '02', title: 'OCR Extracts Text', desc: 'Tesseract.js reads every word from your document.' },
  { step: '03', title: 'Gemini Analyzes', desc: 'AI simplifies the medical jargon into plain language.' },
  { step: '04', title: 'View Your Results', desc: 'See color-coded parameters and personalized advice.' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Zap size={14} />
            Powered by Google Gemini 1.5 Flash
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white dark:text-white light:text-gray-900 leading-tight tracking-tight mb-6">
            Understand Your{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Medical Reports
            </span>{' '}
            with AI
          </h1>

          <p className="text-lg text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Upload any medical report — blood test, X-ray, or scan. MediSense extracts, simplifies,
            and explains your results in plain language. No medical degree required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.SIGNUP}>
              <AnimatedButton variant="primary" className="px-8 py-3 text-base">
                Get Started Free
                <ChevronRight size={18} />
              </AnimatedButton>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <AnimatedButton variant="secondary" className="px-8 py-3 text-base">
                Sign In
              </AnimatedButton>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            {['No credit card required', 'Free forever plan', 'Secure & private'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[#060B14] dark:bg-[#060B14] light:bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-3">
              Everything you need to{' '}
              <span className="gradient-text">understand your health</span>
            </h2>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-xl mx-auto">
              MediSense combines OCR, AI, and interactive maps to give you a complete health analysis experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-100 rounded-2xl p-6 shadow-xl transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                  <feature.icon size={22} className={feature.color} />
                </div>
                <h3 className="text-white dark:text-white light:text-gray-900 font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-3">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-lg mx-auto">
              From upload to insight in under 30 seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-lg mb-4">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-1rem)] h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
                )}
                <h3 className="text-white dark:text-white light:text-gray-900 font-semibold mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-200 rounded-2xl p-10 text-center shadow-xl"
          >
            <h2 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-3">
              Ready to understand your health?
            </h2>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-7">
              Join MediSense today — free, private, and powered by AI.
            </p>
            <Link to={ROUTES.SIGNUP}>
              <AnimatedButton variant="primary" className="px-10 py-3 text-base">
                Create Free Account
                <ChevronRight size={18} />
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

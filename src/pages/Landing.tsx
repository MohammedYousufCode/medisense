import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, Upload, Brain, Shield, MapPin, FileText,
  ChevronRight, CheckCircle, Zap, Lock, Star, ArrowRight
} from 'lucide-react'
import AnimatedButton from '../components/animations/AnimatedButton'
import PageTransition from '../components/animations/PageTransition'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    desc: 'Google Gemini 1.5 Flash decodes complex medical terminology into plain, understandable language.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Instant OCR Extraction',
    desc: 'Tesseract.js extracts text from any PDF or image report directly in your browser — no upload to external servers.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Shield,
    title: 'Color-Coded Results',
    desc: 'Every health parameter is categorized as Normal, Borderline, or Abnormal with clear visual indicators.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: MapPin,
    title: 'Doctor Finder',
    desc: 'Find qualified medical specialists near your location using real-time maps powered by OpenStreetMap.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: FileText,
    title: 'PDF Export',
    desc: 'Download a beautifully formatted PDF summary of your analysis to share with your healthcare provider.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    desc: 'End-to-end encryption with Supabase RLS policies. Only you can access your medical data.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
]

const steps = [
  { num: '01', title: 'Upload Your Report', desc: 'Drag and drop any medical report — blood work, X-ray findings, lab results in PDF or image format.' },
  { num: '02', title: 'AI Extracts & Analyzes', desc: 'Our OCR engine reads your document. Then Gemini AI interprets every value against medical standards.' },
  { num: '03', title: 'Get Clear Insights', desc: 'Receive a color-coded breakdown of all parameters with plain English explanations and health advice.' },
  { num: '04', title: 'Take Action', desc: 'Download your report, find nearby doctors, and track your health trends over time.' },
]

const stats = [
  { value: '50K+', label: 'Reports Analyzed' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '< 30s', label: 'Analysis Time' },
  { value: '150+', label: 'Parameters Detected' },
]

const testimonials = [
  {
    text: "MediSense translated my blood work into something I could actually understand. Found out I was borderline anemic before my doctor even called.",
    name: "Sarah M.",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    text: "The color-coded parameters are brilliant. I can immediately see what needs attention without any medical background.",
    name: "Raj K.",
    role: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    text: "Used it to analyze my mother's diabetes panel. The AI advice was spot-on and helped us have a much better conversation with her specialist.",
    name: "Elena V.",
    role: "Nurse Practitioner",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
]

export default function Landing() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6"
                >
                  <Zap className="w-3 h-3" />
                  Powered by Groq Llama-3.3-70B
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-5xl sm:text-6xl font-bold leading-tight mb-6"
                >
                  <span className="text-gray-900 dark:text-white">Understand Your</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    Medical Reports
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-white">Instantly</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg"
                >
                  Upload any medical report and get AI-powered plain-English analysis, color-coded health parameters, personalized advice, and nearby doctor recommendations — in seconds.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-col sm:flex-row gap-3 mb-8"
                >
                  <Link to="/signup">
                    <AnimatedButton size="lg" className="w-full sm:w-auto">
                      Start Analyzing Free
                      <ArrowRight className="w-4 h-4" />
                    </AnimatedButton>
                  </Link>
                  <Link to="/login">
                    <AnimatedButton variant="secondary" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </AnimatedButton>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex flex-wrap gap-4 text-sm text-gray-500"
                >
                  {['Free to start', 'No credit card', 'HIPAA-conscious'].map(t => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {t}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Hero image grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden h-48 mt-8">
                      <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop"
                        alt="Medical laboratory"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden h-36">
                      <img
                        src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&auto=format&fit=crop"
                        alt="Doctor reviewing results"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden h-36">
                      <img
                        src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&auto=format&fit=crop"
                        alt="Medical equipment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-2xl overflow-hidden h-48">
                      <img
                        src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&auto=format&fit=crop"
                        alt="Healthcare professional"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Overall Status</p>
                      <p className="text-sm font-bold text-emerald-400">All Normal ✓</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-gray-800 dark:border-gray-800 border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Healthcare image banner */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-4 rounded-3xl overflow-hidden h-64">
              <div className="col-span-1 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop"
                  alt="Healthcare team"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="col-span-1 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop"
                  alt="Medical research"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="col-span-1 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop"
                  alt="Patient care"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Everything you need to understand your health
              </motion.h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                MediSense combines cutting-edge AI with an intuitive interface to make medical reports accessible to everyone.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.bg}`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 border-t border-gray-800 dark:border-gray-800 border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                How MediSense works
              </motion.h2>
              <p className="text-gray-400 max-w-xl mx-auto">From upload to actionable insight in under 30 seconds.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400 font-mono">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden h-96"
              >
                <img
                  src="https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&auto=format&fit=crop"
                  alt="Doctor with tablet"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Trusted by thousands</h2>
              <p className="text-gray-600 dark:text-gray-400">Real people, real health insights.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-gray-800 dark:border-gray-800 border-gray-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Start understanding your health today
              </h2>
              <p className="text-gray-400 mb-8">
                Join 50,000+ people who use MediSense to take control of their medical data.
              </p>
              <Link to="/signup">
                <AnimatedButton size="lg">
                  Get Started — It's Free
                  <ChevronRight className="w-5 h-5" />
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}

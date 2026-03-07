import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertTriangle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AnimatedButton from '../components/animations/AnimatedButton'
import { ROUTES } from '../lib/constants'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertTriangle size={40} className="text-amber-400" />
          </div>
          <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white dark:text-white light:text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to={ROUTES.HOME}>
            <AnimatedButton variant="primary" className="px-8 py-3">
              <Home size={18} />
              Back to Home
            </AnimatedButton>
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Activity, Heart } from 'lucide-react'
import { APP_NAME, ROUTES } from '../../lib/constants'

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-white border-t border-gray-800 dark:border-gray-800 light:border-gray-200 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={20} className="text-blue-500" />
              <span className="font-bold text-white dark:text-white light:text-gray-900 text-lg">
                {APP_NAME}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-500 light:text-gray-600 text-sm leading-relaxed">
              AI-powered medical report analyzer that helps you understand your health in plain language.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white dark:text-white light:text-gray-900 font-semibold mb-3 text-sm uppercase tracking-wide">
              Product
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Dashboard', to: ROUTES.DASHBOARD },
                { label: 'Upload Report', to: ROUTES.UPLOAD },
                { label: 'Find Doctors', to: ROUTES.DOCTOR_FINDER },
                { label: 'Settings', to: ROUTES.SETTINGS },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-500 hover:text-blue-400 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white dark:text-white light:text-gray-900 font-semibold mb-3 text-sm uppercase tracking-wide">
              Info
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              MediSense is for informational purposes only. Always consult a qualified healthcare professional for medical advice.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-800 light:border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            Built with <Heart size={12} className="text-red-400" /> using React + Supabase + Gemini AI
          </p>
        </div>
      </div>
    </footer>
  )
}

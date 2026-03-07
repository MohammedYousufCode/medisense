import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.07 }}
      aria-label="Toggle theme"
      className="p-2 rounded-xl bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 text-gray-300 hover:text-white hover:border-blue-500 transition-all duration-200"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-yellow-400" />
      ) : (
        <Moon size={18} className="text-blue-400" />
      )}
    </motion.button>
  )
}

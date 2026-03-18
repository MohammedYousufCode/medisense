import { motion } from 'framer-motion'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import LoadingSpinner from '../common/LoadingSpinner'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500',
  secondary: 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 dark:bg-gray-800 dark:text-gray-200',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function AnimatedButton({
  children,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      {...(props as any)}
      disabled={loading || disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-semibold
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && <LoadingSpinner size={16} />}
      {children}
    </motion.button>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { loginSchema, type LoginFormData } from '../../lib/validators'
import { signInWithEmail } from '../../services/authService'
import { ROUTES } from '../../lib/constants'
import AnimatedButton from '../animations/AnimatedButton'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    setLoading(true)
    try {
      await signInWithEmail(data.email, data.password)
      // Navigation handled via useEffect in page watching user
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
            Sign in to your MediSense account
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="input-dark dark:input-dark light:input-light pl-9"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="input-dark dark:input-dark light:input-light pl-9"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <AnimatedButton type="submit" loading={loading} fullWidth>
            Sign In
          </AnimatedButton>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to={ROUTES.SIGNUP} className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

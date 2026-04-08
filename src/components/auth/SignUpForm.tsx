import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, CheckCircle } from 'lucide-react'
import { signupSchema, type SignupFormData } from '../../lib/validators'
import { signUpWithEmail } from '../../services/authService'
import { ROUTES } from '../../lib/constants'
import AnimatedButton from '../animations/AnimatedButton'

export default function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null)
    setLoading(true)
    try {
      await signUpWithEmail(data.email, data.password, data.full_name)
      setSuccess(true)
    } catch (err: any) {
      setServerError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-200 rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            We've sent a confirmation link to your email. Click it to activate your account.
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="text-blue-400 hover:text-blue-300 font-medium text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 dark:bg-gray-900 light:bg-white border border-gray-800 dark:border-gray-800 light:border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
            Join MediSense — understand your health reports
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                {...register('full_name')}
                placeholder="Your full name"
                className="input-dark dark:input-dark light:input-light pl-14 placeholder:text-gray-500"
              />
            </div>
            {errors.full_name && (
              <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="input-dark dark:input-dark light:input-light pl-14 placeholder:text-gray-500"
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
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="password"
                {...register('password')}
                placeholder="Min. 6 characters"
                className="input-dark dark:input-dark light:input-light pl-14 placeholder:text-gray-500"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="password"
                {...register('confirm_password')}
                placeholder="Repeat password"
                className="input-dark dark:input-dark light:input-light pl-14 placeholder:text-gray-500"
              />
            </div>
            {errors.confirm_password && (
              <p className="text-red-400 text-sm mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <AnimatedButton type="submit" loading={loading} fullWidth>
            Create Account
          </AnimatedButton>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

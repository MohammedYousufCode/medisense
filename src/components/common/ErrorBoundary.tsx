import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-4 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertTriangle size={40} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm max-w-md mb-2">
            An unexpected error occurred. This has been logged.
          </p>
          {this.state.error && (
            <pre className="text-red-400 text-xs bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-6 max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all"
          >
            <RefreshCw size={16} />
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

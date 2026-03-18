export const APP_NAME = 'MediSense'
export const APP_TAGLINE = 'Understand Your Health Reports with AI'
export const THEME_KEY = 'medisense-theme'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  REPORT: '/report',
  DOCTOR_FINDER: '/doctor-finder',
  SETTINGS: '/settings',
} as const

export const STATUS_STYLES: Record<string, string> = {
  normal: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  borderline: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  abnormal: 'bg-red-500/20 text-red-400 border border-red-500/30',
  unknown: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}

export const STATUS_LABELS: Record<string, string> = {
  normal: 'Normal',
  borderline: 'Borderline',
  abnormal: 'Abnormal',
  unknown: 'Unknown',
}

export const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

//export const GEMINI_MODEL = 'gemini-1.5-flash'      // try first
//export const GEMINI_MODEL = 'gemini-1.5-flash-latest' // try second  
export const GEMINI_MODEL = 'gemini-pro'              // try third

export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export const DOCTOR_SEARCH_RADIUS_KM = 5
export const MAP_DEFAULT_ZOOM = 13
export const MAP_DEFAULT_CENTER: [number, number] = [12.2979, 76.6392] // Mysore




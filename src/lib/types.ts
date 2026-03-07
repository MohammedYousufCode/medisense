export type SubscriptionTier = 'free' | 'premium'
export type ThemeType = 'dark' | 'light'
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type OverallStatus = 'normal' | 'borderline' | 'abnormal' | 'unknown'

export interface Profile {
  id: string
  full_name: string | null
  photo_url: string | null
  subscription_tier: SubscriptionTier
  email_notifications: boolean
  theme: ThemeType
  created_at: string
}

export interface HealthParameter {
  name: string
  value: string
  unit: string
  normal_range: string
  status: OverallStatus
  description?: string   // ← add this line
}


export interface Report {
  id: string
  user_id: string
  file_name: string
  file_type: string
  file_url: string | null
  extracted_text: string | null
  simplified_text: string | null
  parameters: HealthParameter[]
  advice: string[]
  overall_status: OverallStatus
  status: ReportStatus
  created_at: string
}

export interface AuthUser {
  id: string
  email: string | null
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

// Supabase Database type map
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at'>
        Update: Partial<Omit<Report, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}

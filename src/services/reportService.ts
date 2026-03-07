import { supabase } from '../lib/supabase'
import { sendAnalysisCompleteEmail } from './emailService'
import type { Report } from '../lib/types'

export async function getUserReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Report[]) ?? []
}

export async function getReportById(id: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) throw new Error('Report not found')
  return data as Report
}

export async function createReport(
  report: Omit<Report, 'id' | 'created_at'>
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create report')

  // Send email notification if completed
  if (data.status === 'completed') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_notifications, full_name')
      .eq('id', report.user_id)
      .single()

    const { data: userRecord } = await supabase.auth.getUser()
    const email = userRecord?.user?.email

    if (profile?.email_notifications && email) {
      await sendAnalysisCompleteEmail(
        email,
        profile.full_name ?? 'User',
        report.file_name,
        report.overall_status
      )
    }
  }

  return data as Report
}

export async function updateReport(
  id: string,
  updates: Partial<Omit<Report, 'id' | 'user_id' | 'created_at'>>
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to update report')
  return data as Report
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getReportStats(userId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('overall_status, status')
    .eq('user_id', userId)

  if (error) throw error

  const reports = data ?? []
  return {
    total: reports.length,
    completed: reports.filter((r) => r.status === 'completed').length,
    normal: reports.filter((r) => r.overall_status === 'normal').length,
    borderline: reports.filter((r) => r.overall_status === 'borderline').length,
    abnormal: reports.filter((r) => r.overall_status === 'abnormal').length,
  }
}

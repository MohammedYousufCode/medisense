import { supabase } from '../lib/supabase'
import { sendAnalysisCompleteEmail } from './emailService'
import { deleteReportFile } from './storageService'
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

// H1: ownership check added — user_id must match authenticated user
export async function getReportById(id: string, userId: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
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

  if (data.status === 'completed') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_notifications, full_name')
      .eq('id', report.user_id)
      .single()

    const { data: userRecord } = await supabase.auth.getUser()
    const email = userRecord?.user?.email

    // Send if email_notifications is true OR null (null = user never changed the setting,
    // treat as opted-in by default). Only skip if explicitly set to false.
    if (profile && profile.email_notifications !== false && email) {
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

// C3: Fetch file_url first, delete DB row, then clean up Storage (best-effort)
export async function deleteReport(id: string): Promise<void> {
  const { data: row } = await supabase
    .from('reports')
    .select('file_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) throw error

  if (row?.file_url) {
    deleteReportFile(row.file_url).catch((err) =>
      console.warn('[MediSense] Storage cleanup failed for report', id, err)
    )
  }
}

// C4: Delete all Storage files for a user before account deletion
export async function deleteAllUserFiles(userId: string): Promise<void> {
  const { data: rows } = await supabase
    .from('reports')
    .select('file_url')
    .eq('user_id', userId)

  const paths = (rows ?? [])
    .map((r: any) => r.file_url)
    .filter((p: any): p is string => !!p)

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('reports')
      .remove(paths)

    if (storageError) {
      console.warn('[MediSense] Partial storage cleanup error:', storageError)
    }
  }
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
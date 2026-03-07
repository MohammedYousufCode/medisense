import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getUserReports, deleteReport } from '../services/reportService'
import type { Report } from '../lib/types'

export function useReports(userId: string | undefined) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    if (!userId) {
      setReports([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getUserReports(userId)
      setReports(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`reports:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReports((prev) => [payload.new as Report, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setReports((prev) =>
              prev.map((r) =>
                r.id === (payload.new as Report).id ? (payload.new as Report) : r
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setReports((prev) =>
              prev.filter((r) => r.id !== (payload.old as Report).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const removeReport = async (id: string) => {
    try {
      await deleteReport(id)
    } catch (err: any) {
      setError(err.message || 'Failed to delete report')
    }
  }

  return { reports, loading, error, refetch: fetchReports, removeReport }
}

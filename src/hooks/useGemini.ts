import { useState, useCallback } from 'react'
import { analyzeReport, type GeminiAnalysis } from '../services/geminiService'

export function useGemini() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<GeminiAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (text: string): Promise<GeminiAnalysis | null> => {
    setAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeReport(text)
      setResult(data)
      return data
    } catch (err: any) {
      setError(err.message || 'AI analysis failed')
      return null
    } finally {
      setAnalyzing(false)
    }
  }, [])

  return { analyze, analyzing, result, error }
}

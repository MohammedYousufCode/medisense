import { useState, useCallback } from 'react'
import { extractText, type OCRResult } from '../services/ocrService'

export function useOCR() {
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const extract = useCallback(async (file: File): Promise<OCRResult | null> => {
    setExtracting(true)
    setProgress(0)
    setError(null)
    setResult(null)
    try {
      const data = await extractText(file, (p) => setProgress(p))
      setResult(data)
      return data
    } catch (err: any) {
      setError(err.message || 'OCR failed')
      return null
    } finally {
      setExtracting(false)
    }
  }, [])

  return { extract, extracting, progress, result, error }
}

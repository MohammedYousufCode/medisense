import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

// ✅ Use local worker to avoid version mismatch
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export interface OCRResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100))
        }
      },
    })

    const text = result.data.text.trim()
    if (!text || text.length < 10) {
      return {
        text: 'Could not extract readable text from this image. Please ensure the image is clear.',
        confidence: 0,
      }
    }

    return { text, confidence: Math.round(result.data.confidence) }
  } catch {
    return {
      text: 'OCR processing failed. Please try uploading a clearer image.',
      confidence: 0,
    }
  }
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    console.log(`PDF loaded: ${pdf.numPages} page(s)`)

    // ✅ Extract text from ALL pages using pdfjs native text extraction
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
      fullText += pageText + '\n'

      if (onProgress) {
        onProgress(Math.round((i / pdf.numPages) * 80))
      }
    }

    fullText = fullText.trim()
    console.log('=== PDF EXTRACTED TEXT ===')
    console.log(fullText.slice(0, 300))

    // ✅ If native text extraction works, use it directly (faster & accurate)
    if (fullText.length > 50) {
      if (onProgress) onProgress(100)
      return { text: fullText, confidence: 95 }
    }

    // ✅ Fallback to OCR (for scanned/image PDFs) — all pages
    console.log('Native text empty, falling back to OCR...')
    let ocrText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const scale = 2.0
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const context = canvas.getContext('2d')!
      await page.render({ canvasContext: context, viewport }).promise

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      )

      const result = await Tesseract.recognize(blob, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(((i - 1 + m.progress) / pdf.numPages) * 100))
          }
        },
      })
      ocrText += result.data.text + '\n'
    }

    ocrText = ocrText.trim()
    if (!ocrText || ocrText.length < 10) {
      return { text: 'Could not extract readable text from this PDF.', confidence: 0 }
    }

    return { text: ocrText, confidence: 75 }
  } catch (err) {
    console.error('PDF extraction error:', err)
    return {
      text: 'PDF processing failed. Please upload a JPG or PNG image of your report instead.',
      confidence: 0,
    }
  }
}

export async function extractText(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file, onProgress)
  }
  return extractTextFromImage(file, onProgress)
}

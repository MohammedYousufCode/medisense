import * as pdfjsLib from 'pdfjs-dist'
import type { HealthParameter, OverallStatus } from '../lib/types'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export interface GeminiAnalysis {
  simplified_text: string
  parameters: HealthParameter[]
  advice: string[]
  overall_status: OverallStatus
}

const FALLBACK: GeminiAnalysis = {
  simplified_text: 'AI analysis unavailable. Please try again or check your API key.',
  parameters: [],
  advice: ['Could not analyze report. Please re-upload or try again.'],
  overall_status: 'unknown',
}

const PROMPT = `
You are a medical report analyzer. Analyze the following medical report text and respond ONLY with a valid JSON object (no markdown, no explanation).

STRICT RULES:
1. Extract ALL parameters/tests mentioned in the report using their exact values
2. For "normal_range": if the report explicitly states a reference range, use it. If the report does NOT include a normal range for a parameter, use your medical knowledge to provide the standard internationally accepted normal range for that test (e.g. Neutrophils: 50-70%, Lymphocytes: 20-40%, Haemoglobin: 13.5-17.5 g/dL for males). NEVER write "unknown" for normal_range if you know the standard range.
3. For "status": compare the extracted value against the normal range (from the report or from your medical knowledge) and set "normal", "borderline", or "abnormal" accordingly. Only use "unknown" if you genuinely cannot determine the range AND cannot compare.
4. If a value is marked High/Low/Abnormal in the report, always set status to "abnormal"
5. If a value is near the edge of normal range, set status to "borderline"
6. Respond ONLY with raw JSON — no markdown, no backticks

JSON structure:
{
  "simplified_text": "2-3 sentence plain English summary using the actual values from the report",
  "overall_status": "normal" | "borderline" | "abnormal" | "unknown",
  "parameters": [
  {
    "name": "exact parameter name",
    "value": "exact numeric value as string",
    "unit": "exact unit",
    "normal_range": "standard range (from report or medical knowledge — never leave as unknown if known)",
    "status": "normal" | "borderline" | "abnormal" | "unknown",
    "description": "1 sentence plain English explanation of what this test measures"
  }
]

  "advice": [
  "For each ABNORMAL finding, give a specific actionable step",
  "Include specific relevant foods by name",
  "Include a specific lifestyle recommendation",
  "State urgency: routine checkup vs see doctor within X days",
  "Suggest any follow-up test that would help"
]
}
`

// Extract text from PDF using pdfjs
async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
      fullText += pageText + '\n'
    }
    console.log('=== PDF TEXT EXTRACTED ===')
    console.log(fullText.slice(0, 300))
    return fullText.trim()
  } catch (err) {
    console.error('PDF text extraction failed:', err)
    return ''
  }
}

// C2/L1: accepts optional pre-extracted OCR text for image files.
// When extractedText is supplied (from Tesseract), it is used directly
// instead of the useless filename-only fallback.
export async function analyzeReportFile(
  file: File,
  extractedText?: string
): Promise<GeminiAnalysis> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    console.warn('No Groq API key — using fallback')
    return FALLBACK
  }

  try {
    let reportText = ''
    if (extractedText && extractedText.length >= 20) {
      // Use OCR-extracted text passed in from the upload pipeline
      reportText = extractedText
    } else if (file.type === 'application/pdf') {
      reportText = await extractPDFText(file)
    } else {
      // No OCR text supplied — caller should have run OCR before calling this
      reportText = `Image file: ${file.name} (no text extracted)`
    }

    if (!reportText || reportText.length < 20) {
      console.error('Could not extract text from file')
      return FALLBACK
    }

    console.log('=== SENDING TO GROQ ===')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: PROMPT + '\n\nMedical report text:\n' + reportText.slice(0, 8000),
          },
        ],
        temperature: 0.1,
      }),
    })

    const data = await response.json()
    console.log('=== GROQ RESPONSE ===')

    if (!response.ok) {
      console.error('Groq API error:', data)
      return FALLBACK
    }

    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
    console.log(raw.slice(0, 300))

    const cleaned = raw
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    if (!parsed.parameters || parsed.parameters.length === 0) {
      console.error('Groq returned no parameters')
      return FALLBACK
    }

    return {
      simplified_text: parsed.simplified_text ?? '',
      overall_status: parsed.overall_status ?? 'unknown',
      parameters: parsed.parameters ?? [],
      advice: parsed.advice ?? [],
    }
  } catch (err) {
    console.error('Groq error:', err)
    return FALLBACK
  }
}

// Keep for backward compatibility
export async function analyzeReport(extractedText: string): Promise<GeminiAnalysis> {
  return analyzeReportFile(new File([extractedText], 'report.txt', { type: 'text/plain' }))
}
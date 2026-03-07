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
1. NEVER invent or assume any values — only use what is explicitly in the text
2. Extract ALL parameters/tests mentioned in the report
3. If a value is marked High/Low/Abnormal, set status to "abnormal"
4. If a value is near the edge of normal range, set status to "borderline"
5. Respond ONLY with raw JSON — no markdown, no backticks

JSON structure:
{
  "simplified_text": "2-3 sentence plain English summary using ONLY actual values from the report",
  "overall_status": "normal" | "borderline" | "abnormal" | "unknown",
  "parameters": [
  {
    "name": "exact parameter name",
    "value": "exact numeric value as string",
    "unit": "exact unit",
    "normal_range": "exact reference range",
    "status": "normal" | "borderline" | "abnormal" | "unknown",
    "description": "1 sentence plain English explanation of what this test measures"
  }
]

  "advice": [
  "For each ABNORMAL finding, give a specific actionable step",
  "Include specific iron-rich or relevant foods by name",
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

export async function analyzeReportFile(file: File): Promise<GeminiAnalysis> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    console.warn('No Groq API key — using fallback')
    return FALLBACK
  }

  try {
    // Extract text from PDF first
    let reportText = ''
    if (file.type === 'application/pdf') {
      reportText = await extractPDFText(file)
    } else {
      // For images, use filename as hint and send raw
      reportText = `Image file: ${file.name}`
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

# MediSense — AI-Powered Medical Report Analyzer

> Understand your health reports — instantly, intelligently, privately.

MediSense is a web application that lets patients upload medical lab reports (CBC, lipid panel, thyroid, liver function, etc.) and receive an AI-generated plain-English analysis with color-coded results, actionable health advice, and nearby doctor recommendations — all within 30 seconds.

**Academic Project** | Department of Computer Science, NIEFGC Mysore | 2025–26  
**Team:** Syeda Ashfiya · Sumukh P · Mohammed Yousuf  
**Guide:** Smt. Amrutha V

---

## The Problem

85% of patients cannot read their own lab reports. Most resort to fragmented Google searches, get generic information with no personal context, and have no way to track results across visits. MediSense solves all of this in one platform.

---

## Features

| Feature | Description |
|---|---|
| **AI Analysis** | Groq Llama 3.3-70B decodes medical terminology into plain English and classifies every parameter |
| **OCR Extraction** | PDF.js for native PDFs + Tesseract.js for scanned reports and images — all in-browser |
| **Color-Coded Results** | Every parameter flagged Normal (green), Borderline (amber), or Abnormal (red) |
| **Doctor Finder** | Interactive Leaflet map showing medical specialists within 5 km via OpenStreetMap |
| **PDF Export** | Download a formatted report with parameter table and health advice |
| **Email Notifications** | EmailJS alerts when AI analysis completes — no polling required |

---

## Tech Stack

### Frontend
- React 19.2 + TypeScript 5.9
- Vite 7.3 + Tailwind CSS 3.4
- Framer Motion 12 + React Router DOM 7
- React Hook Form + Zod 4 validation
- Lucide React icons

### AI & OCR
- Groq Cloud API — Llama 3.3-70B (`llama-3.3-70b-versatile`)
- Tesseract.js 7 (scanned images/PDFs)
- pdfjs-dist 5.4 (native PDF text extraction)

### Backend & Cloud
- Supabase (PostgreSQL + Auth + Storage + Row-Level Security)
- JWT authentication with auto-refresh
- Vercel hosting + CI/CD via GitHub

### Maps & Export
- Leaflet.js 1.9 + React-Leaflet 5 + OpenStreetMap
- jsPDF 4 + jsPDF-AutoTable 5 + html2canvas 1.4
- EmailJS Browser

---

## How It Works

```
Upload → Extract → Analyze → Results
```

1. **Upload** — Drag-and-drop or browse. Accepts PDF, JPG, PNG, WebP up to 10 MB.
2. **Extract** — PDF.js extracts native text (< 1 second, 95% confidence). If native text < 50 chars, Tesseract.js activates on a 2× upscaled canvas for high-DPI OCR accuracy.
3. **Analyze** — Groq API receives up to 8,000 characters of extracted text. Temperature set to 0.1 for near-deterministic output. Returns structured JSON.
4. **Results** — Color-coded parameter table, plain-English summary, actionable advice, saved to Supabase, email notification sent.

**Performance benchmarks:**

| Operation | Time |
|---|---|
| PDF → OCR → AI → Save | 15–22 seconds |
| Image → Tesseract → AI | 22–35 seconds |
| Groq API (8,000 char input) | 5–8 seconds |
| Dashboard load (10 reports) | < 1 second |
| PDF export | 2–4 seconds |

---

## Architecture

4-layer client-centric design — all OCR and AI processing runs in the browser.

**Layer 1 — Presentation (React 19 + TypeScript)**  
Pages: Landing · Login · SignUp · Dashboard · UploadReport · ReportDetail · DoctorFinder · Settings  
Components: Navbar · Sidebar · Footer · ErrorBoundary · LoadingSpinner · ThemeToggle · AnimatedButton

**Layer 2 — Service Layer**  
`authService` · `geminiService` (Groq) · `ocrService` · `reportService` · `storageService` · `emailService`

**Layer 3 — Context & State**  
`AuthContext` (user · session · profile) · `ThemeContext` (dark/light)  
Hooks: `useAuth` · `useGemini` · `useOCR` · `useReports` · `useTheme`

**Layer 4 — External Services**  
Supabase (PostgreSQL · Auth · Storage · RLS) · Groq Cloud · EmailJS · OpenStreetMap

---

## Database Schema

**`profiles` table**

| Column | Type |
|---|---|
| `id` | UUID PK, FK → auth.users |
| `full_name` | text |
| `subscription_tier` | `'free'` \| `'premium'` |
| `email_notifications` | boolean |
| `theme` | `'dark'` \| `'light'` |

**`reports` table**

| Column | Type |
|---|---|
| `id` | UUID PK |
| `user_id` | FK → profiles.id (RLS key) |
| `parameters` | JSONB[] — AI result |
| `overall_status` | `'normal'` \| `'borderline'` \| `'abnormal'` |
| `status` | `'pending'` \| `'processing'` \| `'completed'` |

**Security:** PostgreSQL RLS ensures users can only access rows where `user_id` matches their own UUID. All inputs validated with Zod; parameterised queries prevent SQL injection. Protected routes redirect unauthenticated users to `/login`.

---

## AI Response Structure

The Groq API returns structured JSON with the following fields:

```json
{
  "simplified_text": "...",
  "overall_status": "normal | borderline | abnormal",
  "parameters": [
    {
      "name": "...",
      "value": "...",
      "unit": "...",
      "normal_range": "...",
      "status": "normal | borderline | abnormal",
      "description": "..."
    }
  ],
  "advice": ["..."]
}
```

---

## Setup

### Prerequisites
- Node.js 18+
- A Supabase project
- A Groq API key
- An EmailJS account

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Install & Run

```bash
npm install
npm run dev
```

### Deploy

The project is configured for Vercel. Push to GitHub and connect the repo in the Vercel dashboard. Add the environment variables above in the Vercel project settings.

Add a `vercel.json` at the project root to handle SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## Testing

35 test cases across 4 levels — 100% pass rate.

| Level | Count | Scope |
|---|---|---|
| Unit | 12 | Functions & modules |
| Integration | 8 | Module interactions |
| System | 15 | End-to-end journeys |
| UAT | — | 5 evaluators, avg 4.6/5 |

**UAT feature ratings:** Parameter Table 4.8 · AI Summary 4.7 · Upload Flow 4.6 · Health Advice 4.5 · Doctor Finder 4.3

---

## Future Enhancements

- **Health Trend Analytics** — Plot parameters over time (hemoglobin, glucose, cholesterol)
- **React Native Mobile App** — iOS & Android with camera-based OCR for physical lab printouts
- **Telemedicine Integration** — In-app appointment booking with doctors from Doctor Finder
- **Fine-Tuned AI Model** — Domain-specific model optimised for Indian lab report formats
- **HIPAA / GDPR Compliance** — Audit trails, data export, and clinical deployment readiness

---

## License

Academic project — NIEFGC, Mysore, 2025–26. Not licensed for commercial use.

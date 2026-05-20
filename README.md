# MediSense — AI-Powered Medical Report Analyzer

> Upload any medical lab report. Get a plain-English explanation in under 30 seconds.

**Live Demo:** [medisense-six.vercel.app](https://medisense-six.vercel.app)  
**GitHub:** [MohammedYousufCode/medisense](https://github.com/MohammedYousufCode/medisense)

---

## Overview

MediSense is a full-stack web application that helps patients understand their medical lab reports (CBC, DLC, lipid panel, thyroid, liver function, etc.) without needing medical expertise. Upload a PDF or image — the app extracts the text, sends it to an AI, and returns a color-coded analysis with health advice and nearby doctor recommendations.

**Academic Project** | Department of Computer Science, NIEFGC Mysore | 2025–26  
**Team:** Mohammed Yousuf · Syeda Ashfiya · Sumukh P  
**Guide:** Smt. Amrutha V

---

## Features

| Feature | Details |
|---|---|
| **AI Analysis** | Groq Llama 3.3-70B explains every parameter in plain English and flags Normal / Borderline / Abnormal |
| **PDF Support** | pdfjs-dist extracts native text directly from PDF reports |
| **OCR for Images** | Tesseract.js reads scanned images and screenshots at 3× resolution with PSM-6 table mode |
| **Color-Coded Results** | Green = Normal · Amber = Borderline · Red = Abnormal |
| **Doctor Finder** | Leaflet map with nearby doctors via OpenStreetMap — falls back to Mysore if location is denied |
| **PDF Export** | Download a formatted 3-page report with parameters, advice, and glossary |
| **Email Notifications** | EmailJS sends an alert when analysis completes |
| **Secure by Default** | Supabase RLS — users can only access their own reports |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript 5.9**
- **Vite 7.3** + **Tailwind CSS 3.4**
- **Framer Motion 12** + **React Router DOM 7**
- **React Hook Form** + **Zod 4** for validation
- **Lucide React** for icons

### AI & OCR
- **Groq Cloud API** — `llama-3.3-70b-versatile` (temperature 0.1 for consistent output)
- **Tesseract.js 7** — image OCR with PSM-6 + 3× canvas upscale for table accuracy
- **pdfjs-dist 5.4** — native PDF text extraction

### Backend & Cloud
- **Supabase** — PostgreSQL + Auth (JWT) + Storage + Row Level Security
- **Vercel** — hosting + CI/CD via GitHub
- **EmailJS Browser** — transactional emails from the frontend

### Maps & Export
- **Leaflet.js 1.9** + **React-Leaflet 5** + OpenStreetMap / Overpass API
- **jsPDF 4** + **jsPDF-AutoTable 5** + **html2canvas 1.4**

---

## How It Works

```
Upload → Extract → Analyze → Results
```

1. **Upload** — Drag-and-drop or browse. Accepts PDF, JPG, PNG, WebP (max 10 MB).
2. **Extract** — PDF.js extracts native PDF text in under 1 second. For images, Tesseract.js runs OCR on a 3× upscaled canvas using PSM-6 (uniform block mode) to correctly parse multi-column medical tables.
3. **Analyze** — Extracted text is sent to the Groq API. The prompt instructs the AI to use standard medical reference ranges when the report doesn't include them. Returns structured JSON.
4. **Save & Notify** — Results saved to Supabase. Email notification sent via EmailJS if enabled.

**Timing benchmarks:**

| Operation | Typical Time |
|---|---|
| PDF → AI → Save | 15–22 s |
| Image → OCR → AI → Save | 25–35 s |
| Groq API response | 5–8 s |
| Dashboard load (10 reports) | < 1 s |
| PDF export | 2–4 s |

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key, FK → auth.users |
| `full_name` | text | |
| `photo_url` | text | |
| `subscription_tier` | text | `'free'` or `'premium'` |
| `email_notifications` | boolean | Defaults to true |
| `theme` | text | `'dark'` or `'light'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `reports`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → profiles.id (RLS key) |
| `file_name` | text | |
| `file_type` | text | PDF or image MIME type |
| `file_url` | text | Supabase Storage path |
| `extracted_text` | text | OCR or PDF output |
| `simplified_text` | text | AI plain-English summary |
| `parameters` | JSONB | Array of parameter objects |
| `advice` | JSONB | Array of advice strings |
| `overall_status` | text | `normal` / `borderline` / `abnormal` |
| `status` | text | `pending` / `completed` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `user_report_stats` (view)
Auto-calculated summary per user: `total_reports`, `normal_count`, `borderline_count`, `abnormal_count`, `completed_count`, `last_report_at`.

---

## Project Structure

```
src/
├── components/
│   ├── animations/       # Framer Motion wrappers
│   ├── auth/             # LoginForm, SignupForm, ProtectedRoute
│   ├── common/           # LoadingSpinner, ErrorBoundary
│   └── layout/           # Navbar, Sidebar, Footer
├── context/
│   ├── AuthContext.tsx   # User session + profile state
│   └── ThemeContext.tsx  # Dark / light mode
├── hooks/
│   ├── useGemini.ts      # Groq AI hook
│   ├── useOCR.ts         # Tesseract OCR hook
│   └── useReports.ts     # Reports CRUD + Realtime
├── lib/
│   ├── constants.ts      # Routes, map config, status styles
│   ├── helpers.ts        # File validation, formatters
│   ├── types.ts          # TypeScript interfaces
│   └── validators.ts     # Zod schemas
├── pages/
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── UploadReport.tsx  # Full OCR + AI pipeline
│   ├── ReportDetail.tsx  # Analysis results view
│   ├── DoctorFinder.tsx  # Map + doctor search
│   └── Settings.tsx      # Profile + account management
└── services/
    ├── authService.ts
    ├── emailService.ts   # EmailJS integration
    ├── geminiService.ts  # Groq API (analyzeReportFile)
    ├── ocrService.ts     # Tesseract.js + PDF OCR
    ├── reportService.ts  # Reports CRUD + storage cleanup
    └── storageService.ts # Supabase Storage upload/delete
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Supabase project
- Groq API key ([console.groq.com](https://console.groq.com))
- EmailJS account ([emailjs.com](https://emailjs.com))

### 1. Clone & Install

```bash
git clone https://github.com/MohammedYousufCode/medisense.git
cd medisense
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### 3. Run

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Vercel Deployment

### 1. Push to GitHub and import the repo in Vercel.

### 2. Add all environment variables in Vercel → Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GROQ_API_KEY
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

> **Important:** Vercel does NOT read your local `.env` file. Every variable must be added manually in the Vercel dashboard. This is the most common reason features work locally but fail on the hosted URL.

### 3. Add your Vercel domain to Supabase

Go to **Supabase → Authentication → URL Configuration**:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/**`

Without this, Supabase Auth will block login/signup on the hosted URL.

### 4. The `vercel.json` handles SPA routing and security headers — already included in the repo.

---

## EmailJS Template Setup

In your EmailJS template, use these exact variable names:

| Variable | Value sent |
|---|---|
| `{{to_email}}` | User's email address |
| `{{to_name}}` | User's full name |
| `{{report_name}}` | Uploaded file name |
| `{{message}}` | Analysis result summary |

---

## Security

- **Row Level Security (RLS):** All Supabase tables have RLS enabled. Users can only read, insert, update, and delete their own rows.
- **Ownership check:** `getReportById` filters by both `id` and `user_id` — direct URL access to another user's report returns 404.
- **Storage cleanup:** Deleting a report or account removes all associated files from Supabase Storage.
- **Security headers:** `vercel.json` sets HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy on every response.
- **Input validation:** All form inputs validated with Zod schemas before submission.

---

## Testing

35 test cases — 100% pass rate.

| Level | Cases | Scope |
|---|---|---|
| Unit | 12 | Individual functions and services |
| Integration | 8 | Service-to-service interactions |
| System | 15 | End-to-end user journeys |
| UAT | 5 evaluators | Avg rating: **4.6 / 5** |

**UAT feature scores:** Parameter Table 4.8 · AI Summary 4.7 · Upload Flow 4.6 · Health Advice 4.5 · Doctor Finder 4.3

---

## Known Limitations

- **OCR accuracy:** When a medical report image does not include printed reference ranges, the AI uses standard medical reference ranges. These may differ slightly from the specific lab's ranges — results should always be confirmed with a doctor.
- **Groq rate limits:** Free tier is limited to 30 requests/minute. Heavy usage may cause brief delays.
- **Image quality:** Very low resolution or handwritten reports may produce inaccurate OCR output.

---

## Future Plans

- Health trend charts — track parameters (haemoglobin, glucose, cholesterol) over time
- React Native mobile app with camera-based scanning
- Doctor appointment booking from the Doctor Finder page
- Fine-tuned model for Indian lab report formats

---

## License

Academic project — NIEFGC, Mysore, 2025–26. Not licensed for commercial use.

---

*Built with React, Supabase, Groq AI, and Tesseract.js*
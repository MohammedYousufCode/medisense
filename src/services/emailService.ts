import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string

export interface EmailPayload {
  to_email: string
  to_name: string
  report_name: string
  message: string
}

export async function sendReportNotification(payload: EmailPayload): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS env vars missing — skipping email')
    return
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, payload, PUBLIC_KEY)
  } catch (err) {
    console.error('EmailJS send error:', err)
    // Non-blocking — don't throw, just log
  }
}

export async function sendWelcomeEmail(
  to_email: string,
  to_name: string
): Promise<void> {
  await sendReportNotification({
    to_email,
    to_name,
    report_name: 'Welcome to MediSense',
    message: `Hi ${to_name}, welcome to MediSense! You can now upload medical reports and get AI-powered analysis instantly.`,
  })
}

export async function sendAnalysisCompleteEmail(
  to_email: string,
  to_name: string,
  report_name: string,
  overall_status: string
): Promise<void> {
  await sendReportNotification({
    to_email,
    to_name,
    report_name,
    message: `Your medical report "${report_name}" has been analyzed. Overall status: ${overall_status.toUpperCase()}. Log in to MediSense to view your detailed results.`,
  })
}

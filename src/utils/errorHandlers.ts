export function handleSupabaseError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: string }).message;
    if (msg.includes('duplicate key')) return 'An account with this email already exists.';
    if (msg.includes('Invalid login credentials')) return 'Invalid email or password.';
    if (msg.includes('Email not confirmed')) return 'Please verify your email before logging in.';
    if (msg.includes('JWT')) return 'Your session has expired. Please log in again.';
    return msg;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function handleAPIError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (typeof error === 'string') return error;
  return 'API request failed. Please check your connection and try again.';
}

export function handleFileError(file: File): string | null {
  const MAX = 50 * 1024 * 1024;
  const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  if (!ALLOWED.includes(file.type)) {
    return 'Invalid file type. Please upload a PDF, PNG, or JPG file.';
  }
  if (file.size > MAX) {
    return 'File is too large. Maximum size is 50MB.';
  }
  return null;
}

export function logError(context: string, error: unknown): void {
  console.error(`[MediSense Error — ${context}]:`, error);
}

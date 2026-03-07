import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, STATUS_STYLES, STATUS_LABELS } from './constants'
import type { OverallStatus } from './types'

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateFile(file: File): string | null {
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please upload a JPEG, PNG, WEBP, or PDF.'
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds ${10}MB limit.`
  }
  return null
}

export function getStatusStyle(status: OverallStatus): string {
  return STATUS_STYLES[status] ?? STATUS_STYLES.unknown
}

export function getStatusLabel(status: OverallStatus): string {
  return STATUS_LABELS[status] ?? 'Unknown'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateReportFileName(originalName: string, userId: string): string {
  const ext = originalName.split('.').pop()
  const timestamp = Date.now()
  return `${userId}/${timestamp}.${ext}`
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/')
}

export function isPdfFile(fileType: string): boolean {
  return fileType === 'application/pdf'
}

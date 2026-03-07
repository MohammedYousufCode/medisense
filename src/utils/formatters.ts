import type { HealthStatus, Urgency } from '../lib/types';

export function formatReportDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatParameterStatus(status: HealthStatus): string {
  const map: Record<HealthStatus, string> = {
    normal: 'Normal',
    borderline: 'Borderline',
    abnormal: 'Abnormal',
    unknown: 'Unknown',
  };
  return map[status];
}

export function formatUrgency(urgency: Urgency): string {
  const map: Record<Urgency, string> = {
    routine: 'Routine Check-up',
    soon: 'See Doctor Soon',
    urgent: 'Urgent — See Doctor Immediately',
  };
  return map[urgency];
}

export function formatFileType(type: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'image/png': 'PNG Image',
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
  };
  return map[type] ?? type;
}

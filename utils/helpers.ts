import { GlucoseStatus, ReadingType } from '../types';

export const getGlucoseStatus = (value: number, type: ReadingType): GlucoseStatus => {
  // Simplified clinical guidelines for visual feedback
  if (value < 70) return 'Low';

  if (type === 'Fasting' || type === 'Pre-Meal') {
    if (value <= 100) return 'Normal';
    if (value <= 125) return 'Elevated';
    return 'High';
  } else {
    // After Meal / Bedtime
    if (value <= 140) return 'Normal';
    if (value <= 180) return 'Elevated';
    return 'High';
  }
};

export const getStatusColor = (status: GlucoseStatus): string => {
  switch (status) {
    case 'Low': return 'text-red-600 bg-red-50 border-red-200';
    case 'Normal': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Elevated': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'High': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export const getStatusDotColor = (status: GlucoseStatus): string => {
  switch (status) {
    case 'Low': return 'bg-red-500';
    case 'Normal': return 'bg-emerald-500';
    case 'Elevated': return 'bg-amber-500';
    case 'High': return 'bg-red-600';
    default: return 'bg-slate-400';
  }
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
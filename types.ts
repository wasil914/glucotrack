export type ReadingType = 'Fasting' | 'After Meal' | 'Pre-Meal' | 'Bedtime';

export interface Reading {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  value: number; // mg/dL
  type: ReadingType;
  timestamp: number;
}

export type FilterRange = '3Days' | '1Week' | '1Month' | 'Custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface Stats {
  avg: number;
  min: number;
  max: number;
  count: number;
}

export type GlucoseStatus = 'Low' | 'Normal' | 'Elevated' | 'High';
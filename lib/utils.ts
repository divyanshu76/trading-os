import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Re-export formatting helpers from calculations for convenience
export { formatCurrency, formatRMultiple, formatHoldingTime } from '@/lib/calculations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function getPnlColor(value: number): string {
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-neutral-400'
}

export function getPnlBg(value: number): string {
  if (value > 0) return 'bg-emerald-400/10'
  if (value < 0) return 'bg-red-400/10'
  return 'bg-neutral-400/10'
}

export function getResultBadgeClass(result: string): string {
  switch (result) {
    case 'win': return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
    case 'loss': return 'bg-red-400/15 text-red-400 border-red-400/30'
    case 'breakeven': return 'bg-neutral-400/15 text-neutral-400 border-neutral-400/30'
    case 'open': return 'bg-violet-400/15 text-violet-400 border-violet-400/30'
    default: return 'bg-neutral-400/15 text-neutral-400 border-neutral-400/30'
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

export function generateColor(str: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const SESSIONS = [
  { value: 'london', label: 'London' },
  { value: 'new_york', label: 'New York' },
  { value: 'asia', label: 'Asia' },
  { value: 'london_ny_overlap', label: 'London/NY Overlap' },
  { value: 'pre_market', label: 'Pre-Market' },
  { value: 'after_hours', label: 'After Hours' },
  { value: 'other', label: 'Other' },
]

export const EMOTIONS = [
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'confident', label: 'Confident', emoji: '💪' },
  { value: 'fearful', label: 'Fear', emoji: '😨' },
  { value: 'fomo', label: 'FOMO', emoji: '😰' },
  { value: 'greedy', label: 'Greed', emoji: '🤑' },
  { value: 'revenge', label: 'Revenge', emoji: '😤' },
  { value: 'bored', label: 'Bored', emoji: '😑' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😡' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
]

export const TIMEFRAMES = [
  '1m', '3m', '5m', '15m', '30m', '1H', '4H', 'D1', 'W1', 'MN'
]

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'INR', 'AED', 'AUD', 'CAD', 'CHF', 'JPY', 'SGD'
]

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
  { value: 'America/New_York', label: 'EST (New York)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Frankfurt', label: 'CET (Frankfurt)' },
  { value: 'Asia/Dubai', label: 'GST (Dubai)' },
  { value: 'Asia/Singapore', label: 'SGT (Singapore)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
  { value: 'UTC', label: 'UTC' },
]

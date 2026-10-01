import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subValue?: string
  change?: number       // percentage change — positive or negative
  changeLabel?: string
  icon?: LucideIcon
  variant?: 'default' | 'profit' | 'loss' | 'neutral' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  loading?: boolean
  elevated?: boolean
}

export function MetricCard({
  title,
  value,
  subValue,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  size = 'md',
  className,
  loading = false,
  elevated = false,
}: MetricCardProps) {
  const isPositive = (change ?? 0) > 0
  const isNegative = (change ?? 0) < 0

  const borderAccent = {
    default: '',
    profit: 'border-l-[3px] border-l-[#357D71]',
    loss: 'border-l-[3px] border-l-[#A55363]',
    neutral: 'border-l-[3px] border-l-[rgba(77,91,112,0.2)]',
    accent: 'border-l-[3px] border-l-[#386382]',
  }[variant]

  const valueColor = {
    default: 'text-[#182A3A]',
    profit: 'text-[#357D71]',
    loss: 'text-[#A55363]',
    neutral: 'text-[#182A3A]',
    accent: 'text-[#386382]',
  }[variant]

  if (loading) {
    return (
      <div className={cn(
        'rounded-xl border border-[rgba(56,99,130,0.12)] glass p-4 animate-pulse shadow-sm',
        size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4',
        className
      )}>
        <div className="h-3 w-24 bg-[rgba(56,99,130,0.08)] rounded mb-3" />
        <div className="h-7 w-32 bg-[rgba(56,99,130,0.08)] rounded mb-2" />
        <div className="h-3 w-16 bg-[rgba(56,99,130,0.08)] rounded" />
      </div>
    )
  }

  return (
    <div className={cn(
      'group ocean-card relative overflow-hidden',
      elevated ? 'glass-elevated' : 'glass',
      borderAccent,
      size === 'sm' ? 'p-4 rounded-[18px]' : size === 'lg' ? 'p-6 rounded-[22px]' : 'p-5 rounded-[20px]',
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[#4D5B70] font-bold tracking-wider uppercase',
            size === 'sm' ? 'text-[9px]' : 'text-[11px]'
          )}>
            {title}
          </p>
          <p className={cn(
            'font-extrabold tabular-nums mt-1 break-words',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl',
            valueColor
          )}>
            {value}
          </p>
          {subValue && (
            <p className="text-[12px] font-semibold text-[#4D5B70] tabular-nums mt-0.5">
              {subValue}
            </p>
          )}
          {change !== undefined && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-1.5 text-xs font-bold rounded-md px-1.5 py-0.5',
              isPositive && 'bg-[rgba(53,125,113,0.10)] text-[#357D71]',
              isNegative && 'bg-[rgba(165,83,99,0.10)] text-[#A55363]',
              !isPositive && !isNegative && 'bg-[rgba(77,91,112,0.08)] text-[#4D5B70]'
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> :
                isNegative ? <TrendingDown className="w-3 h-3" /> :
                  <Minus className="w-3 h-3" />}
              <span className="tabular-nums">
                {isPositive ? '+' : ''}{change?.toFixed(2)}%
              </span>
              {changeLabel && <span className="text-[10px] opacity-75">{changeLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors',
            size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
            'bg-[rgba(56,99,130,0.06)] border border-[rgba(56,99,130,0.10)] group-hover:bg-[rgba(56,99,130,0.12)]'
          )}>
            <Icon className={cn(
              'text-[#386382] transition-colors',
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
            )} />
          </div>
        )}
      </div>
    </div>
  )
}


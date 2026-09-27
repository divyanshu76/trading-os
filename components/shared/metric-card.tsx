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
}: MetricCardProps) {
  const isPositive = (change ?? 0) > 0
  const isNegative = (change ?? 0) < 0

  const borderAccent = {
    default: '',
    profit: 'border-l-[3px] border-l-profit',
    loss: 'border-l-[3px] border-l-loss',
    neutral: 'border-l-[3px] border-l-grey/40',
    accent: 'border-l-[3px] border-l-slate',
  }[variant]

  const valueColor = {
    default: 'text-charcoal',
    profit: 'text-profit',
    loss: 'text-loss',
    neutral: 'text-charcoal',
    accent: 'text-slate',
  }[variant]

  if (loading) {
    return (
      <div className={cn(
        'rounded-xl border border-border/10 bg-card p-4 animate-pulse shadow-sm',
        size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4',
        className
      )}>
        <div className="h-3 w-24 bg-charcoal/5 rounded mb-3" />
        <div className="h-7 w-32 bg-charcoal/5 rounded mb-2" />
        <div className="h-3 w-16 bg-charcoal/5 rounded" />
      </div>
    )
  }

  return (
    <div className={cn(
      'group rounded-[16px] border border-border/10 bg-card transition-all duration-200 hover:border-slate/30 hover:shadow-[0_8px_30px_rgba(25,29,35,0.04)]',
      borderAccent,
      size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4',
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-grey font-bold tracking-wider',
            size === 'sm' ? 'text-[9px]' : 'text-[11px]'
          )}>
            {title}
          </p>
          <p className={cn(
            'font-extrabold tabular-nums mt-1 truncate',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl',
            valueColor
          )}>
            {value}
          </p>
          {subValue && (
            <p className="text-[12px] font-semibold text-grey tabular-nums mt-0.5">
              {subValue}
            </p>
          )}
          {change !== undefined && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-1.5 text-xs font-medium rounded px-1.5 py-0.5',
              isPositive && 'bg-profit text-emerald-300',
              isNegative && 'bg-loss text-red-300',
              !isPositive && !isNegative && 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
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
            'rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors',
            size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
            'bg-background group-hover:bg-slate/10'
          )}>
            <Icon className={cn(
              'text-grey group-hover:text-slate transition-colors',
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
            )} />
          </div>
        )}
      </div>
    </div>
  )
}

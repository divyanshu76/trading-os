'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format, isValid, parseISO } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'

// ─── Safe Date Formatting ────────────────────────────────────────────────────────
const toValidDate = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return isValid(value) ? value : null
  if (typeof value === 'string') {
    const d = new Date(value)
    if (isValid(d)) return d
    const parsed = parseISO(value)
    if (isValid(parsed)) return parsed
  }
  if (typeof value === 'number') {
    const d = new Date(value)
    if (isValid(d)) return d
  }
  return null
}

const formatChartDate = (value: unknown, formatStr: string = 'MMM d') => {
  const date = toValidDate(value)
  return date ? format(date, formatStr) : (typeof value === 'string' ? value : String(value ?? ''))
}

// ─── Shared Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active, payload, label, currency = 'USD', valueLabel = 'Value',
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
  currency?: string
  valueLabel?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[12px] border border-border/10 bg-card px-4 py-3 shadow-[0_8px_30px_rgba(25,29,35,0.06)] text-[12px]">
      <p className="text-grey font-bold mb-1.5">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="font-extrabold tabular-nums" style={{ color: item.color }}>
          {valueLabel}: {formatCurrency(item.value, currency)}
        </p>
      ))}
    </div>
  )
}

// ─── Equity Curve Chart ───────────────────────────────────────────────────────

interface EquityCurveProps {
  data: Array<{ date: string; balance: number; cumulative_pnl: number }>
  currency?: string
  height?: number
  className?: string
}

export function EquityCurveChart({ data, currency = 'USD', height = 300, className }: EquityCurveProps) {
  const isPositive = data.length > 1 && data[data.length - 1].balance >= data[0].balance

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}  stopOpacity={0.3} />
              <stop offset="95%" stopColor={isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatChartDate(v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, currency, true)}
            width={70}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload as never} label={label as string} currency={currency} valueLabel="Balance" />
            )}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
            strokeWidth={2.5}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Daily P&L Bar Chart ─────────────────────────────────────────────────────

interface DailyPnlProps {
  data: Array<{ date: string; pnl: number }>
  currency?: string
  height?: number
  className?: string
}

export function DailyPnlChart({ data, currency = 'USD', height = 200, className }: DailyPnlProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatChartDate(v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, currency, true)}
            width={70}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" opacity={0.5} />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload as never} label={label as string} currency={currency} valueLabel="P&L" />
            )}
          />
          <Bar
            dataKey="pnl"
            radius={[3, 3, 0, 0]}
            fill="hsl(var(--profit))"
            label={false}
          >
            {data.map((entry, index) => (
              <rect
                key={index}
                fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Drawdown Chart ───────────────────────────────────────────────────────────

interface DrawdownProps {
  data: Array<{ date: string; drawdown: number; drawdownPercent: number }>
  height?: number
  className?: string
}

export function DrawdownChart({ data, height = 200, className }: DrawdownProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(var(--loss))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatChartDate(v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            width={50}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-[12px] border border-border/10 bg-card px-4 py-3 shadow-[0_8px_30px_rgba(25,29,35,0.06)] text-[12px]">
                  <p className="text-grey font-bold mb-1.5">{label}</p>
                  <p className="font-extrabold tabular-nums text-loss">
                    DD: {(payload[0].value as number).toFixed(2)}%
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="drawdownPercent"
            stroke="hsl(var(--loss))"
            strokeWidth={2.5}
            fill="url(#drawdownGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── R-Multiple Distribution ──────────────────────────────────────────────────

interface RDistributionProps {
  data: Array<{ r: string; count: number }>
  height?: number
  className?: string
}

export function RDistributionChart({ data, height = 200, className }: RDistributionProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="r"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={30}
          />
          <ReferenceLine x="0R" stroke="hsl(var(--border))" opacity={0.5} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-[12px] border border-border/10 bg-card px-4 py-3 shadow-[0_8px_30px_rgba(25,29,35,0.06)] text-[12px]">
                  <p className="text-grey font-bold mb-1">{label}</p>
                  <p className="font-extrabold text-charcoal">{payload[0].value} trades</p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

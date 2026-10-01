'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
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
    <div className="glass-dropdown px-4 py-3 rounded-[14px] text-[12px] shadow-sm">
      <p className="text-[#4D5B70] font-bold mb-1.5 uppercase tracking-wide">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="font-extrabold tabular-nums text-[14px]" style={{ color: item.color || '#386382' }}>
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
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#386382" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#9ABFCF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(77, 91, 112, 0.10)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatChartDate(v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, currency, true)}
            width={70}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(77, 91, 112, 0.20)', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload as never} label={label as string} currency={currency} valueLabel="Balance" />
            )}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#386382"
            strokeWidth={2.5}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#386382' }}
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
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(77, 91, 112, 0.10)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatChartDate(v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, currency, true)}
            width={70}
          />
          <ReferenceLine y={0} stroke="rgba(77, 91, 112, 0.20)" />
          <Tooltip
            cursor={{ fill: 'rgba(56, 99, 130, 0.05)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const pnl = payload[0]?.value as number
              const isProfit = pnl >= 0
              return (
                <div className="glass-dropdown px-4 py-3 rounded-[14px] text-[12px] shadow-sm">
                  <p className="text-[#4D5B70] font-bold mb-1.5 uppercase tracking-wide">{label}</p>
                  <p
                    className="font-extrabold tabular-nums text-[14px]"
                    style={{ color: isProfit ? '#386382' : '#9B5C62' }}
                  >
                    P&L: {formatCurrency(pnl, currency)}
                  </p>
                </div>
              )
            }}
          />
          <Bar
            dataKey="pnl"
            radius={[3, 3, 0, 0]}
            fill="#386382"
            label={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`pnl-cell-${index}`}
                fill={entry.pnl >= 0 ? '#386382' : '#9B5C62'}
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
  // Negative drawdown values: underwater equity curve representation
  const chartData = data.map((item) => ({
    ...item,
    displayDd: -Math.abs(item.drawdownPercent ?? 0),
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#386382" stopOpacity={0.20} />
              <stop offset="100%" stopColor="#9ABFCF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(77, 91, 112, 0.10)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatChartDate(v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            domain={[
              (dataMin: number) => {
                if (!isFinite(dataMin) || dataMin === 0) return -5
                return Math.min(Math.floor(dataMin - 1), -5)
              },
              0,
            ]}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            width={50}
          />
          <ReferenceLine y={0} stroke="rgba(77, 91, 112, 0.25)" strokeDasharray="3 3" />
          <Tooltip
            cursor={{ stroke: 'rgba(77, 91, 112, 0.20)', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const rawVal = payload[0].value as number
              const ddVal = Math.abs(rawVal)
              return (
                <div className="glass-dropdown px-4 py-3 rounded-[14px] text-[12px] shadow-sm">
                  <p className="text-[#4D5B70] font-bold mb-1.5 uppercase tracking-wide">{label}</p>
                  <p className="font-extrabold tabular-nums text-[14px] text-[#386382]">
                    Drawdown: -{ddVal.toFixed(2)}%
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="displayDd"
            baseValue={0}
            stroke="#386382"
            strokeWidth={2}
            fill="url(#drawdownGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#386382' }}
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
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(77, 91, 112, 0.10)" />
          <XAxis
            dataKey="r"
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#4D5B70', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={30}
          />
          <ReferenceLine x="0R" stroke="rgba(77, 91, 112, 0.20)" />
          <Tooltip
            cursor={{ fill: 'rgba(56, 99, 130, 0.05)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="glass-dropdown px-4 py-3 rounded-[14px] text-[12px] shadow-sm">
                  <p className="text-[#4D5B70] font-bold mb-1 uppercase tracking-wide">{label}</p>
                  <p className="font-extrabold text-[14px] text-[#182A3A]">{payload[0].value} trades</p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="#386382" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


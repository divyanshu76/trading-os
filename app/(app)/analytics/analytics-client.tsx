'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Activity, Target, Clock, Brain } from 'lucide-react'
import { MetricCard } from '@/components/shared/metric-card'
import { EquityCurveChart, DailyPnlChart, DrawdownChart, RDistributionChart } from '@/components/charts'
import { calculateTradeAnalytics, calculateDrawdown, buildEquityCurve, formatCurrency, formatRMultiple, formatHoldingTime } from '@/lib/calculations'
import { cn, formatPercent } from '@/lib/utils'
import type { Trade } from '@/types/database'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subMonths } from 'date-fns'

interface AnalyticsClientProps {
  trades: Trade[]
  currency: string
}

type Period = '1M' | '3M' | '6M' | '1Y' | 'ALL'

export function AnalyticsClient({ trades, currency }: AnalyticsClientProps) {
  const [period, setPeriod] = useState<Period>('3M')

  const filteredTrades = useMemo(() => {
    if (period === 'ALL') return trades
    const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }[period]
    const cutoff = subMonths(new Date(), months).toISOString().split('T')[0]
    return trades.filter(t => t.date && t.date >= cutoff)
  }, [trades, period])

  const closedTrades = useMemo(() => filteredTrades.filter(t => t.result !== 'open'), [filteredTrades])
  const analytics = useMemo(() => calculateTradeAnalytics(closedTrades), [closedTrades])

  // P&L by session
  const sessionPnl = useMemo(() => {
    const map: Record<string, { pnl: number; count: number }> = {}
    for (const t of closedTrades) {
      const session = t.session ?? 'other'
      if (!map[session]) map[session] = { pnl: 0, count: 0 }
      map[session].pnl += t.net_pnl ?? 0
      map[session].count++
    }
    return Object.entries(map).map(([session, data]) => ({ session: session.replace(/_/g, ' '), ...data }))
  }, [closedTrades])

  // P&L by symbol
  const symbolPnl = useMemo(() => {
    const map: Record<string, { pnl: number; count: number }> = {}
    for (const t of closedTrades) {
      const sym = t.symbol
      if (!sym) continue
      if (!map[sym]) map[sym] = { pnl: 0, count: 0 }
      map[sym].pnl += t.net_pnl ?? 0
      map[sym].count++
    }
    return Object.entries(map)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      .slice(0, 10)
  }, [closedTrades])

  // P&L by day of week
  const dowPnl = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const map: Record<number, number> = {}
    for (const t of closedTrades) {
      if (!t.date) continue
      const dow = new Date(t.date).getDay()
      map[dow] = (map[dow] ?? 0) + (t.net_pnl ?? 0)
    }
    return days.map((day, i) => ({ day, pnl: map[i] ?? 0 }))
  }, [closedTrades])

  // R distribution buckets
  const rDistribution = useMemo(() => {
    const buckets: Record<string, number> = {}
    for (const t of closedTrades) {
      if (t.r_multiple === null) continue
      const bucket = t.r_multiple < -2 ? '<-2R' :
        t.r_multiple < -1 ? '-2R' :
        t.r_multiple < 0 ? '-1R' :
        t.r_multiple === 0 ? '0R' :
        t.r_multiple < 1 ? '+0.5R' :
        t.r_multiple < 2 ? '+1R' :
        t.r_multiple < 3 ? '+2R' : '+3R+'
      buckets[bucket] = (buckets[bucket] ?? 0) + 1
    }
    const order = ['<-2R', '-2R', '-1R', '0R', '+0.5R', '+1R', '+2R', '+3R+']
    return order.map(r => ({ r, count: buckets[r] ?? 0 }))
  }, [closedTrades])

  // Emotion analytics
  const emotionStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; totalPnl: number }> = {}
    for (const t of closedTrades) {
      const em = t.emotion_before
      if (!em) continue
      if (!map[em]) map[em] = { count: 0, wins: 0, totalPnl: 0 }
      map[em].count++
      if (t.result === 'win') map[em].wins++
      map[em].totalPnl += t.net_pnl ?? 0
    }
    return Object.entries(map)
      .map(([emotion, data]) => ({
        emotion: emotion.replace(/_/g, ' '),
        count: data.count,
        winRate: (data.wins / data.count) * 100,
        avgPnl: data.totalPnl / data.count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [closedTrades])

  if (closedTrades.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-96">
        <BarChart3 className="w-16 h-16 text-[hsl(var(--muted-foreground))] mb-4" />
        <h2 className="text-xl font-bold">No data yet</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">Add some trades to see your analytics.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header + Period toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[hsl(var(--primary))]" />
          Analytics
        </h1>
        <div className="flex items-center gap-1 bg-[hsl(var(--muted))] rounded-lg p-1">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all',
                period === p ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Net P&L"       value={`${analytics.total_net_pnl >= 0 ? '+' : ''}${formatCurrency(analytics.total_net_pnl, currency)}`} variant={analytics.total_net_pnl >= 0 ? 'profit' : 'loss'} />
        <MetricCard title="Win Rate"      value={`${analytics.win_rate}%`} subValue={`${analytics.winning_trades}W · ${analytics.losing_trades}L`} />
        <MetricCard title="Profit Factor" value={isFinite(analytics.profit_factor) ? analytics.profit_factor.toFixed(2) : '∞'} variant={analytics.profit_factor >= 1 ? 'profit' : 'loss'} />
        <MetricCard title="Expectancy"    value={formatCurrency(analytics.expectancy, currency)} subValue="per trade" variant={analytics.expectancy >= 0 ? 'profit' : 'loss'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Total Trades"   value={analytics.total_trades.toString()} />
        <MetricCard title="Avg Win"        value={formatCurrency(analytics.average_win, currency)} variant="profit" />
        <MetricCard title="Avg Loss"       value={formatCurrency(analytics.average_loss, currency)} variant="loss" />
        <MetricCard title="Avg R"          value={formatRMultiple(analytics.average_r_multiple)} />
      </div>

      {/* R Distribution */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="text-sm font-semibold mb-4">R-Multiple Distribution</h2>
          <RDistributionChart data={rDistribution} height={220} />
        </div>

        {/* P&L by Day of Week */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="text-sm font-semibold mb-4">P&L by Day of Week</h2>
          <DailyPnlChart data={dowPnl.map(d => ({ date: d.day, pnl: d.pnl }))} currency={currency} height={220} />
        </div>
      </div>

      {/* P&L by Symbol + Session */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="text-sm font-semibold mb-4">P&L by Symbol</h2>
          <div className="space-y-2">
            {symbolPnl.map(({ symbol, pnl, count }) => {
              const maxAbs = Math.max(...symbolPnl.map(s => Math.abs(s.pnl)))
              const pct = maxAbs > 0 ? (Math.abs(pnl) / maxAbs) * 100 : 0
              return (
                <div key={symbol}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium">{symbol}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[hsl(var(--muted-foreground))]">{count} trades</span>
                      <span className={cn('font-semibold tabular-nums', pnl >= 0 ? 'text-profit' : 'text-loss')}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className={cn('h-1.5 rounded-full', pnl >= 0 ? 'bg-emerald-500' : 'bg-red-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="text-sm font-semibold mb-4">P&L by Session</h2>
          <div className="space-y-3">
            {sessionPnl.map(({ session, pnl, count }) => (
              <div key={session} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border)/0.5)] last:border-0">
                <div>
                  <p className="text-sm font-medium capitalize">{session}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{count} trades</p>
                </div>
                <span className={cn('font-bold tabular-nums text-sm', pnl >= 0 ? 'text-profit' : 'text-loss')}>
                  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Psychology analytics */}
      {emotionStats.length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-[hsl(var(--primary))]" />
            Psychology — Emotion Analytics
          </h2>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
            Statistics only. No psychological claims are made.
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Emotion Before', 'Trades', 'Win Rate', 'Avg P&L'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {emotionStats.map(({ emotion, count, winRate, avgPnl }) => (
                  <tr key={emotion} className="hover:bg-[hsl(var(--muted)/0.4)]">
                    <td className="px-3 py-2 capitalize font-medium">{emotion}</td>
                    <td className="px-3 py-2 tabular-nums">{count}</td>
                    <td className={cn('px-3 py-2 tabular-nums font-medium', winRate >= 50 ? 'text-profit' : 'text-loss')}>{winRate.toFixed(1)}%</td>
                    <td className={cn('px-3 py-2 tabular-nums font-medium', avgPnl >= 0 ? 'text-profit' : 'text-loss')}>
                      {avgPnl >= 0 ? '+' : ''}{formatCurrency(avgPnl, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, Target, BarChart3,
  Activity, Calendar, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { MetricCard } from '@/components/shared/metric-card'
import { EquityCurveChart, DailyPnlChart, DrawdownChart } from '@/components/charts'
import {
  calculateTradeAnalytics, calculateDrawdown, buildEquityCurve,
  formatCurrency, formatRMultiple, formatHoldingTime
} from '@/lib/calculations'
import { getPnlColor, getResultBadgeClass, formatDate, formatPercent } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import type { Trade, Account } from '@/types/database'
import { format, startOfDay, isToday, isThisWeek, isThisMonth } from 'date-fns'

interface DashboardClientProps {
  trades: Partial<Trade>[]
  accounts: Account[]
  currency: string
}

export function DashboardClient({ trades, accounts, currency }: DashboardClientProps) {
  const { selectedAccountId } = useAppStore()

  // Filter by selected account
  const filteredTrades = useMemo(() => {
    if (!selectedAccountId) return trades
    return trades.filter(t => t.account_id === selectedAccountId)
  }, [trades, selectedAccountId])

  const realTrades = useMemo(() => filteredTrades.filter(t => !t.is_demo), [filteredTrades])
  const closedTrades = useMemo(() => realTrades.filter(t => t.result !== 'open'), [realTrades])

  // Period filters
  const todayTrades  = useMemo(() => closedTrades.filter(t => t.date && isToday(new Date(t.date))), [closedTrades])
  const weekTrades   = useMemo(() => closedTrades.filter(t => t.date && isThisWeek(new Date(t.date))), [closedTrades])
  const monthTrades  = useMemo(() => closedTrades.filter(t => t.date && isThisMonth(new Date(t.date))), [closedTrades])

  // Analytics
  const analytics = useMemo(() => calculateTradeAnalytics(closedTrades as never), [closedTrades])

  // Period P&L
  const todayPnl  = useMemo(() => todayTrades.reduce((s, t) => s + (t.net_pnl ?? 0), 0), [todayTrades])
  const weekPnl   = useMemo(() => weekTrades.reduce((s, t) => s + (t.net_pnl ?? 0), 0), [weekTrades])
  const monthPnl  = useMemo(() => monthTrades.reduce((s, t) => s + (t.net_pnl ?? 0), 0), [monthTrades])

  // Realized P&L per account
  const accountRealizedPnl = useMemo(() => {
    const pnlMap = new Map<string, number>()
    closedTrades.forEach(t => {
      if (t.account_id) {
        pnlMap.set(t.account_id, (pnlMap.get(t.account_id) ?? 0) + (t.net_pnl ?? 0))
      }
    })
    return pnlMap
  }, [closedTrades])

  // Account balance for equity calc
  const selectedAccount = accounts.find(a => a.id === selectedAccountId)
  
  const totalBalance = selectedAccountId
    ? (selectedAccount?.initial_balance ?? 0) + (accountRealizedPnl.get(selectedAccountId) ?? 0)
    : accounts.reduce((s, a) => s + a.initial_balance + (accountRealizedPnl.get(a.id) ?? 0), 0)
    
  const initialBalance = selectedAccountId
    ? (selectedAccount?.initial_balance ?? totalBalance)
    : accounts.reduce((s, a) => s + a.initial_balance, 0)

  // Equity curve
  const equityData = useMemo(() => {
    if (closedTrades.length === 0) return []
    return buildEquityCurve({
      initialBalance,
      trades: closedTrades.map(t => ({
        net_pnl: t.net_pnl ?? 0,
        date: t.date ?? '',
        exit_time: t.exit_time ?? null,
      })),
    })
  }, [closedTrades, initialBalance])

  // Drawdown
  const drawdownData = useMemo(() => {
    if (equityData.length === 0) return { maxDrawdown: 0, maxDrawdownPercent: 0, drawdowns: [], drawdownPercents: [] }
    const dd = calculateDrawdown(equityData.map(e => e.balance))
    return dd
  }, [equityData])

  // Daily P&L bar chart
  const dailyPnl = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of closedTrades) {
      if (!t.date) continue
      map.set(t.date, (map.get(t.date) ?? 0) + (t.net_pnl ?? 0))
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, pnl]) => ({ date, pnl }))
  }, [closedTrades])

  // Recent trades (latest 8)
  const recentTrades = useMemo(() => filteredTrades.slice(0, 8), [filteredTrades])

  // Empty state
  if (realTrades.length === 0) {
    return <EmptyDashboard />
  }

  const kpiCards = [
    {
      title: 'Total P&L',
      value: formatCurrency(analytics.total_net_pnl, currency),
      variant: (analytics.total_net_pnl >= 0 ? 'profit' : 'loss') as 'profit' | 'loss',
      icon: DollarSign,
    },
    {
      title: "Today's P&L",
      value: formatCurrency(todayPnl, currency),
      variant: (todayPnl >= 0 ? 'profit' : 'loss') as 'profit' | 'loss',
      subValue: `${todayTrades.length} trades`,
      icon: Activity,
    },
    {
      title: 'This Week',
      value: formatCurrency(weekPnl, currency),
      variant: (weekPnl >= 0 ? 'profit' : 'loss') as 'profit' | 'loss',
      subValue: `${weekTrades.length} trades`,
      icon: TrendingUp,
    },
    {
      title: 'This Month',
      value: formatCurrency(monthPnl, currency),
      variant: (monthPnl >= 0 ? 'profit' : 'loss') as 'profit' | 'loss',
      subValue: `${monthTrades.length} trades`,
      icon: Calendar,
    },
    {
      title: 'Win Rate',
      value: `${analytics.win_rate}%`,
      variant: (analytics.win_rate >= 50 ? 'profit' : 'neutral') as 'profit' | 'neutral',
      subValue: `${analytics.winning_trades}W / ${analytics.losing_trades}L`,
      icon: Target,
    },
    {
      title: 'Profit Factor',
      value: isFinite(analytics.profit_factor) ? analytics.profit_factor.toFixed(2) : '∞',
      variant: (analytics.profit_factor >= 1.5 ? 'profit' : analytics.profit_factor >= 1 ? 'neutral' : 'loss') as 'profit' | 'neutral' | 'loss',
      icon: BarChart3,
    },
    {
      title: 'Expectancy',
      value: formatCurrency(analytics.expectancy, currency),
      variant: (analytics.expectancy >= 0 ? 'profit' : 'loss') as 'profit' | 'loss',
      subValue: 'per trade',
    },
    {
      title: 'Max Drawdown',
      value: `${drawdownData.maxDrawdownPercent.toFixed(2)}%`,
      variant: (drawdownData.maxDrawdownPercent > 10 ? 'loss' : 'neutral') as 'loss' | 'neutral',
      subValue: formatCurrency(drawdownData.maxDrawdown, currency),
      icon: AlertTriangle,
    },
  ]

  const statsCards = [
    { title: 'Total Trades',      value: analytics.total_trades.toString() },
    { title: 'Avg Win',           value: formatCurrency(analytics.average_win, currency) },
    { title: 'Avg Loss',          value: formatCurrency(analytics.average_loss, currency) },
    { title: 'Avg R',             value: formatRMultiple(analytics.average_r_multiple) },
    { title: 'Best Trade',        value: formatCurrency(analytics.best_trade_pnl, currency) },
    { title: 'Worst Trade',       value: formatCurrency(analytics.worst_trade_pnl, currency) },
    { title: 'Win Streak',        value: `${analytics.max_winning_streak} trades` },
    { title: 'Loss Streak',       value: `${analytics.max_losing_streak} trades` },
    { title: 'Winning Days',      value: analytics.winning_days.toString() },
    { title: 'Losing Days',       value: analytics.losing_days.toString() },
    { title: 'Current Streak',    value: `${analytics.current_streak} ${analytics.current_streak_type}` },
    { title: 'Avg Hold Time',     value: formatHoldingTime(analytics.average_holding_time_minutes) },
  ]

  return (
    <div className="p-4 md:p-6 pb-20 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">Dashboard</h1>
          <p className="text-[13px] font-medium text-grey">
            {selectedAccountId
              ? accounts.find(a => a.id === selectedAccountId)?.name
              : `All Accounts · ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#386382] text-white text-[13px] font-bold hover:bg-[#2B4E68] transition-all shadow-sm"
          id="dashboard-add-trade-btn"
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </Link>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
          >
            <MetricCard {...card} size="md" elevated={i === 0} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-[20px] glass ocean-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold text-charcoal">Equity Curve</h2>
              <p className="text-[12px] font-semibold text-grey">
                {formatCurrency(totalBalance, currency)} balance
              </p>
            </div>
            <span className={cn(
              'text-sm font-bold tabular-nums',
              analytics.total_net_pnl >= 0 ? 'text-profit' : 'text-loss'
            )}>
              {analytics.total_net_pnl >= 0 ? '+' : ''}{formatCurrency(analytics.total_net_pnl, currency)}
            </span>
          </div>
          <EquityCurveChart data={equityData} currency={currency} height={240} />
        </motion.div>

        {/* Stats mini grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[20px] glass ocean-card p-6"
        >
          <h2 className="text-[15px] font-bold text-charcoal mb-4">Performance Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            {statsCards.map(({ title, value }) => (
              <div key={title} className="rounded-xl bg-white/40 px-3 py-2.5 border border-[rgba(56,99,130,0.10)] backdrop-blur-sm">
                <p className="text-[9px] text-[#4D5B70] font-bold uppercase tracking-wider">{title}</p>
                <p className="text-[13px] font-extrabold text-[#182A3A] tabular-nums mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Daily P&L + Drawdown row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[20px] glass ocean-card p-6"
        >
          <h2 className="text-[15px] font-bold text-charcoal mb-4">Daily P&L (30 days)</h2>
          <DailyPnlChart data={dailyPnl} currency={currency} height={200} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-[20px] glass ocean-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-charcoal">Drawdown</h2>
            <span className="text-xs text-[#A55363] tabular-nums font-bold">
              Max: {drawdownData.maxDrawdownPercent.toFixed(2)}%
            </span>
          </div>
          <DrawdownChart
            data={equityData.map((e, i) => ({
              date: e.date,
              drawdown: drawdownData.drawdowns?.[i] ?? 0,
              drawdownPercent: drawdownData.drawdownPercents?.[i] ?? 0,
            }))}
            height={200}
          />
        </motion.div>
      </div>

      {/* Recent Trades */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-[20px] glass ocean-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(56,99,130,0.10)] bg-white/30">
          <h2 className="text-[15px] font-bold text-charcoal">Recent Trades</h2>
          <Link
            href="/trades"
            className="text-[12px] font-bold text-slate hover:text-charcoal flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(56,99,130,0.08)] bg-white/20">
                {['Date', 'Symbol', 'Dir', 'Lots', 'Entry', 'Exit', 'P&L', 'R', 'Result'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-[#4D5B70] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(56,99,130,0.08)]">
              {recentTrades.map(trade => (
                <tr
                  key={trade.id}
                  className="hover:bg-[rgba(56,99,130,0.04)] transition-colors group"
                >
                  <td className="px-6 py-3.5 text-[12px] font-semibold text-grey whitespace-nowrap">
                    {trade.date ? format(new Date(trade.date), 'MMM d') : '—'}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-[13px] text-charcoal whitespace-nowrap">
                    <Link href={`/trades/${trade.id}`} className="hover:text-slate transition-colors">
                      {trade.symbol}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-xs">
                    <span className={cn(
                      'px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase',
                      trade.direction === 'long'
                        ? 'bg-[rgba(53,125,113,0.12)] text-[#357D71]'
                        : 'bg-[rgba(165,83,99,0.12)] text-[#A55363]'
                    )}>
                      {trade.direction === 'long' ? 'L' : 'S'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[12px] font-medium text-grey tabular-nums">{trade.lot_size}</td>
                  <td className="px-6 py-3.5 text-[12px] font-medium text-grey tabular-nums">{trade.entry_price?.toFixed(5)}</td>
                  <td className="px-6 py-3.5 text-[12px] font-medium text-grey tabular-nums">{trade.exit_price?.toFixed(5) ?? '—'}</td>
                  <td className={cn('px-6 py-3.5 text-[13px] font-extrabold tabular-nums whitespace-nowrap', getPnlColor(trade.net_pnl ?? 0))}>
                    {trade.net_pnl !== null && trade.net_pnl !== undefined
                      ? `${trade.net_pnl >= 0 ? '+' : ''}${formatCurrency(trade.net_pnl, currency)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-[12px] font-bold tabular-nums text-grey">
                    {trade.r_multiple !== null && trade.r_multiple !== undefined
                      ? formatRMultiple(trade.r_multiple)
                      : '—'}
                  </td>
                  <td className="px-6 py-3.5">
                    {trade.result && (
                      <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold border border-border/10', getResultBadgeClass(trade.result))}>
                        {trade.result.toUpperCase()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md space-y-6"
      >
        <div className="w-24 h-24 rounded-[20px] bg-charcoal/5 border border-border/5 flex items-center justify-center mx-auto shadow-sm">
          <BarChart3 className="w-10 h-10 text-charcoal/40" />
        </div>
        <div>
          <h2 className="text-[24px] font-bold text-charcoal tracking-tight">No trades yet</h2>
          <p className="mt-3 text-[15px] text-grey font-medium leading-relaxed">
            Add your first trade to start building your trading history and analytics.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/trades/new"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-charcoal text-offwhite text-[14px] font-bold hover:bg-slate transition-all shadow-sm hover:-translate-y-0.5"
            id="empty-dashboard-add-trade"
          >
            <Plus className="w-4 h-4" />
            Add Trade
          </Link>
          <Link
            href="/import"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] border border-border/10 text-charcoal bg-card hover:bg-charcoal/5 text-[14px] font-bold transition-all"
          >
            Import CSV
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

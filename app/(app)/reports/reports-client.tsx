'use client'

import { useState, useMemo } from 'react'
import { FileText, Download, TrendingUp, TrendingDown, Calendar, Target, Activity } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Trade } from '@/types/database'

interface ReportsClientProps {
  trades: Trade[]
  currency: string
}

export function ReportsClient({ trades, currency }: ReportsClientProps) {
  const [period, setPeriod] = useState<'all' | '30d' | '7d' | 'ytd'>('all')

  const filteredTrades = useMemo(() => {
    if (period === 'all') return trades
    const now = new Date()
    const startDate = new Date()
    if (period === '30d') startDate.setDate(now.getDate() - 30)
    if (period === '7d') startDate.setDate(now.getDate() - 7)
    if (period === 'ytd') startDate.setMonth(0, 1)

    return trades.filter(t => new Date(t.date).getTime() >= startDate.getTime())
  }, [trades, period])

  const stats = useMemo(() => {
    const closedTrades = filteredTrades.filter(t => ['win', 'loss', 'breakeven'].includes(t.result))
    const total = closedTrades.length
    const wins = closedTrades.filter(t => t.result === 'win').length
    const winRate = total ? (wins / total) * 100 : 0
    const netPnl = closedTrades.reduce((s, t) => s + (t.net_pnl || 0), 0)
    const grossPnl = closedTrades.reduce((s, t) => s + (t.gross_pnl || 0), 0)
    
    const winTrades = closedTrades.filter(t => (t.net_pnl || 0) > 0)
    const lossTrades = closedTrades.filter(t => (t.net_pnl || 0) < 0)
    
    const avgWin = winTrades.length ? winTrades.reduce((s, t) => s + (t.net_pnl || 0), 0) / winTrades.length : 0
    const avgLoss = lossTrades.length ? lossTrades.reduce((s, t) => s + (t.net_pnl || 0), 0) / lossTrades.length : 0
    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : (avgWin > 0 ? 99 : 0)

    const expectancy = (winRate/100 * avgWin) - ((1 - winRate/100) * Math.abs(avgLoss))

    const bestTrade = closedTrades.length ? Math.max(...closedTrades.map(t => t.net_pnl || 0)) : 0
    const worstTrade = closedTrades.length ? Math.min(...closedTrades.map(t => t.net_pnl || 0)) : 0

    return {
      total, winRate, netPnl, grossPnl, avgWin, avgLoss, profitFactor, expectancy, bestTrade, worstTrade
    }
  }, [filteredTrades])

  function exportCSV() {
    if (filteredTrades.length === 0) return
    const headers = ['Date', 'Symbol', 'Direction', 'Lot Size', 'Result', 'Net P&L', 'Setup']
    const rows = filteredTrades.map(t => [
      t.date,
      t.symbol,
      t.direction,
      t.lot_size.toString(),
      t.result,
      (t.net_pnl || 0).toString(),
      t.setup || ''
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n")
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `trading_report_${period}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportJSON = () => {
    if (filteredTrades.length === 0) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTrades, null, 2))
    const link = document.createElement("a")
    link.setAttribute("href", dataStr)
    link.setAttribute("download", `trading_report_${period}_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
            Reports
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Generate and export trading performance reports.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={period} onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-sm font-medium focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="all">All Time</option>
          </select>

          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          
          <button 
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
          >
            JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Net P&L', value: `${stats.netPnl >= 0 ? '+' : ''}${formatCurrency(stats.netPnl, currency)}`, color: stats.netPnl >= 0 ? 'text-profit' : 'text-loss', icon: TrendingUp },
          { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, icon: Target },
          { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), icon: Activity },
          { label: 'Expectancy', value: formatCurrency(stats.expectancy, currency), color: stats.expectancy >= 0 ? 'text-profit' : 'text-loss', icon: TrendingUp },
          { label: 'Total Trades', value: stats.total.toString(), icon: Calendar },
          { label: 'Avg Win', value: formatCurrency(stats.avgWin, currency), color: 'text-profit', icon: TrendingUp },
          { label: 'Avg Loss', value: formatCurrency(stats.avgLoss, currency), color: 'text-loss', icon: TrendingDown },
          { label: 'Best Trade', value: formatCurrency(stats.bestTrade, currency), color: 'text-profit', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--ring))] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
              <Icon className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className={`text-xl font-bold ${color || ''}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
          <h2 className="font-semibold text-sm">Preview ({filteredTrades.length} trades)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[hsl(var(--muted-foreground))] uppercase bg-[hsl(var(--muted)/0.3)] border-b border-[hsl(var(--border))]">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Symbol</th>
                <th className="px-4 py-3 font-semibold text-center">Dir</th>
                <th className="px-4 py-3 font-semibold text-right">Size</th>
                <th className="px-4 py-3 font-semibold text-center">Result</th>
                <th className="px-4 py-3 font-semibold text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.slice(0, 10).map((t, i) => (
                <tr key={t.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="px-4 py-3 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3 font-medium">{t.symbol}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", t.direction === 'long' ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
                      {t.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{t.lot_size}</td>
                  <td className="px-4 py-3 text-center capitalize">
                    {t.result === 'win' ? '🟢' : t.result === 'loss' ? '🔴' : '⚪'}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-medium", (t.net_pnl || 0) > 0 ? "text-profit" : (t.net_pnl || 0) < 0 ? "text-loss" : "")}>
                    {(t.net_pnl || 0) >= 0 ? '+' : ''}{formatCurrency(t.net_pnl || 0, currency)}
                  </td>
                </tr>
              ))}
              {filteredTrades.length > 10 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-xs text-[hsl(var(--muted-foreground))] italic">
                    Showing 10 of {filteredTrades.length} trades. Export to see all.
                  </td>
                </tr>
              )}
              {filteredTrades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    No trades found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

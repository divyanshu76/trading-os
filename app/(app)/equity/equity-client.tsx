'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Trade } from '@/types/database'

interface EquityClientProps {
  trades: Trade[]
  currency: string
  accounts: Array<{ id: string; name: string; current_balance: number; initial_balance: number }>
}

export function EquityClient({ trades, currency, accounts }: EquityClientProps) {
  const initialBalance = accounts.reduce((acc, a) => acc + (a.initial_balance || 0), 0)

  const data = useMemo(() => {
    // Sort trades chronologically
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    let currentEquity = initialBalance
    let peakEquity = initialBalance

    const chartData = sorted.map((t, index) => {
      currentEquity += (t.net_pnl || 0)
      if (currentEquity > peakEquity) peakEquity = currentEquity
      
      const drawdown = peakEquity > 0 ? ((peakEquity - currentEquity) / peakEquity) * 100 : 0

      return {
        tradeId: t.id,
        date: t.date,
        equity: currentEquity,
        drawdown: -drawdown,
      }
    })

    // Add starting point
    chartData.unshift({
      tradeId: 'start',
      date: sorted[0] ? sorted[0].date : new Date().toISOString().split('T')[0],
      equity: initialBalance,
      drawdown: 0,
    })

    return chartData
  }, [trades, initialBalance])

  const currentEquity = data.length > 0 ? data[data.length - 1].equity : initialBalance
  const totalPnl = currentEquity - initialBalance
  const maxDrawdown = data.length > 0 ? Math.min(...data.map(d => d.drawdown)) : 0
  const peakEquity = data.length > 0 ? Math.max(...data.map(d => d.equity)) : initialBalance

  if (trades.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-[hsl(var(--primary))]" />
            Equity Curve
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Detailed equity growth and drawdown analysis.</p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <TrendingUp className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-20" />
          <h2 className="text-lg font-semibold">No closed trades yet</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Add your first trade to start tracking your equity curve.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-[hsl(var(--primary))]" />
          Equity Curve
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Detailed equity growth and drawdown analysis across your accounts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Current Equity', value: formatCurrency(currentEquity, currency) },
          { label: 'Net Profit', value: `${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl, currency)}`, color: totalPnl >= 0 ? 'text-profit' : 'text-loss' },
          { label: 'Peak Equity', value: formatCurrency(peakEquity, currency) },
          { label: 'Max Drawdown', value: `${maxDrawdown.toFixed(2)}%`, color: 'text-loss' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color || ''}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Equity Chart */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
            Growth
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.substring(5, 10)}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => formatCurrency(val, currency, false)}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value), currency), 'Equity']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border)/0.2)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#equityColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drawdown Chart */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-loss" />
            Drawdown
          </h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ddColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--loss))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  hide
                />
                <YAxis 
                  domain={['auto', 0]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Drawdown']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border)/0.2)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="drawdown" 
                  stroke="hsl(var(--loss))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#ddColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

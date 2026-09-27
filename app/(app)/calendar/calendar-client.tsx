'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Trade } from '@/types/database'

interface CalendarClientProps {
  trades: Trade[]
  currency: string
}

export function CalendarClient({ trades, currency }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Ensure calendar starts on Sunday
  const startDay = monthStart.getDay() // 0 = Sunday
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i)

  // Group trades by date (YYYY-MM-DD)
  const tradesByDate = trades.reduce((acc, trade) => {
    const dateStr = trade.date
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(trade)
    return acc
  }, {} as Record<string, Trade[]>)

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const selectedTrades = selectedDate ? tradesByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : []

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[hsl(var(--primary))]" />
            Trade Calendar
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Visual calendar heatmap of your trading performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
            Today
          </button>
          <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            <button onClick={prevMonth} className="p-2 hover:bg-[hsl(var(--muted))] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 text-sm font-semibold min-w-[120px] text-center border-x border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-[hsl(var(--muted))] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1">
            {paddingDays.map(i => (
              <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.1)]" />
            ))}
            {daysInMonth.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayTrades = tradesByDate[dateStr] || []
              const dailyPnl = dayTrades.reduce((s, t) => s + (t.net_pnl ?? 0), 0)
              const hasTrades = dayTrades.length > 0
              const isWin = dailyPnl > 0
              const isLoss = dailyPnl < 0
              
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] p-2 border-b border-r border-[hsl(var(--border))] relative group transition-colors text-left flex flex-col",
                    isSelected ? "bg-[hsl(var(--primary)/0.1)] ring-2 ring-inset ring-[hsl(var(--primary))]" : "hover:bg-[hsl(var(--muted)/0.5)]",
                    (i + startDay + 1) % 7 === 0 && "border-r-0"
                  )}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isToday(day) ? "bg-[hsl(var(--primary))] text-white" : ""
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasTrades && (
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted))]">
                        {dayTrades.length}
                      </span>
                    )}
                  </div>
                  
                  {hasTrades && (
                    <div className="mt-auto space-y-1 w-full">
                      <div className={cn(
                        "text-sm font-bold truncate",
                        isWin ? "text-profit" : isLoss ? "text-loss" : "text-[hsl(var(--muted-foreground))]"
                      )}>
                        {dailyPnl >= 0 ? '+' : ''}{formatCurrency(dailyPnl, currency)}
                      </div>
                      <div className="flex gap-0.5 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--border))]">
                        {dayTrades.map((t, idx) => (
                          <div 
                            key={t.id ?? idx} 
                            className={cn(
                              "flex-1", 
                              t.net_pnl && t.net_pnl > 0 ? "bg-profit" : t.net_pnl && t.net_pnl < 0 ? "bg-loss" : "bg-[hsl(var(--muted-foreground))]"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex flex-col h-[600px] lg:h-auto">
          {selectedDate ? (
            <>
              <div className="mb-4">
                <h3 className="font-bold text-lg">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {selectedTrades.length} trade{selectedTrades.length !== 1 ? 's' : ''}
                </p>
              </div>

              {selectedTrades.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-3">
                  {selectedTrades.map((trade) => {
                    const isWin = (trade.net_pnl ?? 0) > 0
                    const Icon = isWin ? TrendingUp : TrendingDown
                    return (
                      <div key={trade.id} className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-[hsl(var(--ring))] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                              trade.direction === 'long' ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                            )}>
                              {trade.direction}
                            </span>
                            <span className="font-semibold text-sm">{trade.symbol}</span>
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">{trade.entry_time?.substring(0, 5) || '--:--'}</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Net P&L</p>
                            <p className={cn("font-bold", isWin ? "text-profit" : "text-loss")}>
                              {trade.net_pnl && trade.net_pnl >= 0 ? '+' : ''}{formatCurrency(trade.net_pnl ?? 0, currency)}
                            </p>
                          </div>
                          {trade.r_multiple !== null && (
                            <div className="text-right">
                              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">R</p>
                              <p className="font-medium text-sm">{trade.r_multiple}R</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-[hsl(var(--muted-foreground))]">
                  <Target className="w-12 h-12 mb-3 opacity-20" />
                  <p>No trades on this day.</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[hsl(var(--muted-foreground))]">
              <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
              <p>Select a date to view trades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

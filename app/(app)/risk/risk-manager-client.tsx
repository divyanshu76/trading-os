'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, TrendingDown, Activity, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RiskSettings } from '@/types/database'

interface RiskManagerClientProps {
  riskSettings: RiskSettings[]
  todayTrades: Array<{ net_pnl: number | null; risk_amount: number | null; risk_percent: number | null; result: string; entry_time: string }>
  accounts: Array<{ id: string; name: string; currency: string; current_balance: number }>
  currency: string
}

export function RiskManagerClient({ riskSettings, todayTrades, accounts, currency }: RiskManagerClientProps) {
  const [saving, setSaving] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string>('')

  const settings = riskSettings.find(r => r.account_id === selectedAccount || (!selectedAccount && !r.account_id))

  // Today metrics
  const todayPnl = todayTrades.reduce((s, t) => s + (t.net_pnl ?? 0), 0)
  const todayLoss = Math.abs(Math.min(0, todayPnl))
  const tradeCount = todayTrades.length
  const consecutiveLosses = (() => {
    let count = 0
    for (let i = todayTrades.length - 1; i >= 0; i--) {
      if (todayTrades[i].result === 'loss') count++
      else break
    }
    return count
  })()

  const accountBalance = accounts.find(a => a.id === selectedAccount)?.current_balance
    ?? accounts.reduce((s, a) => s + a.current_balance, 0)

  const dailyLossLimit = settings?.max_daily_loss_amount ?? (settings?.max_daily_loss_percent ? accountBalance * settings.max_daily_loss_percent / 100 : null)
  const dailyLossUsed = dailyLossLimit ? (todayLoss / dailyLossLimit) * 100 : null
  const maxTradesPerDay = settings?.max_trades_per_day
  const tradesUsed = maxTradesPerDay ? (tradeCount / maxTradesPerDay) * 100 : null

  function getProgressColor(pct: number) {
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const [form, setForm] = useState({
    default_risk_percent:     settings?.default_risk_percent ?? 1,
    max_daily_loss_percent:   settings?.max_daily_loss_percent ?? 2,
    max_weekly_loss_percent:  settings?.max_weekly_loss_percent ?? 5,
    max_monthly_loss_percent: settings?.max_monthly_loss_percent ?? 10,
    max_drawdown_percent:     settings?.max_drawdown_percent ?? 10,
    max_trades_per_day:       settings?.max_trades_per_day ?? 5,
    max_consecutive_losses:   settings?.max_consecutive_losses ?? 3,
    max_open_positions:       settings?.max_open_positions ?? 3,
  })

  async function saveSettings() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      account_id: selectedAccount || null,
      ...form,
    }

    const { error } = settings?.id
      ? await (supabase.from('risk_settings') as any).update(payload as any).eq('id', settings.id)
      : await (supabase.from('risk_settings') as any).insert(payload as any)

    setSaving(false)
    if (error) toast.error('Failed to save')
    else toast.success('Risk settings saved')
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-[hsl(var(--primary))]" />
          Risk Manager
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Monitor your daily risk exposure and configure risk limits.
        </p>
      </div>

      {/* Today's Risk Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Today's P&L",    value: `${todayPnl >= 0 ? '+' : ''}${formatCurrency(todayPnl, currency)}`, color: todayPnl >= 0 ? 'text-profit' : 'text-loss', icon: Activity },
          { label: 'Today Trades',   value: tradeCount.toString(), color: '', icon: BarChart3 },
          { label: 'Today Loss',     value: formatCurrency(todayLoss, currency), color: 'text-loss', icon: TrendingDown },
          { label: 'Consec. Losses', value: consecutiveLosses.toString(), color: consecutiveLosses >= 3 ? 'text-[hsl(var(--warning))]' : '', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
                <p className={cn('text-xl font-bold tabular-nums mt-1', color)}>{value}</p>
              </div>
              <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      {(dailyLossLimit || maxTradesPerDay) && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-4">
          <h2 className="text-sm font-semibold">Today's Limits</h2>
          {dailyLossLimit && dailyLossUsed !== null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[hsl(var(--muted-foreground))]">Daily Loss Limit</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(todayLoss, currency)} / {formatCurrency(dailyLossLimit, currency)}
                  <span className={cn('ml-2', dailyLossUsed >= 90 ? 'text-loss' : dailyLossUsed >= 70 ? 'text-[hsl(var(--warning))]' : 'text-profit')}>
                    ({dailyLossUsed.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-[hsl(var(--muted))]">
                <div
                  className={cn('h-2 rounded-full transition-all', getProgressColor(dailyLossUsed))}
                  style={{ width: `${Math.min(100, dailyLossUsed)}%` }}
                />
              </div>
              {dailyLossUsed >= 80 && (
                <p className="text-xs text-[hsl(var(--warning))] flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Approaching daily loss limit
                </p>
              )}
            </div>
          )}

          {maxTradesPerDay && tradesUsed !== null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[hsl(var(--muted-foreground))]">Daily Trade Limit</span>
                <span className="font-medium tabular-nums">
                  {tradeCount} / {maxTradesPerDay} trades ({tradesUsed.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-[hsl(var(--muted))]">
                <div
                  className={cn('h-2 rounded-full transition-all', getProgressColor(tradesUsed))}
                  style={{ width: `${Math.min(100, tradesUsed)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Risk Settings</h2>
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--input))]"
          >
            <option value="">Global (all accounts)</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'default_risk_percent',     label: 'Default Risk %',         suffix: '%' },
            { key: 'max_daily_loss_percent',   label: 'Max Daily Loss %',        suffix: '%' },
            { key: 'max_weekly_loss_percent',  label: 'Max Weekly Loss %',       suffix: '%' },
            { key: 'max_monthly_loss_percent', label: 'Max Monthly Loss %',      suffix: '%' },
            { key: 'max_drawdown_percent',     label: 'Max Drawdown %',          suffix: '%' },
            { key: 'max_trades_per_day',       label: 'Max Trades/Day',          suffix: '' },
            { key: 'max_consecutive_losses',   label: 'Max Consecutive Losses',  suffix: '' },
            { key: 'max_open_positions',       label: 'Max Open Positions',      suffix: '' },
          ].map(({ key, label, suffix }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={(form as Record<string, number>)[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className={cn(inputClass, suffix ? 'pr-6' : '')}
                />
                {suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">{suffix}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-50 transition-all"
          id="save-risk-settings"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

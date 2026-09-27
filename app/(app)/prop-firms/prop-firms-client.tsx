'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, TrendingUp, AlertTriangle, CheckCircle, XCircle, Target } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { PropAccount, PropFirm } from '@/types/database'

type PropAccountWithFirm = PropAccount & { prop_firm?: PropFirm | null }

interface PropFirmsClientProps {
  propAccounts: PropAccountWithFirm[]
  propFirms: PropFirm[]
  currency: string
}

const PHASE_COLORS: Record<string, string> = {
  challenge: 'bg-violet-400/15 text-violet-400 border-violet-400/30',
  phase_1:   'bg-blue-400/15 text-blue-400 border-blue-400/30',
  phase_2:   'bg-cyan-400/15 text-cyan-400 border-cyan-400/30',
  funded:    'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  passed:    'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  failed:    'bg-red-400/15 text-red-400 border-red-400/30',
  archived:  'bg-neutral-400/15 text-neutral-400 border-neutral-400/30',
}

const PHASE_LABELS: Record<string, string> = {
  challenge: 'Challenge',
  phase_1: 'Phase 1',
  phase_2: 'Phase 2',
  funded: 'Funded',
  passed: 'Passed',
  failed: 'Failed',
  archived: 'Archived',
}

export function PropFirmsClient({ propAccounts, propFirms, currency }: PropFirmsClientProps) {
  const [accounts, setAccounts] = useState(propAccounts)
  const [firms, setFirms] = useState(propFirms)
  const [showAddFirm, setShowAddFirm] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newFirmName, setNewFirmName] = useState('')
  const [savingFirm, setSavingFirm] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)

  const accountSchema = z.object({
    prop_firm_id: z.string().min(1, 'Select a prop firm'),
    name: z.string().min(1, 'Account name is required'),
    phase: z.enum(['challenge', 'phase_1', 'phase_2', 'funded', 'passed', 'failed', 'archived']),
    account_size: z.number().min(0),
    profit_target_percent: z.number().min(0),
    daily_loss_limit_percent: z.number().min(0),
    overall_loss_limit_percent: z.number().min(0),
  })

  type AccountForm = z.infer<typeof accountSchema>

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      phase: 'challenge',
      account_size: 100000,
      profit_target_percent: 8,
      daily_loss_limit_percent: 5,
      overall_loss_limit_percent: 10,
    }
  })

  async function addFirm() {
    if (!newFirmName.trim()) return
    setSavingFirm(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('prop_firms').insert({ user_id: user.id, name: newFirmName.trim() } as any).select().single()
    setSavingFirm(false)
    if (error) toast.error('Failed to add firm')
    else { 
      toast.success('Firm added')
      setNewFirmName('')
      setShowAddFirm(false)
      if (data) setFirms(prev => [...prev, data as any])
    }
  }

  async function onSubmitAccount(data: AccountForm) {
    setSavingAccount(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const initial_balance = data.account_size
    const profit_target = (initial_balance * data.profit_target_percent) / 100
    const daily_loss_limit = (initial_balance * data.daily_loss_limit_percent) / 100
    const overall_loss_limit = (initial_balance * data.overall_loss_limit_percent) / 100

    const payload = {
      ...data,
      user_id: user.id,
      currency,
      initial_balance,
      current_balance: initial_balance,
      current_equity: initial_balance,
      profit_target,
      daily_loss_limit,
      overall_loss_limit
    }

    const { data: acc, error } = await (supabase.from('prop_accounts') as any).insert(payload).select('*, prop_firm:prop_firms(*)').single()
    setSavingAccount(false)
    
    if (error) {
      toast.error(error.message)
    } else if (acc) {
      setAccounts(prev => [...prev, acc])
      toast.success('Prop account added')
      setShowAddAccount(false)
      reset()
    }
  }

  const totalFunded = accounts.filter(a => a.phase === 'funded' || a.phase === 'passed').length
  const totalFailed = accounts.filter(a => a.phase === 'failed').length
  const totalActive = accounts.filter(a => !['failed', 'archived'].includes(a.phase)).length

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[hsl(var(--primary))]" />
            Prop Firms
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Track your prop firm accounts and challenge progress.
          </p>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors"
          id="add-prop-account-btn"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Accounts', value: totalActive, icon: Target, color: 'text-[hsl(var(--primary))]' },
          { label: 'Funded / Passed', value: totalFunded, icon: CheckCircle, color: 'text-profit' },
          { label: 'Failed',          value: totalFailed, icon: XCircle, color: 'text-loss' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', color)} />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
            </div>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Accounts grid */}
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <Building2 className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <h2 className="text-lg font-semibold">No prop accounts yet</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 mb-4">
            Add your prop firm challenge to start tracking progress.
          </p>
          <button
            onClick={() => setShowAddAccount(true)}
            className="px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Prop Account
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account, i) => {
            const profit = account.current_balance - account.initial_balance
            const profitTarget = account.profit_target
            const profitProgress = Math.min(100, (profit / profitTarget) * 100)
            const dailyLossUsed = account.current_equity < account.initial_balance
              ? account.initial_balance - account.current_equity
              : 0
            const dailyLossProgress = (dailyLossUsed / account.daily_loss_limit) * 100
            const ddAmount = account.initial_balance - account.current_equity
            const ddProgress = (ddAmount / account.overall_loss_limit) * 100

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{account.prop_firm?.name ?? 'Unknown Firm'}</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{account.name}</p>
                    {account.account_number && (
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{account.account_number}</p>
                    )}
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap', PHASE_COLORS[account.phase])}>
                    {PHASE_LABELS[account.phase]}
                  </span>
                </div>

                {/* Balance + P&L */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Balance</p>
                    <p className="text-base font-bold tabular-nums mt-0.5">
                      {formatCurrency(account.current_balance, account.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Profit</p>
                    <p className={cn('text-base font-bold tabular-nums mt-0.5', profit >= 0 ? 'text-profit' : 'text-loss')}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit, account.currency)}
                    </p>
                  </div>
                </div>

                {/* Profit Target Progress */}
                <div>
                  <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mb-1">
                    <span>Profit Target</span>
                    <span className="tabular-nums">{formatCurrency(profit, account.currency)} / {formatCurrency(profitTarget, account.currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.max(0, profitProgress)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{profitProgress.toFixed(1)}% of target</p>
                </div>

                {/* Daily loss */}
                <div>
                  <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mb-1">
                    <span>Daily Loss Limit</span>
                    <span className="tabular-nums">{formatCurrency(dailyLossUsed, account.currency)} / {formatCurrency(account.daily_loss_limit, account.currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className={cn('h-1.5 rounded-full transition-all', dailyLossProgress >= 80 ? 'bg-red-500' : 'bg-amber-500')}
                      style={{ width: `${Math.min(100, dailyLossProgress)}%` }}
                    />
                  </div>
                </div>

                {/* Overall DD */}
                <div>
                  <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mb-1">
                    <span>Overall Drawdown</span>
                    <span className="tabular-nums">{formatCurrency(ddAmount, account.currency)} / {formatCurrency(account.overall_loss_limit, account.currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className={cn('h-1.5 rounded-full transition-all', ddProgress >= 80 ? 'bg-red-500' : ddProgress >= 50 ? 'bg-amber-500' : 'bg-blue-500')}
                      style={{ width: `${Math.min(100, Math.max(0, ddProgress))}%` }}
                    />
                  </div>
                </div>

                {/* Trading days */}
                {account.min_trading_days && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[hsl(var(--muted-foreground))]">Trading Days</span>
                    <span className="font-medium tabular-nums">
                      — / {account.min_trading_days} min
                    </span>
                  </div>
                )}

                {/* Phase selector */}
                <select
                  defaultValue={account.phase}
                  onChange={async (e) => {
                    const supabase = createClient()
                    await (supabase.from('prop_accounts') as any).update({ phase: e.target.value } as any).eq('id', account.id)
                    setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, phase: e.target.value as PropAccount['phase'] } : a))
                    toast.success('Phase updated')
                  }}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--input))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  {Object.entries(PHASE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Firm Modal */}
      {showAddFirm && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold">Add Prop Firm</h2>
            <input
              value={newFirmName}
              onChange={e => setNewFirmName(e.target.value)}
              placeholder="e.g. FTMO, MyFundedFX…"
              className="w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm"
              id="new-firm-name"
            />
            <div className="flex gap-2">
              <button onClick={addFirm} disabled={savingFirm} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                {savingFirm ? 'Adding…' : 'Add Firm'}
              </button>
              <button onClick={() => setShowAddFirm(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Prop Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">Add Prop Account</h2>
              <button onClick={() => setShowAddAccount(false)} className="text-[hsl(var(--muted-foreground))] hover:text-charcoal"><XCircle className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitAccount)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Prop Firm</label>
                <div className="flex gap-2">
                  <select {...register('prop_firm_id')} className="flex-1 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]">
                    <option value="">Select Firm...</option>
                    {firms.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowAddFirm(true)} className="px-3 py-2 bg-[hsl(var(--muted))] text-xs font-semibold rounded-lg">New Firm</button>
                </div>
                {errors.prop_firm_id && <p className="text-red-500 text-xs mt-1">{errors.prop_firm_id.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Account Name</label>
                <input {...register('name')} placeholder="e.g. 100K Challenge" className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]"/>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phase</label>
                  <select {...register('phase')} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]">
                    {Object.entries(PHASE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Account Size</label>
                  <input type="number" {...register('account_size', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Target %</label>
                  <input type="number" step="0.1" {...register('profit_target_percent', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Daily Loss %</label>
                  <input type="number" step="0.1" {...register('daily_loss_limit_percent', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Loss %</label>
                  <input type="number" step="0.1" {...register('overall_loss_limit_percent', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[#FFFFFF] text-[14px]"/>
                </div>
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddAccount(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancel</button>
                <button type="submit" disabled={savingAccount} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                  {savingAccount ? 'Saving...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

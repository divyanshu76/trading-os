'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Plus, Edit2, Trash2, CheckCircle2, TrendingUp, Target, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn, SESSIONS, TIMEFRAMES, formatCurrency } from '@/lib/utils'
import type { Strategy, Trade } from '@/types/database'

interface StrategiesClientProps {
  initialStrategies: Strategy[]
  trades: Trade[]
  currency: string
}

export function StrategiesClient({ initialStrategies, trades, currency }: StrategiesClientProps) {
  const [strategies, setStrategies] = useState(initialStrategies)
  const [showEditor, setShowEditor] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    market: '',
    timeframes: [] as string[],
    trading_sessions: [] as string[],
    entry_rules: '',
    exit_rules: '',
    stop_loss_rules: '',
    take_profit_rules: ''
  })
  const [saving, setSaving] = useState(false)

  const toggleArrayItem = (key: 'timeframes' | 'trading_sessions', val: string) => {
    setForm(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      ...form,
      updated_at: new Date().toISOString()
    }

    if (editingStrategy) {
      const { data, error } = await (supabase.from('strategies') as any).update(payload as any).eq('id', editingStrategy.id).select().single()
      if (!error && data) {
        setStrategies(strategies.map(s => s.id === data.id ? data : s))
        toast.success('Strategy updated')
      }
    } else {
      const { data, error } = await (supabase.from('strategies') as any).insert(payload as any).select().single()
      if (!error && data) {
        setStrategies([data, ...strategies])
        toast.success('Strategy created')
      }
    }

    setSaving(false)
    setShowEditor(false)
    setEditingStrategy(null)
  }

  async function deleteStrategy(id: string) {
    if (!confirm('Delete this strategy? Trades will lose their strategy link.')) return
    const supabase = createClient()
    await supabase.from('strategies').delete().eq('id', id)
    setStrategies(strategies.filter(s => s.id !== id))
    toast.success('Strategy deleted')
  }

  function openEditor(s?: Strategy) {
    if (s) {
      setEditingStrategy(s)
      setForm({
        name: s.name,
        description: s.description || '',
        market: s.market || '',
        timeframes: s.timeframes || [],
        trading_sessions: s.trading_sessions || [],
        entry_rules: s.entry_rules || '',
        exit_rules: s.exit_rules || '',
        stop_loss_rules: s.stop_loss_rules || '',
        take_profit_rules: s.take_profit_rules || ''
      })
    } else {
      setEditingStrategy(null)
      setForm({
        name: '', description: '', market: '', timeframes: [], trading_sessions: [],
        entry_rules: '', exit_rules: '', stop_loss_rules: '', take_profit_rules: ''
      })
    }
    setShowEditor(true)
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[hsl(var(--primary))]" />
            Strategies
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage setups and analyze performance per strategy.</p>
        </div>
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Strategy
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => {
          const strategyTrades = trades.filter(t => t.strategy_id === strategy.id && ['win','loss','breakeven'].includes(t.result))
          const totalTrades = strategyTrades.length
          const wins = strategyTrades.filter(t => t.result === 'win').length
          const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : '0'
          const netPnl = strategyTrades.reduce((s, t) => s + (t.net_pnl || 0), 0)
          
          return (
            <motion.div 
              key={strategy.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex flex-col hover:border-[hsl(var(--ring))] transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{strategy.name}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{strategy.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditor(strategy)} className="p-1.5 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteStrategy(strategy.id)} className="p-1.5 rounded text-[hsl(var(--muted-foreground))] hover:text-loss">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
                <div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide flex items-center gap-1"><Activity className="w-3 h-3"/> Trades</p>
                  <p className="text-lg font-bold mt-1">{totalTrades}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide flex items-center gap-1"><Target className="w-3 h-3"/> Win Rate</p>
                  <p className="text-lg font-bold mt-1">{winRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Net P&L</p>
                  <p className={cn("text-lg font-bold mt-1 truncate", netPnl > 0 ? "text-profit" : netPnl < 0 ? "text-loss" : "")}>
                    {netPnl >= 0 ? '+' : ''}{formatCurrency(netPnl, currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                {strategy.entry_rules && (
                  <div>
                    <span className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase">Entry Rules</span>
                    <p className="mt-1 line-clamp-2">{strategy.entry_rules}</p>
                  </div>
                )}
                {strategy.exit_rules && (
                  <div>
                    <span className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase">Exit Rules</span>
                    <p className="mt-1 line-clamp-2">{strategy.exit_rules}</p>
                  </div>
                )}
                <div className="col-span-full flex flex-wrap gap-1 mt-2">
                  {strategy.timeframes?.map(tf => <span key={tf} className="px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-xs font-semibold">{tf}</span>)}
                  {strategy.trading_sessions?.map(s => <span key={s} className="px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-semibold capitalize">{s}</span>)}
                </div>
              </div>
            </motion.div>
          )
        })}

        {strategies.length === 0 && (
          <div className="col-span-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center flex flex-col items-center justify-center">
            <Briefcase className="w-12 h-12 text-[hsl(var(--muted-foreground))] mb-3 opacity-20" />
            <h2 className="text-lg font-semibold">No strategies found</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 mb-4">
              Create your first trading strategy to start tracking edge performance.
            </p>
            <button onClick={() => openEditor()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
              <Plus className="w-4 h-4" /> Create Strategy
            </button>
          </div>
        )}
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="font-semibold text-lg">{editingStrategy ? 'Edit Strategy' : 'New Strategy'}</h2>
              <button onClick={() => setShowEditor(false)} className="text-[hsl(var(--muted-foreground))] hover:text-charcoal p-1">
                ✕
              </button>
            </div>
            
            <div className="space-y-5 overflow-y-auto pr-2 scrollbar-thin">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Strategy Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="e.g. A+ Breakout" />
                </div>
                <div>
                  <label className={labelClass}>Market</label>
                  <input value={form.market} onChange={e => setForm({...form, market: e.target.value})} className={inputClass} placeholder="e.g. Forex, Crypto, Indices" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={inputClass} placeholder="Brief summary of the setup..." />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-4 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                <div>
                  <label className={labelClass}>Timeframes</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMEFRAMES.map(tf => (
                      <button
                        key={tf} type="button"
                        onClick={() => toggleArrayItem('timeframes', tf)}
                        className={cn("px-3 py-1 text-xs font-semibold rounded-md transition-colors", form.timeframes.includes(tf) ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--card))] border border-[hsl(var(--border))]")}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Sessions</label>
                  <div className="flex flex-wrap gap-2">
                    {SESSIONS.map(s => (
                      <button
                        key={s.value} type="button"
                        onClick={() => toggleArrayItem('trading_sessions', s.value)}
                        className={cn("px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors", form.trading_sessions.includes(s.value) ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--card))] border border-[hsl(var(--border))]")}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Entry Rules</label>
                  <textarea value={form.entry_rules} onChange={e => setForm({...form, entry_rules: e.target.value})} className={cn(inputClass, "min-h-[80px] resize-none")} placeholder="Confluences needed for entry..." />
                </div>
                <div>
                  <label className={labelClass}>Exit Rules</label>
                  <textarea value={form.exit_rules} onChange={e => setForm({...form, exit_rules: e.target.value})} className={cn(inputClass, "min-h-[80px] resize-none")} placeholder="When to manually close..." />
                </div>
                <div>
                  <label className={labelClass}>Stop Loss Rules</label>
                  <textarea value={form.stop_loss_rules} onChange={e => setForm({...form, stop_loss_rules: e.target.value})} className={cn(inputClass, "min-h-[80px] resize-none")} placeholder="Where to place SL..." />
                </div>
                <div>
                  <label className={labelClass}>Take Profit Rules</label>
                  <textarea value={form.take_profit_rules} onChange={e => setForm({...form, take_profit_rules: e.target.value})} className={cn(inputClass, "min-h-[80px] resize-none")} placeholder="Where to take profits..." />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[hsl(var(--border))] flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted)/0.5)]">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)]">
                <CheckCircle2 className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Strategy'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

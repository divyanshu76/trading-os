'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, Edit, Trash2, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, cn, CURRENCIES, generateColor } from '@/lib/utils'
import type { Account } from '@/types/database'

const accountSchema = z.object({
  name: z.string().min(1, 'Enter account name'),
  type: z.enum(['personal', 'mt5', 'demo', 'prop_firm', 'crypto', 'stock', 'custom']),
  broker: z.string().optional(),
  account_number: z.string().optional(),
  currency: z.string().min(1),
  initial_balance: z.number().min(0),
})

type AccountForm = z.infer<typeof accountSchema>

interface AccountsClientProps {
  accounts: Account[]
  currency: string
}

const TYPE_LABELS: Record<string, string> = {
  personal: 'Personal', mt5: 'MT5', demo: 'Demo',
  prop_firm: 'Prop Firm', crypto: 'Crypto', stock: 'Stock', custom: 'Custom',
}

export function AccountsClient({ accounts: initialAccounts, currency }: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: 'personal', currency, initial_balance: 0 },
  })

  async function onSubmit(data: AccountForm) {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      ...data,
      user_id: user.id,
      current_balance: data.initial_balance,
      color: generateColor(data.name),
    }

    if (editingId) {
      const { error } = await (supabase.from('accounts') as any).update(payload as any).eq('id', editingId)
      if (!error) {
        setAccounts(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a))
        toast.success('Account updated')
      }
    } else {
      const { data: acc, error } = await (supabase.from('accounts').insert(payload as any).select().single() as any)
      if (!error && acc) {
        setAccounts(prev => [...prev, acc])
        toast.success('Account created')
      }
    }

    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    reset()
  }

  async function deleteAccount(id: string) {
    if (!confirm('Delete this account? All linked trades will lose account association.')) return
    const supabase = createClient()
    const { count } = await supabase.from('trades').select('*', { count: 'exact', head: true }).eq('account_id', id)
    if (count && count > 0) {
      toast.error('This account has associated trades. You cannot delete it. Archiving is recommended.')
      return
    }
    
    await supabase.from('accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    toast.success('Account deleted')
  }

  async function setDefault(id: string) {
    const supabase = createClient()
    await (supabase.from('accounts') as any).update({ is_default: false }).neq('id', id)
    await (supabase.from('accounts') as any).update({ is_default: true }).eq('id', id)
    setAccounts(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
    toast.success('Default account updated')
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[hsl(var(--primary))]" />
            Accounts
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{accounts.length} account(s)</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); reset() }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
          id="add-account-btn"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Account cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {accounts.map((acc, i) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color ?? '#6366f1' }} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{acc.name}</h3>
                    {acc.is_default && (
                      <span className="text-[10px] text-[hsl(var(--primary))] font-medium">DEFAULT</span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {TYPE_LABELS[acc.type]} {acc.broker ? `· ${acc.broker}` : ''} {acc.account_number ? `· ${acc.account_number}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setDefault(acc.id)} title="Set as default"
                  className={cn('p-1.5 rounded hover:bg-[hsl(var(--muted))]', acc.is_default ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')}>
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteAccount(acc.id)}
                  className="p-1.5 rounded hover:bg-red-400/10 text-[hsl(var(--muted-foreground))] hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Currency', value: acc.currency },
                { label: 'Status', value: acc.is_active ? 'Active' : 'Inactive' },
                { label: 'Initial Balance', value: formatCurrency(acc.initial_balance, acc.currency) },
                { label: 'Current Balance', value: formatCurrency(acc.current_balance, acc.currency) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium tabular-nums mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {accounts.length === 0 && (
          <div className="md:col-span-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
            <Wallet className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <h2 className="text-lg font-semibold">No accounts yet</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 mb-4">Create your first trading account to get started.</p>
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
              <Plus className="w-4 h-4 inline mr-2" />Add Account
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4"
          >
            <h2 className="font-semibold">{editingId ? 'Edit' : 'Add'} Account</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className={labelClass}>Account Name *</label>
                <input {...register('name')} placeholder="My MT5 Account" className={inputClass} id="account-name" />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Type</label>
                  <select {...register('type')} className={inputClass} id="account-type">
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <select {...register('currency')} className={inputClass} id="account-currency">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Broker</label>
                  <input {...register('broker')} placeholder="ICMarkets" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account #</label>
                  <input {...register('account_number')} placeholder="12345678" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Initial Balance</label>
                <input {...register('initial_balance', { valueAsNumber: true })} type="number" step="0.01" className={inputClass} id="account-balance" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Create Account'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); reset() }}
                  className="px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

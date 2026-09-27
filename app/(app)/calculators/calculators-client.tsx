'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, TrendingDown, AlertCircle, Info, Plus } from 'lucide-react'
import { calculateLotSize, calculatePnl, calculateRR, calculateRewardFromTP, DEFAULT_INSTRUMENTS, formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Account, Instrument } from '@/types/database'

const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

interface CalculatorsClientProps {
  accounts: Account[]
  instruments: Instrument[]
  riskSettings: any
}

export function CalculatorsClient({ accounts, instruments, riskSettings }: CalculatorsClientProps) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  
  const selectedAccount = accounts.find(a => a.id === accountId)
  
  const [form, setForm] = useState({
    riskPercent: riskSettings?.default_risk_percent || 1,
    symbol: 'XAUUSD',
    direction: 'long' as 'long' | 'short',
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
  })

  const [result, setResult] = useState({
    lotSize: 0,
    riskAmount: 0,
    rewardAmount: 0,
    rrRatio: 0,
    potentialLoss: 0,
    potentialProfit: 0,
  })

  const [specWarning, setSpecWarning] = useState<string | null>(null)
  const [priceWarning, setPriceWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedAccount) {
      setSpecWarning(null)
      setPriceWarning(null)
      return
    }

    // 1. Validation for prices
    if (form.entryPrice > 0 && form.stopLoss > 0) {
      if (form.direction === 'long' && form.stopLoss >= form.entryPrice) {
        setPriceWarning('Stop Loss must be below Entry for LONG')
      } else if (form.direction === 'short' && form.stopLoss <= form.entryPrice) {
        setPriceWarning('Stop Loss must be above Entry for SHORT')
      } else {
        setPriceWarning(null)
      }
    } else {
      setPriceWarning(null)
    }

    if (form.riskPercent <= 0) {
      setPriceWarning('Risk percentage must be greater than 0')
    }

    // 2. Find instrument specs
    let spec = instruments.find(i => i.symbol === form.symbol.toUpperCase())
    if (!spec) {
      spec = DEFAULT_INSTRUMENTS[form.symbol.toUpperCase()] as any
    }

    if (!spec || !spec.tick_size || !spec.tick_value || !spec.contract_size) {
      setSpecWarning('Instrument specifications required')
      setResult({ lotSize: 0, riskAmount: 0, rewardAmount: 0, rrRatio: 0, potentialLoss: 0, potentialProfit: 0 })
      return
    }

    setSpecWarning(null)

    if (priceWarning || form.entryPrice === 0 || form.stopLoss === 0) {
      setResult({ lotSize: 0, riskAmount: 0, rewardAmount: 0, rrRatio: 0, potentialLoss: 0, potentialProfit: 0 })
      return
    }

    // 3. Calculate
    try {
      const { lotSize, riskAmount } = calculateLotSize({
        accountBalance: selectedAccount.current_balance,
        riskPercent: form.riskPercent,
        direction: form.direction,
        entryPrice: form.entryPrice,
        stopLoss: form.stopLoss,
        instrument: spec as any,
      })

      const rewardAmount = form.takeProfit
        ? calculateRewardFromTP({
            direction: form.direction,
            entryPrice: form.entryPrice,
            takeProfit: form.takeProfit,
            lotSize,
            instrument: spec as any,
          })
        : 0

      const rrRatio = riskAmount > 0 ? calculateRR({ riskAmount, rewardAmount }) : 0

      setResult({ lotSize, riskAmount, rewardAmount, rrRatio, potentialLoss: riskAmount, potentialProfit: rewardAmount })
    } catch (e) {
      setResult({ lotSize: 0, riskAmount: 0, rewardAmount: 0, rrRatio: 0, potentialLoss: 0, potentialProfit: 0 })
    }
  }, [form, selectedAccount, instruments, priceWarning])

  const update = (key: string, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }))

  if (accounts.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Calculator className="w-12 h-12 text-[hsl(var(--muted-foreground))]" />
        <h2 className="text-xl font-bold">No accounts yet</h2>
        <p className="text-[hsl(var(--muted-foreground))]">Create an account to use account-based risk calculation.</p>
        <Link href="/accounts" className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-[10px] font-semibold">
          <Plus className="w-4 h-4" /> Add Account
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[hsl(var(--primary))]" />
          Position Size Calculator
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Calculate optimal lot size based on your risk parameters and instrument specifications.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="text-sm font-semibold">Parameters</h2>

          <div>
            <label className={labelClass}>Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className={inputClass}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.current_balance, a.currency)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Risk % per trade</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1" max={riskSettings?.max_daily_loss_percent || 10} step="0.1"
                value={form.riskPercent}
                onChange={e => update('riskPercent', Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--primary))]"
              />
              <span className="w-14 text-right text-sm font-bold tabular-nums text-[hsl(var(--primary))]">
                {form.riskPercent}%
              </span>
            </div>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
              Risk Amount: {selectedAccount ? formatCurrency((selectedAccount.current_balance * form.riskPercent) / 100, selectedAccount.currency) : '$0'}
            </p>
          </div>

          <div>
            <label className={labelClass}>Symbol</label>
            <input
              type="text"
              value={form.symbol}
              onChange={e => update('symbol', e.target.value.toUpperCase())}
              className={cn(inputClass, 'uppercase')}
              placeholder="XAUUSD"
            />
          </div>

          <div>
            <label className={labelClass}>Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {(['long', 'short'] as const).map(dir => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => update('direction', dir)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-semibold text-sm transition-all',
                    form.direction === dir
                      ? dir === 'long'
                        ? 'border-emerald-400 bg-emerald-400/15 text-emerald-400'
                        : 'border-red-400 bg-red-400/15 text-red-400'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
                  )}
                >
                  {dir === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {dir.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'entryPrice', label: 'Entry Price' },
              { key: 'stopLoss',   label: 'Stop Loss' },
              { key: 'takeProfit', label: 'Take Profit' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type="number"
                  step="any"
                  value={form[key as keyof typeof form] || ''}
                  onChange={e => update(key, Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <motion.div
            key={JSON.stringify(result) + (specWarning||'') + (priceWarning||'')}
            initial={{ opacity: 0.6, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold">Results</h2>

            {specWarning ? (
              <div className="text-center py-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto" />
                <p className="font-bold">{specWarning}</p>
                <Link href="/settings/instruments" className="inline-block px-4 py-2 bg-amber-500 text-white rounded text-xs font-bold">
                  Configure {form.symbol}
                </Link>
              </div>
            ) : priceWarning ? (
              <div className="text-center py-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto" />
                <p className="font-bold">{priceWarning}</p>
              </div>
            ) : (
              <>
                <div className="text-center py-4 rounded-xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Recommended Lot Size</p>
                  <p className="text-5xl font-bold text-[hsl(var(--primary))] tabular-nums mt-1">
                    {result.lotSize.toFixed(2)}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">lots</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Risk Amount',      value: formatCurrency(result.riskAmount, selectedAccount?.currency || 'USD'),   color: 'text-[hsl(var(--warning))]' },
                    { label: 'Potential Loss',   value: formatCurrency(result.potentialLoss, selectedAccount?.currency || 'USD'), color: 'text-loss' },
                    { label: 'Potential Reward', value: formatCurrency(result.potentialProfit, selectedAccount?.currency || 'USD'), color: 'text-profit' },
                    { label: 'Risk:Reward',      value: result.rrRatio ? `1:${result.rrRatio.toFixed(2)}` : '—',            color: '' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg bg-[hsl(var(--muted))] p-3">
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
                      <p className={cn('text-base font-bold tabular-nums mt-0.5', color)}>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

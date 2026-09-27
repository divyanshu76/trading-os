'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { PremiumSelect } from '@/components/shared/premium-select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  calculatePnl, calculateNetPnl, calculateRiskFromSL, calculateRewardFromTP,
  calculateRR, calculateRMultiple, calculateHoldingTime, DEFAULT_INSTRUMENTS, formatCurrency
} from '@/lib/calculations'
import { cn, SESSIONS, EMOTIONS, TIMEFRAMES } from '@/lib/utils'
import type { Instrument, TradeChecklistItem } from '@/types/database'

const tradeSchema = z.object({
  // Basic
  account_id: z.string().min(1, 'Select an account'),
  date: z.string().min(1, 'Select a date'),
  entry_time: z.string().min(1, 'Enter entry time'),
  exit_time: z.string().optional(),
  symbol: z.string().min(1, 'Enter symbol').toUpperCase(),
  direction: z.enum(['long', 'short']),
  lot_size: z.preprocess((val) => (typeof val === 'string' && val.trim() === '') || Number.isNaN(Number(val)) ? undefined : Number(val), z.number().finite('Lot size must be finite')),

  // Prices
  entry_price: z.preprocess((val) => Number.isNaN(val) ? undefined : val, z.number().positive('Entry price must be positive')),
  stop_loss: z.preprocess((val) => Number.isNaN(val) ? null : val, z.number().optional().nullable()),
  take_profit: z.preprocess((val) => Number.isNaN(val) ? null : val, z.number().optional().nullable()),
  exit_price: z.preprocess((val) => Number.isNaN(val) ? null : val, z.number().optional().nullable()),

  // Strategy
  strategy_id: z.string().optional().nullable(),
  setup: z.string().optional(),
  timeframe: z.string().optional(),
  session: z.string().optional().nullable(),
  market_condition: z.string().optional().nullable(),

  // Psychology
  emotion_before: z.string().optional().nullable(),
  emotion_during: z.string().optional().nullable(),
  emotion_after: z.string().optional().nullable(),
  confidence_score: z.preprocess((val) => Number.isNaN(val) ? null : val, z.number().min(1).max(10).optional().nullable()),
  discipline_score: z.preprocess((val) => Number.isNaN(val) ? null : val, z.number().min(1).max(10).optional().nullable()),
  stress_level: z.preprocess((val) => Number.isNaN(val) ? null : val, z.number().min(1).max(10).optional().nullable()),

  // Journal
  trade_reason: z.string().optional(),
  what_went_right: z.string().optional(),
  what_went_wrong: z.string().optional(),
  lesson: z.string().optional(),
})

type TradeFormValues = z.infer<typeof tradeSchema>

interface AddTradeFormProps {
  accounts: Array<{ id: string; name: string; currency: string; current_balance: number }>
  strategies: Array<{ id: string; name: string }>
  instruments: Instrument[]
  checklistItems: TradeChecklistItem[]
  currency: string
}

type Section = 'basic' | 'prices' | 'strategy' | 'psychology' | 'journal' | 'screenshots' | 'checklist'

const SECTIONS: Array<{ id: Section; label: string; description: string }> = [
  { id: 'basic',     label: '1 · Basic',      description: 'Account, symbol, direction, lot' },
  { id: 'prices',    label: '2 · Prices',     description: 'Entry, SL, TP, exit' },
  { id: 'strategy',  label: '3 · Strategy',   description: 'Setup, session, conditions' },
  { id: 'psychology',label: '4 · Psychology', description: 'Emotions, discipline' },
  { id: 'journal',   label: '5 · Journal',    description: 'Notes, lessons' },
  { id: 'screenshots',label: '6 · Screenshots',description: 'Before, Entry, Exit' },
  { id: 'checklist', label: '7 · Checklist',  description: 'Pre-trade rules' },
]

export function AddTradeForm({ accounts, strategies, instruments, checklistItems, currency }: AddTradeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [openSection, setOpenSection] = useState<Section>('basic')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [calculated, setCalculated] = useState<{
    gross_pnl: number | null
    net_pnl: number | null
    risk_amount: number | null
    reward_amount: number | null
    rr_ratio: number | null
    r_multiple: number | null
    pips: number | null
    holding_duration_minutes: number | null
    result: 'win' | 'loss' | 'breakeven' | 'open'
  }>({
    gross_pnl: null, net_pnl: null, risk_amount: null,
    reward_amount: null, rr_ratio: null, r_multiple: null,
    pips: null, holding_duration_minutes: null, result: 'open',
  })
  
  const [screenshots, setScreenshots] = useState<{ before: File | null; entry: File | null; exit: File | null }>({
    before: null,
    entry: null,
    exit: null,
  })

  const handleImageChange = (type: 'before' | 'entry' | 'exit', file: File | null) => {
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Image must be JPG, PNG, or WEBP.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image is too large. Maximum size is 10 MB.')
        return
      }
    }
    setScreenshots(prev => ({ ...prev, [type]: file }))
  }

  const dynamicTradeSchema = useMemo(() => {
    return tradeSchema.superRefine((data, ctx) => {
      const symbol = data.symbol?.toUpperCase()
      const instrumentData = instruments.find(i => i.symbol.toUpperCase() === symbol)
      const spec = instrumentData ?? DEFAULT_INSTRUMENTS[symbol ?? ''] ?? { min_lot: 0.01, lot_step: 0.01 }
      const minLot = spec.min_lot ?? 0.01
      
      if (data.lot_size !== undefined && data.lot_size < minLot) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Lot size must be at least ${minLot}`,
          path: ['lot_size']
        })
      }
    })
  }, [instruments])

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<TradeFormValues>({
    resolver: zodResolver(dynamicTradeSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      direction: 'long',
    },
  })

  const watchedValues = watch()

  // Auto-calculate whenever key fields change
  useEffect(() => {
    const { symbol, direction, entry_price, stop_loss, take_profit, exit_price, lot_size, entry_time, exit_time } = watchedValues

    if (!symbol || !direction || !entry_price || lot_size === undefined || lot_size < 0) return

    // Find instrument specs
    const instrumentData = instruments.find(i => i.symbol.toUpperCase() === symbol?.toUpperCase())
    const spec = instrumentData ?? DEFAULT_INSTRUMENTS[symbol?.toUpperCase() ?? ''] ?? {
      tick_size: 0.00001, tick_value: 1, contract_size: 100000, point_size: 0.00001
    }

    const instrumentSpec = {
      tick_size: spec.tick_size ?? 0.00001,
      tick_value: spec.tick_value ?? 1,
      contract_size: spec.contract_size ?? 100000,
      point_size: spec.point_size ?? 0.00001,
    }

    let gross_pnl: number | null = null
    let pips: number | null = null
    let result: 'win' | 'loss' | 'breakeven' | 'open' = 'open'

    if (exit_price) {
      const pnlResult = calculatePnl({ direction, entryPrice: entry_price, exitPrice: exit_price, lotSize: lot_size, instrument: instrumentSpec })
      gross_pnl = pnlResult.gross_pnl
      pips = pnlResult.pips
      result = gross_pnl > 0 ? 'win' : gross_pnl < 0 ? 'loss' : 'breakeven'
    }

    const net_pnl = gross_pnl !== null
      ? calculateNetPnl({ grossPnl: gross_pnl, commission: 0, swap: 0, spread: 0 })
      : null

    const risk_amount = stop_loss
      ? calculateRiskFromSL({ direction, entryPrice: entry_price, stopLoss: stop_loss, lotSize: lot_size, instrument: instrumentSpec })
      : null

    const reward_amount = take_profit
      ? calculateRewardFromTP({ direction, entryPrice: entry_price, takeProfit: take_profit, lotSize: lot_size, instrument: instrumentSpec })
      : null

    const rr_ratio = risk_amount && reward_amount
      ? calculateRR({ riskAmount: risk_amount, rewardAmount: reward_amount })
      : null

    const r_multiple = net_pnl !== null && risk_amount
      ? calculateRMultiple({ netPnl: net_pnl, riskAmount: risk_amount })
      : null

    const holding_duration_minutes = entry_time && exit_time
      ? calculateHoldingTime({
          entryTime: `${watchedValues.date}T${entry_time}`,
          exitTime: `${watchedValues.date}T${exit_time}`,
        })
      : null

    setCalculated({ gross_pnl, net_pnl, risk_amount, reward_amount, rr_ratio, r_multiple, pips, holding_duration_minutes, result })
  }, [
    watchedValues.symbol, watchedValues.direction, watchedValues.entry_price,
    watchedValues.stop_loss, watchedValues.take_profit, watchedValues.exit_price,
    watchedValues.lot_size, watchedValues.entry_time, watchedValues.exit_time,
    watchedValues.date, instruments
  ])

  async function onSubmit(data: any) {
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not authenticated'); setLoading(false); return }

    const selectedAccount = accounts.find(a => a.id === data.account_id)

    // Server validates — never trust client calculations for final DB write
    const tradePayload = {
      user_id: user.id,
      account_id: data.account_id,
      date: data.date,
      entry_time: `${data.date}T${data.entry_time}:00`,
      exit_time: data.exit_time ? `${data.date}T${data.exit_time}:00` : null,
      symbol: data.symbol.toUpperCase(),
      direction: data.direction,
      lot_size: data.lot_size,
      entry_price: data.entry_price,
      stop_loss: data.stop_loss ?? null,
      take_profit: data.take_profit ?? null,
      exit_price: data.exit_price ?? null,
      commission: 0,
      swap: 0,
      spread: 0,
      gross_pnl: calculated.gross_pnl,
      net_pnl: calculated.net_pnl,
      risk_amount: calculated.risk_amount,
      risk_percent: calculated.risk_amount && selectedAccount
        ? (calculated.risk_amount / selectedAccount.current_balance) * 100
        : null,
      reward_amount: calculated.reward_amount,
      rr_ratio: calculated.rr_ratio,
      r_multiple: calculated.r_multiple,
      pips: calculated.pips,
      holding_duration_minutes: calculated.holding_duration_minutes,
      strategy_id: data.strategy_id || null,
      setup: data.setup || null,
      timeframe: data.timeframe || null,
      session: data.session || null,
      market_condition: data.market_condition || null,
      emotion_before: data.emotion_before || null,
      emotion_during: data.emotion_during || null,
      emotion_after: data.emotion_after || null,
      confidence_score: data.confidence_score ?? null,
      discipline_score: data.discipline_score ?? null,
      stress_level: data.stress_level ?? null,
      trade_reason: data.trade_reason || null,
      what_went_right: data.what_went_right || null,
      what_went_wrong: data.what_went_wrong || null,
      lesson: data.lesson || null,
      result: calculated.result,
      source: 'manual' as const,
      is_demo: false,
      checklist_completed: checklistItems.length > 0 && Object.values(checklist).filter(Boolean).length === checklistItems.length,
    }

    const { data: trade, error } = await (supabase.from('trades').insert(tradePayload as any).select().single() as any)

    if (error) {
      console.error('Supabase Insert Error:', error)
      toast.error('Trade could not be saved. Please try again.')
      setLoading(false)
      return
    }

    let hasScreenshotError = false
    for (const type of ['before', 'entry', 'exit'] as const) {
      const file = screenshots[type]
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${trade.id}/${type}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, file)
          
        if (uploadError) {
          hasScreenshotError = true
          console.error(`Upload error for ${type}:`, uploadError)
          continue
        }
        
        await (supabase.from('trade_screenshots') as any).insert({
          trade_id: trade.id,
          user_id: user.id,
          type,
          storage_path: fileName,
          order_index: type === 'before' ? 0 : type === 'entry' ? 1 : 2,
          caption: type.charAt(0).toUpperCase() + type.slice(1)
        })
      }
    }

    if (hasScreenshotError) {
      toast.warning('Trade saved, but some screenshots failed to upload. You can retry in Trade Details.')
    } else {
      toast.success('Trade saved successfully.')
    }
    
    router.push(`/trades/${trade.id}`)
    router.refresh()
  }

  const onError = (errors: any) => {
    if (!errors || Object.keys(errors).length === 0) return
    
    console.error('ADD TRADE VALIDATION ERRORS', errors)
    toast.error('Please complete the required fields.')

    const errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      const basicFields = ['account_id', 'symbol', 'date', 'direction', 'entry_time', 'exit_time', 'lot_size']
      const pricesFields = ['entry_price', 'stop_loss', 'take_profit', 'exit_price']
      const strategyFields = ['strategy_id', 'setup', 'timeframe', 'session', 'market_condition']
      const psychologyFields = ['emotion_before', 'emotion_during', 'emotion_after', 'confidence_score', 'discipline_score', 'stress_level']
      const journalFields = ['trade_reason', 'what_went_right', 'what_went_wrong', 'lesson']

      if (errorKeys.some(k => basicFields.includes(k))) setOpenSection('basic')
      else if (errorKeys.some(k => pricesFields.includes(k))) setOpenSection('prices')
      else if (errorKeys.some(k => strategyFields.includes(k))) setOpenSection('strategy')
      else if (errorKeys.some(k => psychologyFields.includes(k))) setOpenSection('psychology')
      else if (errorKeys.some(k => journalFields.includes(k))) setOpenSection('journal')
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'
  const errorClass = 'text-[12px] font-semibold text-loss mt-1'

  const sectionErrors = {
    basic: ['account_id', 'symbol', 'date', 'direction', 'entry_time', 'exit_time', 'lot_size'].filter(k => errors[k as keyof typeof errors]).length,
    prices: ['entry_price', 'stop_loss', 'take_profit', 'exit_price'].filter(k => errors[k as keyof typeof errors]).length,
    strategy: ['strategy_id', 'setup', 'timeframe', 'session', 'market_condition'].filter(k => errors[k as keyof typeof errors]).length,
    psychology: ['emotion_before', 'emotion_during', 'emotion_after', 'confidence_score', 'discipline_score', 'stress_level'].filter(k => errors[k as keyof typeof errors]).length,
    journal: ['trade_reason', 'what_went_right', 'what_went_wrong', 'lesson'].filter(k => errors[k as keyof typeof errors]).length,
    screenshots: 0,
    checklist: 0
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/trades" className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Add Trade</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Record a new trade entry</p>
        </div>
      </div>

      {/* Live Calculator Panel */}
      {(calculated.gross_pnl !== null || calculated.risk_amount !== null) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        >
          {[
            { label: 'Net P&L', value: calculated.net_pnl !== null ? `${calculated.net_pnl >= 0 ? '+' : ''}${formatCurrency(calculated.net_pnl, currency)}` : '—', color: calculated.net_pnl !== null ? (calculated.net_pnl >= 0 ? 'text-profit' : 'text-loss') : '' },
            { label: 'Risk', value: calculated.risk_amount !== null ? formatCurrency(calculated.risk_amount, currency) : '—', color: 'text-[hsl(var(--warning))]' },
            { label: 'R:R', value: calculated.rr_ratio !== null ? `1:${calculated.rr_ratio}` : '—', color: '' },
            { label: 'R Multiple', value: calculated.r_multiple !== null ? `${calculated.r_multiple >= 0 ? '+' : ''}${calculated.r_multiple}R` : '—', color: calculated.r_multiple !== null ? (calculated.r_multiple >= 0 ? 'text-profit' : 'text-loss') : '' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
              <p className={cn('text-base font-bold tabular-nums', color)}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <div className="space-y-3">
          {SECTIONS.map(({ id, label, description }) => (
            <div key={id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === id ? ('basic' as Section) : id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{description}</span>
                  {sectionErrors[id] > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-loss ml-2 bg-loss/10 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> {sectionErrors[id]} error{sectionErrors[id] > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {openSection === id ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
              </button>

              {openSection === id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-4 pt-1 border-t border-[hsl(var(--border))]"
                >
                  {/* ── BASIC ─────────────────────────────────────────────────── */}
                  {id === 'basic' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className={labelClass}>Account *</label>
                        <Controller
                          control={control}
                          name="account_id"
                          render={({ field }) => (
                            <PremiumSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              options={accounts.map(a => ({ label: a.name, value: a.id }))}
                              placeholder="Select account"
                            />
                          )}
                        />
                        {errors.account_id && <p className={errorClass}>{errors.account_id.message}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Symbol *</label>
                        <input
                          {...register('symbol')}
                          id="trade-symbol"
                          placeholder="XAUUSD"
                          className={cn(inputClass, 'uppercase')}
                        />
                        {errors.symbol && <p className={errorClass}>{errors.symbol.message}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Date *</label>
                        <input {...register('date')} type="date" id="trade-date" className={inputClass} />
                        {errors.date && <p className={errorClass}>{errors.date.message}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Direction *</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['long', 'short'] as const).map(dir => (
                            <label key={dir} className="cursor-pointer">
                              <input {...register('direction')} type="radio" value={dir} className="sr-only" />
                              <div className={cn(
                                'flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-semibold text-sm transition-all',
                                watchedValues.direction === dir
                                  ? dir === 'long'
                                    ? 'border-emerald-400 bg-emerald-400/15 text-emerald-400'
                                    : 'border-red-400 bg-red-400/15 text-red-400'
                                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
                              )}>
                                {dir === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {dir.toUpperCase()}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Entry Time *</label>
                        <input {...register('entry_time')} type="time" id="trade-entry-time" className={inputClass} />
                        {errors.entry_time && <p className={errorClass}>{errors.entry_time.message}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Exit Time</label>
                        <input {...register('exit_time')} type="time" id="trade-exit-time" className={inputClass} />
                      </div>

                      <div>
                        <label className={labelClass}>Lot Size *</label>
                        <input
                          {...register('lot_size', { valueAsNumber: true })}
                          type="number"
                          step={(() => {
                            const sym = watchedValues.symbol?.toUpperCase()
                            const inst = instruments.find(i => i.symbol.toUpperCase() === sym)
                            return (inst ?? DEFAULT_INSTRUMENTS[sym ?? ''] ?? { lot_step: 0.01 }).lot_step ?? 0.01
                          })()}
                          min={(() => {
                            const sym = watchedValues.symbol?.toUpperCase()
                            const inst = instruments.find(i => i.symbol.toUpperCase() === sym)
                            return (inst ?? DEFAULT_INSTRUMENTS[sym ?? ''] ?? { min_lot: 0.01 }).min_lot ?? 0.01
                          })()}
                          id="trade-lot-size"
                          placeholder="0.01"
                          className={inputClass}
                          onBlur={(e) => {
                            const sym = watchedValues.symbol?.toUpperCase()
                            const inst = instruments.find(i => i.symbol.toUpperCase() === sym)
                            const minLot = (inst ?? DEFAULT_INSTRUMENTS[sym ?? ''] ?? { min_lot: 0.01 }).min_lot ?? 0.01
                            const v = parseFloat(e.target.value)
                            if (!isNaN(v) && v < minLot) {
                              e.target.value = String(minLot)
                              setValue('lot_size', minLot, { shouldValidate: true })
                            }
                          }}
                        />
                        {errors.lot_size && <p className={errorClass}>{errors.lot_size.message}</p>}
                      </div>
                    </div>
                  )}

                  {/* ── PRICES ──────────────────────────────────────────────── */}
                  {id === 'prices' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {([
                        { key: 'entry_price', label: 'Entry Price *', id: 'trade-entry-price' },
                        { key: 'stop_loss',   label: 'Stop Loss',     id: 'trade-stop-loss' },
                        { key: 'take_profit', label: 'Take Profit',   id: 'trade-take-profit' },
                        { key: 'exit_price',  label: 'Exit Price',    id: 'trade-exit-price' },
                      ] as const).map(({ key, label, id: fid }) => (
                        <div key={key}>
                          <label className={labelClass}>{label}</label>
                          <input
                            {...register(key as keyof TradeFormValues, { valueAsNumber: true })}
                            type="number"
                            step="any"
                            id={fid}
                            placeholder="0"
                            className={inputClass}
                          />
                          {errors[key as keyof typeof errors] && (
                            <p className={errorClass}>{(errors[key as keyof typeof errors] as { message?: string })?.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── STRATEGY ────────────────────────────────────────────── */}
                  {id === 'strategy' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className={labelClass}>Strategy</label>
                        <Controller
                          control={control}
                          name="strategy_id"
                          render={({ field }) => (
                            <PremiumSelect
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              options={[{ label: 'No strategy', value: '' }, ...strategies.map(s => ({ label: s.name, value: s.id }))]}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Setup</label>
                        <input {...register('setup')} placeholder="e.g. Liquidity grab" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Timeframe</label>
                        <Controller
                          control={control}
                          name="timeframe"
                          render={({ field }) => (
                            <PremiumSelect
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              options={[{ label: 'Any', value: '' }, ...TIMEFRAMES.map(tf => ({ label: tf, value: tf }))]}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Session</label>
                        <Controller
                          control={control}
                          name="session"
                          render={({ field }) => (
                            <PremiumSelect
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              options={[{ label: 'Any', value: '' }, ...SESSIONS.map(s => ({ label: s.label, value: s.value }))]}
                            />
                          )}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Market Condition</label>
                        <Controller
                          control={control}
                          name="market_condition"
                          render={({ field }) => (
                            <PremiumSelect
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              options={[
                                { label: 'Unknown', value: '' },
                                { label: 'Trending Up', value: 'trending_up' },
                                { label: 'Trending Down', value: 'trending_down' },
                                { label: 'Ranging', value: 'ranging' },
                                { label: 'Volatile', value: 'volatile' },
                                { label: 'News Driven', value: 'news_driven' },
                                { label: 'Low Volatility', value: 'low_volatility' },
                              ]}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* ── PSYCHOLOGY ──────────────────────────────────────────── */}
                  {id === 'psychology' && (
                    <div className="space-y-4 mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { key: 'emotion_before', label: 'Emotion Before' },
                          { key: 'emotion_during', label: 'Emotion During' },
                          { key: 'emotion_after',  label: 'Emotion After' },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className={labelClass}>{label}</label>
                            <Controller
                              control={control}
                              name={key as keyof TradeFormValues}
                              render={({ field }) => (
                                <PremiumSelect
                                  value={field.value as string}
                                  onValueChange={field.onChange}
                                  options={[{ label: 'Not recorded', value: '' }, ...EMOTIONS.map(e => ({ label: `${e.emoji} ${e.label}`, value: e.value }))]}
                                />
                              )}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { key: 'confidence_score', label: 'Confidence (1-10)' },
                          { key: 'discipline_score', label: 'Discipline (1-10)' },
                          { key: 'stress_level',     label: 'Stress Level (1-10)' },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className={labelClass}>{label}</label>
                            <input
                              {...register(key as keyof TradeFormValues, { valueAsNumber: true })}
                              type="number" min="1" max="10" className={inputClass}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── JOURNAL ─────────────────────────────────────────────── */}
                  {id === 'journal' && (
                    <div className="space-y-4 mt-3">
                      {[
                        { key: 'trade_reason',    label: 'Trade Reason / Why did you take this trade?' },
                        { key: 'what_went_right', label: 'What went right?' },
                        { key: 'what_went_wrong', label: 'What went wrong?' },
                        { key: 'lesson',          label: 'Lesson learned' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className={labelClass}>{label}</label>
                          <textarea
                            {...register(key as keyof TradeFormValues)}
                            rows={3}
                            className={cn(inputClass, 'resize-none')}
                            placeholder="Write your notes here…"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── SCREENSHOTS ───────────────────────────────────────────── */}
                  {id === 'screenshots' && (
                    <div className="mt-3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['before', 'entry', 'exit'] as const).map(type => (
                          <div key={type} className="border border-[hsl(var(--border))] rounded-lg p-3 bg-[hsl(var(--muted)/0.3)]">
                            <label className={labelClass}>{type.charAt(0).toUpperCase() + type.slice(1)} Trade</label>
                            {screenshots[type] ? (
                              <div className="mt-2 space-y-2">
                                <div className="relative aspect-video rounded overflow-hidden bg-black/10 border border-[hsl(var(--border))]">
                                  <img 
                                    src={URL.createObjectURL(screenshots[type]!)} 
                                    alt={`${type} screenshot`}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs truncate max-w-[150px] text-[hsl(var(--muted-foreground))]">
                                    {screenshots[type]?.name}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handleImageChange(type, null)}
                                    className="text-xs font-medium text-loss hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2">
                                <label className="flex items-center justify-center w-full aspect-video rounded border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.05)] cursor-pointer transition-all">
                                  <div className="text-center">
                                    <Plus className="w-5 h-5 mx-auto text-[hsl(var(--muted-foreground))]" />
                                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1 block">
                                      Upload
                                    </span>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/jpeg,image/png,image/webp" 
                                    className="hidden" 
                                    onChange={(e) => handleImageChange(type, e.target.files?.[0] || null)}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── CHECKLIST ───────────────────────────────────────────── */}
                  {id === 'checklist' && (
                    <div className="mt-3 space-y-2">
                      {checklistItems.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          No checklist configured.{' '}
                          <Link href="/settings" className="text-[hsl(var(--primary))] hover:underline">
                            Set up your checklist in Settings.
                          </Link>
                        </p>
                      ) : (
                        <>
                          <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                            {Object.values(checklist).filter(Boolean).length} / {checklistItems.length} completed
                          </div>
                          {checklistItems.map(item => (
                            <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={checklist[item.id] ?? false}
                                onChange={e => setChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                className="mt-0.5 w-4 h-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
                              />
                              <span className={cn(
                                'text-sm transition-colors',
                                checklist[item.id] ? 'line-through text-[hsl(var(--muted-foreground))]' : ''
                              )}>
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            id="add-trade-submit"
            className="flex-1 sm:flex-none px-8 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving…' : 'Save Trade'}
          </button>
          <Link
            href="/trades"
            className="px-6 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
          >
            Cancel
          </Link>
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
          Trading involves financial risk. This journal provides historical analysis and calculation tools; it does not guarantee future results.
        </p>
      </form>
    </div>
  )
}

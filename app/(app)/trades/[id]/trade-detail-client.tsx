'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Edit, Trash2, TrendingUp, TrendingDown,
  Clock, Calendar, Target, Brain, BookOpen, AlertTriangle, Camera
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn, getPnlColor, getResultBadgeClass, EMOTIONS, formatCurrency, formatRMultiple, formatHoldingTime } from '@/lib/utils'
import type { Trade, TradeScreenshot } from '@/types/database'

interface TradeDetailClientProps {
  trade: Trade & { account?: { id: string; name: string; currency: string } | null; strategy?: { id: string; name: string; color: string | null } | null }
  screenshots: TradeScreenshot[]
  currency: string
}

export function TradeDetailClient({ trade, screenshots, currency }: TradeDetailClientProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const pnlPositive = (trade.net_pnl ?? 0) >= 0

  async function handleDelete() {
    if (!confirm('Delete this trade permanently?')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('trades').delete().eq('id', trade.id)
    if (error) {
      toast.error('Failed to delete trade')
      setDeleting(false)
      return
    }
    toast.success('Trade deleted')
    router.push('/trades')
    router.refresh()
  }

  const emotion = (key: string | null) => EMOTIONS.find(e => e.value === key)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/trades" className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{trade.symbol}</h1>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-bold uppercase',
                trade.direction === 'long' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-red-400/15 text-red-400'
              )}>
                {trade.direction === 'long' ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                {trade.direction?.toUpperCase()}
              </span>
              {trade.result && (
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', getResultBadgeClass(trade.result))}>
                  {trade.result.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              {trade.date ? format(new Date(trade.date), 'MMMM d, yyyy') : '—'} · {trade.account?.name ?? 'Unknown account'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/trades/${trade.id}/edit`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-400/30 text-red-400 text-sm hover:bg-red-400/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Key metrics bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          {
            label: 'Net P&L',
            value: trade.net_pnl !== null
              ? `${trade.net_pnl >= 0 ? '+' : ''}${formatCurrency(trade.net_pnl, currency)}`
              : '—',
            className: getPnlColor(trade.net_pnl ?? 0),
          },
          {
            label: 'R Multiple',
            value: formatRMultiple(trade.r_multiple),
            className: getPnlColor(trade.r_multiple ?? 0),
          },
          {
            label: 'Risk',
            value: trade.risk_amount ? formatCurrency(trade.risk_amount, currency) : '—',
            className: 'text-[hsl(var(--warning))]',
          },
          {
            label: 'R:R',
            value: trade.rr_ratio ? `1:${trade.rr_ratio}` : '—',
            className: '',
          },
        ].map(({ label, value, className }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
            <p className={cn('text-xl font-bold tabular-nums mt-1', className)}>{value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Trade Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
            Trade Information
          </h2>
          <dl className="space-y-2">
            {[
              { label: 'Entry Price', value: trade.entry_price?.toFixed(5) },
              { label: 'Stop Loss',   value: trade.stop_loss?.toFixed(5) ?? '—' },
              { label: 'Take Profit', value: trade.take_profit?.toFixed(5) ?? '—' },
              { label: 'Exit Price',  value: trade.exit_price?.toFixed(5) ?? '—' },
              { label: 'Lot Size',    value: trade.lot_size?.toString() },
              { label: 'Pips',        value: trade.pips ? `${trade.pips > 0 ? '+' : ''}${trade.pips}` : '—' },
              { label: 'Commission',  value: trade.commission ? formatCurrency(trade.commission, currency) : '$0.00' },
              { label: 'Swap',        value: trade.swap ? formatCurrency(trade.swap, currency) : '$0.00' },
              { label: 'Hold Time',   value: formatHoldingTime(trade.holding_duration_minutes) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-[hsl(var(--border)/0.5)] last:border-0">
                <dt className="text-xs text-[hsl(var(--muted-foreground))]">{label}</dt>
                <dd className="text-xs font-medium tabular-nums">{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Strategy + Session */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" />
            Strategy
          </h2>
          <dl className="space-y-2">
            {[
              { label: 'Strategy',   value: trade.strategy?.name ?? '—' },
              { label: 'Setup',      value: trade.setup ?? '—' },
              { label: 'Timeframe',  value: trade.timeframe ?? '—' },
              { label: 'Session',    value: trade.session?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—' },
              { label: 'Condition',  value: trade.market_condition?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—' },
              { label: 'Source',     value: trade.source ?? 'manual' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-[hsl(var(--border)/0.5)] last:border-0">
                <dt className="text-xs text-[hsl(var(--muted-foreground))]">{label}</dt>
                <dd className="text-xs font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>

      {/* Psychology */}
      {(trade.emotion_before || trade.emotion_during || trade.emotion_after) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-[hsl(var(--primary))]" />
            Psychology
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Before', key: trade.emotion_before },
              { label: 'During', key: trade.emotion_during },
              { label: 'After',  key: trade.emotion_after },
            ].map(({ label, key }) => {
              const em = emotion(key)
              return (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">{label}</p>
                  {em ? (
                    <div className="space-y-1">
                      <span className="text-2xl">{em.emoji}</span>
                      <p className="text-xs font-medium">{em.label}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">—</p>
                  )}
                </div>
              )
            })}
          </div>
          {(trade.confidence_score || trade.discipline_score || trade.stress_level) && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[hsl(var(--border))]">
              {[
                { label: 'Confidence', value: trade.confidence_score },
                { label: 'Discipline', value: trade.discipline_score },
                { label: 'Stress',     value: trade.stress_level },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
                  <p className="text-xl font-bold mt-1">{value ?? '—'}<span className="text-xs text-[hsl(var(--muted-foreground))]">/10</span></p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Journal Notes */}
      {(trade.trade_reason || trade.what_went_right || trade.what_went_wrong || trade.lesson) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-4"
        >
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" />
            Journal Notes
          </h2>
          {[
            { label: 'Trade Reason',    value: trade.trade_reason },
            { label: 'What Went Right', value: trade.what_went_right },
            { label: 'What Went Wrong', value: trade.what_went_wrong },
            { label: 'Lesson',          value: trade.lesson },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Screenshots */}
      <ScreenshotsSection screenshots={screenshots} />
    </div>
  )
}

function ScreenshotsSection({ screenshots }: { screenshots: TradeScreenshot[] }) {
  const supabase = createClient()
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (screenshots.length === 0) return
    const fetchUrls = async () => {
      const result: Record<string, string> = {}
      for (const s of screenshots) {
        const { data } = await supabase.storage
          .from('trade-screenshots')
          .createSignedUrl(s.storage_path, 3600)
        if (data?.signedUrl) result[s.id] = data.signedUrl
      }
      setUrls(result)
    }
    fetchUrls()
  }, [screenshots])

  const TYPES = ['before', 'entry', 'exit'] as const
  const typeLabel: Record<string, string> = { before: 'Before Trade', entry: 'Entry', exit: 'Exit' }

  const byType = Object.fromEntries(
    TYPES.map(t => [t, screenshots.find(s => s.type === t)])
  )

  const hasAny = screenshots.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
    >
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4 text-[hsl(var(--primary))]" />
        Screenshots
      </h2>
      {hasAny ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TYPES.map(type => {
            const shot = byType[type]
            const imgUrl = shot ? urls[shot.id] : undefined
            return (
              <div key={type}>
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                  {typeLabel[type]}
                </p>
                {shot && imgUrl ? (
                  <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={imgUrl}
                      alt={`${type} screenshot`}
                      className="w-full aspect-video object-cover rounded-lg border border-[hsl(var(--border))] hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                  </a>
                ) : shot && !imgUrl ? (
                  <div className="w-full aspect-video rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center justify-center">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Loading…</span>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-lg border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">No image</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No screenshots added.</p>
      )}
    </motion.div>
  )
}

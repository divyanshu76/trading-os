'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, ShieldAlert, Save } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const riskSchema = z.object({
  default_risk_percent: z.number().min(0).max(100),
  max_daily_loss_percent: z.number().min(0).max(100),
  max_weekly_loss_percent: z.number().min(0).max(100),
  max_monthly_loss_percent: z.number().min(0).max(100),
  max_drawdown_percent: z.number().min(0).max(100),
  max_trades_per_day: z.number().min(1),
  max_consecutive_losses: z.number().min(1),
})

type RiskForm = z.infer<typeof riskSchema>

export function RiskRulesClient({ riskSettings }: { riskSettings: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RiskForm>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      default_risk_percent: riskSettings?.default_risk_percent || 1.0,
      max_daily_loss_percent: riskSettings?.max_daily_loss_percent || 5.0,
      max_weekly_loss_percent: riskSettings?.max_weekly_loss_percent || 10.0,
      max_monthly_loss_percent: riskSettings?.max_monthly_loss_percent || 20.0,
      max_drawdown_percent: riskSettings?.max_drawdown_percent || 25.0,
      max_trades_per_day: riskSettings?.max_trades_per_day || 5,
      max_consecutive_losses: riskSettings?.max_consecutive_losses || 3,
    }
  })

  async function onSubmit(data: RiskForm) {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (riskSettings?.id) {
      const { error } = await (supabase.from('risk_settings') as any).update(data).eq('id', riskSettings.id)
      if (error) toast.error(error.message)
      else toast.success('Risk rules updated')
    } else {
      const { error } = await supabase.from('risk_settings').insert({ ...data, user_id: user.id } as any)
      if (error) toast.error(error.message)
      else toast.success('Risk rules saved')
    }
    
    setSaving(false)
    router.refresh()
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-[hsl(var(--border))] bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings" className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Risk Rules
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Configure absolute risk boundaries to protect your capital.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Default Risk Per Trade (%)</label>
              <input type="number" step="0.1" {...register('default_risk_percent', { valueAsNumber: true })} className={inputClass} />
              {errors.default_risk_percent && <p className="text-red-500 text-xs mt-1">{errors.default_risk_percent.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Max Daily Loss (%)</label>
              <input type="number" step="0.1" {...register('max_daily_loss_percent', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Weekly Loss (%)</label>
              <input type="number" step="0.1" {...register('max_weekly_loss_percent', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Monthly Loss (%)</label>
              <input type="number" step="0.1" {...register('max_monthly_loss_percent', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Drawdown (%)</label>
              <input type="number" step="0.1" {...register('max_drawdown_percent', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Trades Per Day</label>
              <input type="number" {...register('max_trades_per_day', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Consecutive Losses</label>
              <input type="number" {...register('max_consecutive_losses', { valueAsNumber: true })} className={inputClass} />
            </div>
          </div>

          <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-[10px] bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:bg-[hsl(var(--primary)/0.9)] transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Risk Rules'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

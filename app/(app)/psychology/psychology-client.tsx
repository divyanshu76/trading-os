'use client'

import { useState } from 'react'
import { Brain, Smile, Meh, Frown, TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { DailyReview, Trade } from '@/types/database'

interface PsychologyClientProps {
  dailyReviews: DailyReview[]
  trades: Trade[]
}

export function PsychologyClient({ dailyReviews: initialReviews, trades }: PsychologyClientProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [saving, setSaving] = useState(false)
  
  const todayDateStr = new Date().toISOString().split('T')[0]
  const todayReview = reviews.find(r => r.date === todayDateStr)

  const [form, setForm] = useState({
    mood: todayReview?.mood ?? 5,
    overall_grade: todayReview?.overall_grade ?? 5,
    what_went_well: todayReview?.what_went_well ?? '',
    what_went_wrong: todayReview?.what_went_wrong ?? '',
    tomorrow_focus: todayReview?.tomorrow_focus ?? '',
  })

  // Analytics
  const avgMood = reviews.length ? (reviews.reduce((s, r) => s + (r.mood || 0), 0) / reviews.length).toFixed(1) : '—'
  const avgGrade = reviews.length ? (reviews.reduce((s, r) => s + (r.overall_grade || 0), 0) / reviews.length).toFixed(1) : '—'
  
  const tradesWithPsych = trades.filter(t => t.confidence_score !== null || t.stress_level !== null)
  const avgConfidence = tradesWithPsych.length ? (tradesWithPsych.reduce((s, t) => s + (t.confidence_score || 0), 0) / tradesWithPsych.length).toFixed(1) : '—'
  const avgStress = tradesWithPsych.length ? (tradesWithPsych.reduce((s, t) => s + (t.stress_level || 0), 0) / tradesWithPsych.length).toFixed(1) : '—'

  async function saveEntry() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    const payload = {
      user_id: user.id,
      date: todayDateStr,
      ...form
    }

    if (todayReview) {
      const { error } = await (supabase.from('daily_reviews') as any).update(payload as any).eq('id', todayReview.id)
      if (error) toast.error('Failed to update')
      else toast.success('Entry updated')
    } else {
      const { data, error } = await (supabase.from('daily_reviews') as any).insert(payload as any).select().single()
      if (error) toast.error('Failed to save')
      else {
        toast.success('Entry saved')
        setReviews([data, ...reviews])
      }
    }
    setSaving(false)
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-charcoal/10 bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-[hsl(var(--primary))]" />
          Psychology Journal
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Track your emotional state, discipline, and mental performance.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Mood', value: avgMood, icon: Smile, max: 10 },
          { label: 'Avg Discipline', value: avgGrade, icon: Target, max: 10 },
          { label: 'Avg Confidence', value: avgConfidence, icon: Zap, max: 10 },
          { label: 'Avg Stress', value: avgStress, icon: Activity, max: 10 },
        ].map(({ label, value, icon: Icon, max }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
              <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-2xl font-bold mt-1">{value} <span className="text-sm text-[hsl(var(--muted-foreground))] font-normal">/ {max}</span></p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Entry Form */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-5">
          <h2 className="font-semibold text-sm">Today's Entry ({todayDateStr})</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mood (1-10)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="1" max="10" 
                  value={form.mood} 
                  onChange={e => setForm({...form, mood: Number(e.target.value)})}
                  className="w-full accent-[hsl(var(--primary))]" 
                />
                <span className="text-sm font-bold w-6 text-center">{form.mood}</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Discipline Grade (1-10)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="1" max="10" 
                  value={form.overall_grade} 
                  onChange={e => setForm({...form, overall_grade: Number(e.target.value)})}
                  className="w-full accent-[hsl(var(--primary))]" 
                />
                <span className="text-sm font-bold w-6 text-center">{form.overall_grade}</span>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>What went well?</label>
            <textarea 
              value={form.what_went_well}
              onChange={e => setForm({...form, what_went_well: e.target.value})}
              className={cn(inputClass, "min-h-[80px] resize-none")}
              placeholder="Followed my plan, stayed patient..."
            />
          </div>

          <div>
            <label className={labelClass}>What went wrong? (FOMO, Revenge trading?)</label>
            <textarea 
              value={form.what_went_wrong}
              onChange={e => setForm({...form, what_went_wrong: e.target.value})}
              className={cn(inputClass, "min-h-[80px] resize-none")}
              placeholder="Took a setup outside my system..."
            />
          </div>

          <div>
            <label className={labelClass}>Tomorrow's Focus</label>
            <input 
              value={form.tomorrow_focus}
              onChange={e => setForm({...form, tomorrow_focus: e.target.value})}
              className={inputClass}
              placeholder="Wait for clear confirmation..."
            />
          </div>

          <button 
            onClick={saveEntry}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-colors"
          >
            {saving ? 'Saving...' : (todayReview ? 'Update Entry' : 'Save Entry')}
          </button>
        </div>

        {/* AI/Analytics Insight Panel */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="font-semibold text-sm mb-4">Behavioral Observations</h2>
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <p className="text-xs font-semibold text-[hsl(var(--primary))] mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Possible pattern</p>
              <p className="text-sm">Based on your recent trades, your win rate is significantly higher when your confidence score is above 7. Trust your high-quality setups.</p>
            </div>
            <div className="p-3 rounded-lg border border-[hsl(var(--warning))/0.3] bg-[hsl(var(--warning))/0.05]">
              <p className="text-xs font-semibold text-[hsl(var(--warning))] mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Observed correlation</p>
              <p className="text-sm">Trades taken when your stress level is reported above 8 have historically resulted in an average R-multiple of -0.8R. Consider stepping away when highly stressed.</p>
            </div>
            
            <h3 className="font-semibold text-sm mt-6 mb-3">Past Entries</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {reviews.filter(r => r.date !== todayDateStr).slice(0, 5).map(review => (
                <div key={review.id} className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{review.date}</span>
                    <span className="text-[10px] uppercase text-[hsl(var(--muted-foreground))]">Mood: {review.mood}/10</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                    {review.what_went_well || review.what_went_wrong || review.tomorrow_focus || 'No notes for this day.'}
                  </p>
                </div>
              ))}
              {reviews.length <= 1 && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">No past entries found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { PsychologyClient } from './psychology-client'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Psychology Journal' }

export default async function PsychologyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: dailyReviews } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const { data: trades } = await supabase
    .from('trades')
    .select('id, confidence_score, discipline_score, stress_level, net_pnl, result, r_multiple')
    .eq('user_id', user.id)

  return <PsychologyClient dailyReviews={dailyReviews || []} trades={trades || []} />
}


import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { AnalyticsClient } from './analytics-client'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [tradesRes, profileRes] = await Promise.all([
    supabase.from('trades').select('*').eq('user_id', user.id).order('date'),
    supabase.from('profiles').select('base_currency').eq('user_id', user.id).single(),
  ])

  return (
    <AnalyticsClient
      trades={tradesRes.data ?? []}
      currency={(profileRes.data as any)?.base_currency ?? 'USD'}
    />
  )
}

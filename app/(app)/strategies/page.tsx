import { createClient } from '@/lib/supabase/server'
import { StrategiesClient } from './strategies-client'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Strategies' }

export default async function StrategiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: strategies } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: trades } = await supabase
    .from('trades')
    .select('id, strategy_id, net_pnl, result')
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('base_currency')
    .eq('user_id', user.id)
    .single()

  const currency = (profile as any)?.base_currency || 'USD'

  return <StrategiesClient initialStrategies={strategies || []} trades={trades || []} currency={currency} />
}


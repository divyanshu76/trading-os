import { createClient } from '@/lib/supabase/server'
import { EquityClient } from './equity-client'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Equity Curve' }

export default async function EquityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .in('result', ['win', 'loss', 'breakeven'])

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, current_balance, initial_balance')
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('base_currency')
    .eq('user_id', user.id)
    .single()

  const currency = (profile as any)?.base_currency || 'USD'

  return <EquityClient trades={trades || []} currency={currency} accounts={accounts || []} />
}


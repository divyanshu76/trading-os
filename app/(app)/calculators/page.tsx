import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalculatorsClient } from './calculators-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Position Size Calculator' }

export default async function CalculatorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const [{ data: accounts }, { data: instruments }, { data: riskSettings }, { data: trades }] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
    supabase.from('instruments').select('*').or(`user_id.eq.${user.id},user_id.is.null`),
    supabase.from('risk_settings').select('*').eq('user_id', user.id).single(),
    supabase.from('trades').select('account_id, net_pnl').eq('user_id', user.id).neq('result', 'open')
  ])

  // Calculate authoritative balances
  const accountsWithAuthBalance = ((accounts as any[]) ?? []).map(acc => {
    const accountTrades = ((trades as any[]) ?? []).filter(t => t.account_id === acc.id)
    const realizedPnl = accountTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
    return {
      ...acc,
      current_balance: acc.initial_balance + realizedPnl
    }
  })

  return <CalculatorsClient 
    accounts={accountsWithAuthBalance} 
    instruments={instruments || []} 
    riskSettings={riskSettings}
  />
}

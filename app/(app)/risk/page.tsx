import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { RiskManagerClient } from './risk-manager-client'

export const metadata: Metadata = { title: 'Risk Manager' }

export default async function RiskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [riskSettingsRes, todayTradesRes, accountsRes, profileRes, allTradesRes] = await Promise.all([
    supabase.from('risk_settings').select('*').eq('user_id', user.id),
    supabase.from('trades').select('net_pnl,risk_amount,risk_percent,result,entry_time')
      .eq('user_id', user.id)
      .eq('date', today)
      .neq('result', 'open'),
    supabase.from('accounts').select('id,name,currency,initial_balance,current_balance').eq('user_id', user.id).eq('is_active', true),
    supabase.from('profiles').select('base_currency').eq('user_id', user.id).single(),
    supabase.from('trades').select('account_id, net_pnl').eq('user_id', user.id).neq('result', 'open'),
  ])

  // Calculate authoritative balances
  const accountsWithAuthBalance = ((accountsRes.data as any[]) ?? []).map(acc => {
    const accountTrades = ((allTradesRes.data as any[]) ?? []).filter(t => t.account_id === acc.id)
    const realizedPnl = accountTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
    return {
      ...acc,
      current_balance: acc.initial_balance + realizedPnl
    }
  })

  return (
    <RiskManagerClient
      riskSettings={riskSettingsRes.data ?? []}
      todayTrades={todayTradesRes.data ?? []}
      accounts={accountsWithAuthBalance}
      currency={(profileRes.data as any)?.base_currency ?? 'USD'}
    />
  )
}

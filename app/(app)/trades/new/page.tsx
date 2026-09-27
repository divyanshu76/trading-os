import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { AddTradeForm } from './add-trade-form'

export const metadata: Metadata = { title: 'Add Trade' }

export default async function NewTradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [accountsRes, strategiesRes, instrumentsRes, checklistRes, profileRes, tradesRes] = await Promise.all([
    supabase.from('accounts').select('id,name,currency,initial_balance,current_balance').eq('user_id', user.id).eq('is_active', true),
    supabase.from('strategies').select('id,name').eq('user_id', user.id).eq('is_active', true),
    supabase.from('instruments').select('*').or(`user_id.eq.${user.id},user_id.is.null`).order('symbol'),
    supabase.from('trade_checklist_items').select('*').eq('user_id', user.id).eq('is_active', true).order('order_index'),
    supabase.from('profiles').select('base_currency,timezone').eq('user_id', user.id).single(),
    supabase.from('trades').select('account_id, net_pnl').eq('user_id', user.id).neq('result', 'open'),
  ])

  // Calculate authoritative balances
  const accountsWithAuthBalance = ((accountsRes.data as any[]) ?? []).map(acc => {
    const accountTrades = ((tradesRes.data as any[]) ?? []).filter(t => t.account_id === acc.id)
    const realizedPnl = accountTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
    return {
      ...acc,
      current_balance: acc.initial_balance + realizedPnl
    }
  })

  return (
    <AddTradeForm
      accounts={accountsWithAuthBalance}
      strategies={strategiesRes.data ?? []}
      instruments={instrumentsRes.data ?? []}
      checklistItems={checklistRes.data ?? []}
      currency={(profileRes.data as any)?.base_currency ?? 'USD'}
    />
  )
}

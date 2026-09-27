import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { AccountsClient } from './accounts-client'

export const metadata: Metadata = { title: 'Accounts' }

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: accounts }, { data: profileRes }, { data: trades }] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('profiles').select('base_currency').eq('user_id', user.id).single(),
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

  return <AccountsClient accounts={accountsWithAuthBalance} currency={(profileRes as any)?.base_currency ?? 'USD'} />
}

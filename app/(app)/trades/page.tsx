import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { TradesClient } from './trades-client'

export const metadata: Metadata = { title: 'Trade Journal' }

export default async function TradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [tradesRes, accountsRes, strategiesRes, profileRes] = await Promise.all([
    supabase
      .from('trades')
      .select(`
        *,
        strategy:strategies(id,name,color)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('entry_time', { ascending: false }),
    supabase.from('accounts').select('id,name,currency,color').eq('user_id', user.id).eq('is_active', true),
    supabase.from('strategies').select('id,name,color').eq('user_id', user.id).eq('is_active', true),
    supabase.from('profiles').select('base_currency').eq('user_id', user.id).single(),
  ])

  return (
    <Suspense fallback={<TradesSkeleton />}>
      <TradesClient
        initialTrades={tradesRes.data ?? []}
        accounts={accountsRes.data ?? []}
        strategies={strategiesRes.data ?? []}
        currency={(profileRes.data as any)?.base_currency ?? 'USD'}
      />
    </Suspense>
  )
}

function TradesSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-10 w-64 bg-[hsl(var(--card))] rounded-lg" />
      <div className="h-96 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]" />
    </div>
  )
}

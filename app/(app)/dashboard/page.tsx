import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { DashboardClient } from './dashboard-client'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch trades, account, profile
  const [tradesRes, accountsRes, profileRes] = await Promise.all([
    supabase
      .from('trades')
      .select('id,date,entry_time,exit_time,symbol,direction,lot_size,net_pnl,gross_pnl,r_multiple,result,risk_amount,risk_percent,commission,swap,strategy_id,session,holding_duration_minutes,is_demo,account_id')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(500),
    supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true),
    supabase
      .from('profiles')
      .select('base_currency,timezone')
      .eq('user_id', user.id)
      .single(),
  ])

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        trades={tradesRes.data ?? []}
        accounts={accountsRes.data ?? []}
        currency={(profileRes.data as any)?.base_currency ?? 'USD'}
      />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]" />
    </div>
  )
}

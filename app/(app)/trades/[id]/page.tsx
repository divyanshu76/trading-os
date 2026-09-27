import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TradeDetailClient } from './trade-detail-client'

export const metadata: Metadata = { title: 'Trade Detail' }

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trade, error } = await supabase
    .from('trades')
    .select(`
      *,
      account:accounts(id,name,currency),
      strategy:strategies(id,name,color)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !trade) notFound()

  const { data: screenshots } = await supabase
    .from('trade_screenshots')
    .select('*')
    .eq('trade_id', id)
    .order('order_index')

  const profileRes = await supabase.from('profiles').select('base_currency').eq('user_id', user.id).single()
  const currency = (profileRes.data as any)?.base_currency ?? 'USD'

  return (
    <TradeDetailClient
      trade={trade}
      screenshots={screenshots ?? []}
      currency={currency}
    />
  )
}

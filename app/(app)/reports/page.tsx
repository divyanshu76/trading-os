import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from './reports-client'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('base_currency')
    .eq('user_id', user.id)
    .single()

  const currency = (profile as any)?.base_currency || 'USD'

  return <ReportsClient trades={trades || []} currency={currency} />
}


import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { PropFirmsClient } from './prop-firms-client'

export const metadata: Metadata = { title: 'Prop Firms' }

export default async function PropFirmsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: propAccounts } = await supabase
    .from('prop_accounts')
    .select(`*, prop_firm:prop_firms(id,name,website)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: propFirms } = await supabase
    .from('prop_firms')
    .select('*')
    .eq('user_id', user.id)

  const profileRes = await supabase.from('profiles').select('base_currency').eq('user_id', user.id).single()

  return (
    <PropFirmsClient
      propAccounts={propAccounts ?? []}
      propFirms={propFirms ?? []}
      currency={(profileRes.data as any)?.base_currency ?? 'USD'}
    />
  )
}

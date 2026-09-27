import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InstrumentsClient } from './instruments-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Instrument Settings' }

export default async function InstrumentsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: instruments } = await supabase.from('instruments').select('*').or(`user_id.eq.${user.id},user_id.is.null`).order('symbol')

  return <InstrumentsClient initialInstruments={instruments || []} />
}

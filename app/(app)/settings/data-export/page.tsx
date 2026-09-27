import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DataExportClient } from './data-export-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Data Export' }

export default async function DataExportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: trades } = await supabase.from('trades').select('*, account:accounts(name)').eq('user_id', user.id).order('open_time', { ascending: false })

  return <DataExportClient trades={trades || []} />
}

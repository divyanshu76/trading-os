import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChecklistClient } from './checklist-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Checklist Settings' }

export default async function ChecklistSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: items } = await supabase.from('trade_checklist_items').select('*').eq('user_id', user.id).order('order_index')

  return <ChecklistClient initialItems={items || []} />
}

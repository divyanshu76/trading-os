import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsClient } from './notifications-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notification Settings' }

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  return <NotificationsClient />
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RiskRulesClient } from './risk-rules-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Risk Rules Settings' }

export default async function RiskRulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: riskSettings } = await supabase.from('risk_settings').select('*').eq('user_id', user.id).single()

  return <RiskRulesClient riskSettings={riskSettings} />
}

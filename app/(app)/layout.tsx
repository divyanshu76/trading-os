import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { TopNav } from '@/components/layout/top-nav'
import { AppInitializer } from '@/components/layout/app-initializer'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load profile and accounts server-side for initial state
  const [{ data: profile }, { data: accounts }, { data: trades }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true).order('is_default', { ascending: false }),
    supabase.from('trades').select('account_id, net_pnl').eq('user_id', user.id).neq('result', 'open'),
  ])

  // Calculate authoritative balances
  const accountsWithAuthBalance = ((accounts as any[]) ?? []).map(acc => {
    const accountTrades = ((trades as any[]) ?? []).filter(t => t.account_id === acc.id)
    const realizedPnl = accountTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
    return {
      ...acc,
      current_balance: acc.initial_balance + realizedPnl
    }
  })

  return (
    <AppInitializer profile={profile} accounts={accountsWithAuthBalance}>
      <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNav />
          <main
            className="flex-1 overflow-y-auto scrollbar-thin"
            id="main-content"
            role="main"
          >
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppInitializer>
  )
}

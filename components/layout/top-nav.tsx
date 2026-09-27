'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, Search, Plus, ChevronDown, LogOut, User, Settings,
  Sun, Moon, Monitor, Zap
} from 'lucide-react'
import { useTheme } from '@teispace/next-themes'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/app-store'
import { cn, formatCurrency } from '@/lib/utils'
import type { Account } from '@/types/database'

export function TopNav() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { selectedAccountId, setSelectedAccountId, accounts, profile, unreadNotifications } = useAppStore()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const selectedAccount = accounts.find(a => a.id === selectedAccountId)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const themeIcons = {
    dark: Moon,
    light: Sun,
    system: Monitor,
  }
  const ThemeIcon = themeIcons[(theme ?? 'dark') as keyof typeof themeIcons] ?? Moon

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/10 bg-card flex-shrink-0">
      {/* Left: Account Switcher */}
      <div className="relative">
        <button
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold bg-charcoal/5 hover:bg-charcoal/10 transition-colors border border-border/5"
          aria-label="Select account"
          aria-haspopup="true"
          aria-expanded={accountMenuOpen}
        >
          <span className="text-foreground">
            {selectedAccountId ? (selectedAccount?.name ?? 'Account') : 'All Accounts'}
          </span>
          {selectedAccount && (
            <span className="text-grey tabular-nums">
              {formatCurrency(selectedAccount.current_balance, selectedAccount.currency)}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-grey" />
        </button>

        {accountMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border/10 bg-offwhite shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-1.5 animate-fade-in">
            <button
              onClick={() => { setSelectedAccountId(null); setAccountMenuOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-charcoal/5 transition-colors',
                !selectedAccountId ? 'text-charcoal font-bold' : 'text-slate font-medium'
              )}
            >
              <Zap className={cn("w-4 h-4", !selectedAccountId ? "text-charcoal" : "text-grey")} />
              All Accounts
            </button>
            {accounts.length > 0 && (
              <div className="my-1 border-t border-[hsl(var(--border))]" />
            )}
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => { setSelectedAccountId(acc.id); setAccountMenuOpen(false) }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-charcoal/5 transition-colors',
                  selectedAccountId === acc.id ? 'text-charcoal font-bold' : 'text-slate font-medium'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: acc.color ?? '#6366f1' }}
                  />
                  <span>{acc.name}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                    {acc.type}
                  </span>
                </div>
                <span className="tabular-nums text-xs text-[hsl(var(--muted-foreground))]">
                  {formatCurrency(acc.current_balance, acc.currency)}
                </span>
              </button>
            ))}
            <div className="my-1 border-t border-[hsl(var(--border))]" />
            <Link
              href="/accounts"
              onClick={() => setAccountMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-grey hover:text-charcoal hover:bg-charcoal/5 transition-colors font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              Manage Accounts
            </Link>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Add Trade */}
        <Link
          href="/trades/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold bg-charcoal text-offwhite hover:bg-slate transition-colors shadow-sm"
          id="quick-add-trade-btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Trade</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-lg text-grey hover:text-charcoal hover:bg-charcoal/5 transition-colors border border-transparent hover:border-border/5"
          aria-label="Toggle theme"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <Link
          href="/settings"
          className="relative p-2.5 rounded-lg text-grey hover:text-charcoal hover:bg-charcoal/5 transition-colors border border-transparent hover:border-border/5"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate shadow-[0_0_8px_rgba(87,112,122,0.5)]" />
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-charcoal/5 border border-border/5 flex items-center justify-center">
              <User className="w-4 h-4 text-charcoal" />
            </div>
            <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
              {profile?.full_name ?? profile?.username ?? 'Trader'}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/10 bg-offwhite shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-1.5 animate-fade-in">
              <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
                <p className="text-sm font-medium">{profile?.full_name ?? 'Trader'}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{profile?.base_currency} · {profile?.timezone?.split('/')[1]}</p>
              </div>
              <Link
                href="/settings/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate hover:text-charcoal hover:bg-charcoal/5 transition-colors font-medium"
              >
                <User className="w-4 h-4 text-grey" />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate hover:text-charcoal hover:bg-charcoal/5 transition-colors font-medium"
              >
                <Settings className="w-4 h-4 text-grey" />
                Settings
              </Link>
              <div className="my-1 border-t border-[hsl(var(--border))]" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-loss hover:bg-loss/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

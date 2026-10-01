'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, Search, Plus, ChevronDown, LogOut, User, Settings, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/app-store'
import { cn, formatCurrency } from '@/lib/utils'
import type { Account } from '@/types/database'
import { MobileNav } from './mobile-nav'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function TopNav() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { selectedAccountId, setSelectedAccountId, accounts, profile, unreadNotifications } = useAppStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const selectedAccount = accounts.find(a => a.id === selectedAccountId)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }



  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[rgba(56,99,130,0.12)] bg-white/45 backdrop-blur-2xl flex-shrink-0 relative z-40">
      {/* Left: Account Switcher & Mobile Nav */}
      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        <MobileNav />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold glass hover:bg-white/80 transition-all border border-[rgba(56,99,130,0.14)] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#386382] min-w-0"
            >
              <span className="text-[#182A3A] truncate max-w-[100px] sm:max-w-none">
                {selectedAccountId ? (selectedAccount?.name ?? 'Account') : 'All Accounts'}
              </span>
              {selectedAccount && (
                <span className="text-[#4D5B70] tabular-nums">
                  {formatCurrency(selectedAccount.current_balance, selectedAccount.currency)}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[#4D5B70]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={8}
              collisionPadding={16}
              className="z-50 w-64 rounded-xl glass-dropdown py-1.5 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            >
              <DropdownMenu.Item
                onSelect={() => setSelectedAccountId(null)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm outline-none cursor-default transition-colors focus:bg-[hsl(var(--muted))] focus:text-[hsl(var(--foreground))]',
                  !selectedAccountId ? 'text-[hsl(var(--foreground))] font-bold' : 'text-[hsl(var(--muted-foreground))] font-medium'
                )}
              >
                <Zap className={cn("w-4 h-4", !selectedAccountId ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]/70")} />
                All Accounts
              </DropdownMenu.Item>
              
              {accounts.length > 0 && (
                <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))/0.3]" />
              )}
              
              {accounts.map(acc => (
                <DropdownMenu.Item
                  key={acc.id}
                  onSelect={() => setSelectedAccountId(acc.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-2 text-sm outline-none cursor-default transition-colors focus:bg-[hsl(var(--muted))] focus:text-[hsl(var(--foreground))]',
                    selectedAccountId === acc.id ? 'text-[hsl(var(--foreground))] font-bold' : 'text-[hsl(var(--muted-foreground))] font-medium'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shadow-sm"
                      style={{ backgroundColor: acc.color ?? '#6366f1' }}
                    />
                    <span>{acc.name}</span>
                    <span className="text-xs opacity-70 capitalize hidden sm:inline-block">
                      {acc.type}
                    </span>
                  </div>
                  <span className="tabular-nums text-xs opacity-80">
                    {formatCurrency(acc.current_balance, acc.currency)}
                  </span>
                </DropdownMenu.Item>
              ))}
              
              <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))/0.3]" />
              
              <DropdownMenu.Item asChild>
                <Link
                  href="/accounts"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] focus:text-[hsl(var(--foreground))] focus:bg-[hsl(var(--muted))] outline-none cursor-default transition-colors font-medium"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage Accounts
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Quick Add Trade */}
        <Link
          href="/trades/new"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[13px] font-bold bg-[#386382] text-white hover:bg-[#2B4E68] transition-all shadow-sm hover:shadow-md hover:-translate-y-[1px] flex-shrink-0"
          id="quick-add-trade-btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Trade</span>
        </Link>


        {/* Notifications */}
        <Link
          href="/settings"
          className="relative p-2.5 rounded-xl glass text-[#4D5B70] hover:text-[#182A3A] hover:bg-white/80 transition-all border border-[rgba(56,99,130,0.14)] shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#386382]" />
          )}
        </Link>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl glass-elevated hover:bg-white/90 transition-all outline-none border border-[rgba(56,99,130,0.16)] shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(56,99,130,0.08)] border border-[rgba(56,99,130,0.12)] flex items-center justify-center">
                <User className="w-4 h-4 text-[#386382]" />
              </div>
              <span className="hidden md:block text-sm font-semibold max-w-[120px] truncate text-[#182A3A]">
                {profile?.full_name ?? profile?.username ?? 'Trader'}
              </span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              collisionPadding={16}
              className="z-50 w-56 rounded-xl glass-dropdown py-1.5 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            >
              <div className="px-3 py-2 border-b border-[hsl(var(--border))/0.3]">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{profile?.full_name ?? 'Trader'}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{profile?.base_currency} · {profile?.timezone?.split('/')[1]}</p>
              </div>
              
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] focus:text-[hsl(var(--foreground))] focus:bg-[hsl(var(--muted))] outline-none cursor-default transition-colors font-medium mt-1"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenu.Item>
              
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] focus:text-[hsl(var(--foreground))] focus:bg-[hsl(var(--muted))] outline-none cursor-default transition-colors font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))/0.3]" />
              
              <DropdownMenu.Item
                onSelect={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[hsl(var(--danger))] focus:bg-[hsl(var(--danger))/0.1] outline-none cursor-default transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
  Brain,
  Building2,
  Wallet,
  Shield,
  Calculator,
  StickyNote,
  Upload,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/analytics',   label: 'Analytics',     icon: BarChart3 },
  { href: '/trades',      label: 'Trade Journal',  icon: BookOpen },
  { href: '/calendar',    label: 'Calendar',      icon: Calendar },
  { href: '/equity',      label: 'Equity',        icon: TrendingUp },
  { href: '/strategies',  label: 'Strategies',    icon: Target },
  { href: '/psychology',  label: 'Psychology',    icon: Brain },
  { href: '/prop-firms',  label: 'Prop Firms',    icon: Building2 },
  { href: '/accounts',    label: 'Accounts',      icon: Wallet },
  { href: '/risk',        label: 'Risk Manager',  icon: Shield },
  { href: '/calculators', label: 'Calculators',   icon: Calculator },
  { href: '/notes',       label: 'Notes',         icon: StickyNote },
  { href: '/import',      label: 'Import',        icon: Upload },
  { href: '/reports',     label: 'Reports',       icon: FileText },
  { href: '/settings',    label: 'Settings',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-charcoal border-r border-charcoal overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-offwhite/10">
        <div className="flex-shrink-0 w-8 h-8 rounded-[10px] bg-slate flex items-center justify-center">
          <Activity className="w-4 h-4 text-offwhite" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-bold tracking-tight text-offwhite whitespace-nowrap">
                TRADING OS
              </span>
              <p className="text-[10px] text-grey whitespace-nowrap">
                Journal. Analyze. Improve.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-semibold transition-all duration-150 group relative',
                    isActive
                      ? 'bg-slate/15 text-offwhite'
                      : 'text-grey hover:text-offwhite hover:bg-white/5'
                  )}
                  title={sidebarCollapsed ? label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-slate"
                    />
                  )}
                  <Icon
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      sidebarCollapsed ? 'w-5 h-5 mx-auto' : 'w-[18px] h-[18px]',
                      isActive ? 'text-slate' : 'text-current'
                    )}
                  />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-offwhite/10">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] text-[13px] font-semibold text-grey hover:text-offwhite hover:bg-white/5 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}

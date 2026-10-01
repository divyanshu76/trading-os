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

export const NAV_ITEMS = [
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
      className="hidden md:flex relative flex-col h-full bg-white/45 backdrop-blur-2xl border-r border-[rgba(56,99,130,0.12)] overflow-hidden flex-shrink-0 z-20 shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[rgba(56,99,130,0.10)]">
        <div className="flex-shrink-0 w-8 h-8 rounded-[10px] bg-[#386382] flex items-center justify-center shadow-sm">
          <Activity className="w-4 h-4 text-white" />
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
              <span className="text-sm font-bold tracking-tight text-[#182A3A] whitespace-nowrap">
                TRADING OS
              </span>
              <p className="text-[10px] text-[#4D5B70] whitespace-nowrap">
                Journal. Analyze. Improve.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-none">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 group relative',
                    isActive
                      ? 'bg-[rgba(56,99,130,0.10)] text-[#386382] font-bold shadow-sm'
                      : 'text-[#4D5B70] hover:text-[#182A3A] hover:bg-[rgba(56,99,130,0.05)]'
                  )}
                  title={sidebarCollapsed ? label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#386382]"
                    />
                  )}
                  <Icon
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      sidebarCollapsed ? 'w-5 h-5 mx-auto' : 'w-[18px] h-[18px]',
                      isActive ? 'text-[#386382]' : 'text-[#4D5B70] group-hover:text-[#182A3A]'
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

      {/* Social / Footer */}
      <div className="p-3 border-t border-[rgba(56,99,130,0.10)]">
        <div className="flex flex-col items-center gap-2 mb-2">
          {!sidebarCollapsed && (
            <div className="text-[10px] font-bold text-[#4D5B70] uppercase tracking-widest text-center w-full">
              DEADCODE LABS
            </div>
          )}
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#4D5B70] hover:text-[#182A3A] transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#4D5B70] hover:text-[#182A3A] transition-colors" aria-label="GitHub">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-[#4D5B70] hover:text-[#182A3A] hover:bg-[rgba(56,99,130,0.05)] transition-colors"
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

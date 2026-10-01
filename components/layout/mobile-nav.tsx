'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './sidebar'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="md:hidden flex-shrink-0 flex items-center">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 flex-shrink-0 -ml-2 mr-1 rounded-lg text-[#182A3A] hover:bg-[rgba(56,99,130,0.05)] transition-colors relative z-50"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 flex-shrink-0" />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[hsl(var(--primary))]/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white/90 backdrop-blur-2xl shadow-xl flex flex-col overflow-hidden border-r border-[rgba(56,99,130,0.14)]"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-[rgba(56,99,130,0.10)] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-[10px] bg-[#386382] flex items-center justify-center shadow-sm">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold tracking-tight text-[#182A3A] whitespace-nowrap block">
                      TRADING OS
                    </span>
                    <span className="text-[10px] text-[#4D5B70] whitespace-nowrap block">
                      Journal. Analyze. Improve.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-[#4D5B70] hover:text-[#182A3A] hover:bg-[rgba(56,99,130,0.05)] transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-none">
                <ul className="space-y-1">
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/')
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-colors',
                            isActive
                              ? 'bg-[rgba(56,99,130,0.10)] text-[#386382] font-bold'
                              : 'text-[#4D5B70] hover:text-[#182A3A] hover:bg-[rgba(56,99,130,0.05)]'
                          )}
                        >
                          <Icon
                            className={cn(
                              'flex-shrink-0 w-5 h-5 transition-colors',
                              isActive ? 'text-[#386382]' : 'text-[#4D5B70]'
                            )}
                          />
                          {label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="p-4 border-t border-[rgba(56,99,130,0.10)] mt-auto flex-shrink-0">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-[11px] font-bold text-[#4D5B70] uppercase tracking-widest text-center w-full">
                    DEADCODE LABS
                  </div>
                  <div className="flex items-center gap-5">
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#4D5B70] hover:text-[#182A3A] transition-colors" aria-label="Instagram">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#4D5B70] hover:text-[#182A3A] transition-colors" aria-label="GitHub">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function AuthFormPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname.includes('/login')
  
  return (
    <div className="w-full md:h-full flex flex-col justify-center items-center p-[16px_16px_32px] md:p-[24px_32px] lg:py-[20px] lg:px-[48px] xl:py-[24px] xl:px-[56px] relative z-10">
      <div className="w-full max-w-[420px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: isLogin ? 15 : -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isLogin ? -15 : 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

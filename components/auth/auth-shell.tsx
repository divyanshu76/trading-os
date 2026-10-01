'use client'

import { motion } from 'framer-motion'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full md:h-full flex-1 max-w-[1180px] glass-elevated rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden flex flex-col lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] shadow-[0_30px_90px_-20px_rgba(37,49,58,0.15)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.4)]"
    >
      {children}
    </motion.div>
  )
}

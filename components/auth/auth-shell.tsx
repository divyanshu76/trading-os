'use client'

import { motion } from 'framer-motion'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full h-full min-h-0 flex-1 max-w-[1180px] bg-[hsl(var(--card))] rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden shadow-[0_30px_90px_rgba(23,27,32,0.12)] border border-[rgba(23,27,32,0.06)] flex flex-col lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
    >
      {children}
    </motion.div>
  )
}

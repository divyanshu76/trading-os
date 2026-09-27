'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import { CurvedDivider } from './curved-divider'

function VisualChart({ isLogin }: { isLogin: boolean }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-20">
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <motion.g 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.15 }} 
          transition={{ duration: 1 }}
          stroke="hsl(var(--foreground))" 
          strokeWidth="1"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="800" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 80} x2="800" y2={i * 80} />
          ))}
        </motion.g>

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={isLogin ? "M 0 600 C 200 500 300 550 500 400 S 700 300 800 200" : "M 0 500 C 200 600 400 400 600 450 S 700 200 800 100"}
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          fill="none"
        />

        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 2 }}
          d={isLogin ? "M 0 600 C 200 500 300 550 500 400 S 700 300 800 200 L 800 800 L 0 800 Z" : "M 0 500 C 200 600 400 400 600 450 S 700 200 800 100 L 800 800 L 0 800 Z"}
          fill="hsl(var(--foreground))"
        />
        
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5, duration: 1 }}>
           <rect x="250" y="450" width="12" height="60" fill="hsl(var(--foreground))" rx="2" />
           <line x1="256" y1="420" x2="256" y2="530" stroke="hsl(var(--foreground))" strokeWidth="2" />
           
           <rect x="350" y="420" width="12" height="40" fill="hsl(var(--muted-foreground))" rx="2" />
           <line x1="356" y1="400" x2="356" y2="480" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />

           <rect x="450" y="350" width="12" height="70" fill="hsl(var(--foreground))" rx="2" />
           <line x1="456" y1="320" x2="456" y2="440" stroke="hsl(var(--foreground))" strokeWidth="2" />
        </motion.g>
      </svg>
    </div>
  )
}

export function AuthVisualPanel() {
  const pathname = usePathname()
  const isLogin = pathname.includes('/login')

  return (
    <div className="relative w-full h-[clamp(80px,12dvh,120px)] min-h-[80px] lg:h-full lg:min-h-0 bg-[#ECE9E4] flex flex-col justify-between shrink-0 overflow-hidden lg:overflow-visible">
      <CurvedDivider />

      <div className="relative z-10 p-3 sm:p-5 lg:p-10 xl:p-14 flex flex-col h-full justify-center lg:justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] bg-[hsl(var(--foreground))] flex items-center justify-center shadow-lg">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--card))]" />
          </div>
          <span className="text-[14px] sm:text-[15px] font-extrabold text-[hsl(var(--foreground))] tracking-tight">Trading OS</span>
        </div>

        {/* Messaging */}
        <div className="mt-8 lg:mt-auto lg:mb-auto relative">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-[420px]"
              >
                <h1 className="text-[18px] sm:text-[22px] lg:text-[38px] xl:text-[42px] font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-[1.1] [@media(max-height:740px)]:hidden lg:[@media(max-height:740px)]:block">
                  Your trading data.<br />One Trading OS.
                </h1>
                <p className="hidden lg:block mt-5 text-[15px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Turn every position into structured data, every session into a lesson, and every lesson into a better process.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-[420px]"
              >
                <h1 className="text-[18px] sm:text-[22px] lg:text-[38px] xl:text-[42px] font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-[1.1] [@media(max-height:740px)]:hidden lg:[@media(max-height:740px)]:block">
                  Build your trading record.
                </h1>
                <p className="hidden lg:block mt-5 text-[15px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Capture the setup. Review the execution. Refine the process.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom indicator */}
        <div className="hidden lg:flex items-center gap-4 mt-12 text-[11px] font-bold tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
          <span>Manual Journal</span>
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))/0.3]"></span>
          <span>Analyze</span>
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))/0.3]"></span>
          <span>Refine</span>
        </div>
      </div>

      <VisualChart isLogin={isLogin} />
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { InstagramIcon as Instagram, GithubIcon as Github } from '@/components/shared/social-icons'

interface PublicAttributionProps {
  /** Whether to animate entrance — disable on SSR-sensitive pages */
  animate?: boolean
  className?: string
}

export function PublicAttribution({ animate = true, className = '' }: PublicAttributionProps) {
  const content = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <a
        href="https://deadcode.space/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit DEADCODE LABS website"
        className="text-[11px] font-bold tracking-widest text-slate/50 hover:text-slate/80 transition-colors uppercase"
      >
        DEADCODE LABS
      </a>
      <div className="flex items-center gap-3">
        <a
          href="https://www.instagram.com/truly_divyanshu/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram – @truly_divyanshu"
          title="@truly_divyanshu on Instagram"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[hsl(var(--border)/0.15)] text-slate/40 hover:text-slate/70 hover:border-[hsl(var(--border)/0.3)] transition-all text-[12px] font-semibold"
        >
          <Instagram className="w-3.5 h-3.5" />
          Instagram
        </a>
        <a
          href="https://github.com/divyanshu76"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub – divyanshu76"
          title="divyanshu76 on GitHub"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[hsl(var(--border)/0.15)] text-slate/40 hover:text-slate/70 hover:border-[hsl(var(--border)/0.3)] transition-all text-[12px] font-semibold"
        >
          <Github className="w-3.5 h-3.5" />
          GitHub
        </a>
      </div>
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="flex flex-col items-center"
    >
      {content}
    </motion.div>
  )
}

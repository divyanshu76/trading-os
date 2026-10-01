'use client'

import { useEffect, useState } from 'react'

export function AuthPageBackground() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Grid overlay */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
      >
        <g stroke="hsl(var(--foreground))" strokeWidth="0.8">
          {[144,288,432,576,720,864,1008,1152,1296].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" />
          ))}
          {[90,180,270,360,450,540,630,720,810].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y} />
          ))}
        </g>
      </svg>

      {/* Animated Organic Blobs */}
      {mounted && (
        <div className="absolute inset-0 opacity-40 dark:opacity-20 motion-reduce:hidden mix-blend-multiply dark:mix-blend-screen">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--accent))] blur-[100px] animate-[blob_18s_ease-in-out_infinite] opacity-50"></div>
          <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--primary))] blur-[120px] animate-[blob_14s_ease-in-out_infinite_2s] opacity-40"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-[100%] bg-[hsl(var(--secondary))] blur-[120px] animate-[blob_20s_ease-in-out_infinite_4s] opacity-60"></div>
        </div>
      )}

      {/* Fallback for reduced motion or SSR */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--card))_0%,transparent_60%)] opacity-80 z-[-1] motion-reduce:block"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary))_0%,transparent_60%)] opacity-60 z-[-1] motion-reduce:block"></div>
    </div>
  )
}

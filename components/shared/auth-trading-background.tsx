'use client'

/**
 * AuthTradingBackground
 * Shared decorative SVG trading-chart background for /login and /signup.
 * - Pure SVG, no raster images
 * - Abstract shapes only - no fake $ amounts or percentages
 * - Very low opacity - the auth card is always the dominant element
 * - Simplified at mobile viewport widths
 */
export function AuthTradingBackground() {
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
      {/* Soft radial depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--card))_0%,transparent_60%)] opacity-80 z-[-1]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary))_0%,transparent_60%)] opacity-60 z-[-1]"></div>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        className="auth-chart-svg"
      >
        {/* Subtle grid */}
        <g opacity="0.08" stroke="hsl(var(--foreground))" strokeWidth="0.6">
          {[144,288,432,576,720,864,1008,1152,1296].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" />
          ))}
          {[90,180,270,360,450,540,630,720,810].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y} />
          ))}
        </g>

        {/* Equity curve fill */}
        <path
          d="M 0 620 C 120 580 200 530 320 540 S 500 475 600 445 S 760 400 880 368 S 1060 315 1180 282 S 1360 232 1440 212 L 1440 900 L 0 900 Z"
          fill="hsl(var(--foreground))"
          opacity="0.02"
        />
        {/* Equity curve line */}
        <path
          d="M 0 620 C 120 580 200 530 320 540 S 500 475 600 445 S 760 400 880 368 S 1060 315 1180 282 S 1360 232 1440 212"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1.2"
          opacity="0.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Candle group A - left section */}
        {(
          [
            [210, 580, 548, 532, 596, true],
            [256, 548, 568, 538, 580, false],
            [302, 568, 534, 522, 574, true],
            [348, 534, 514, 506, 548, true],
            [394, 514, 530, 510, 544, false],
          ] as [number,number,number,number,number,boolean][]
        ).map(([x, open, close, high, low, bull], i) => {
          const bodyTop = Math.min(open, close)
          const bodyH = Math.max(Math.abs(open - close), 2)
          const color = bull ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
          return (
            <g key={`ca-${i}`} opacity="0.12">
              <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="1" />
              <rect x={x - 7} y={bodyTop} width="14" height={bodyH} fill={color} rx="1.5" />
            </g>
          )
        })}

        {/* Candle group B - mid section */}
        {(
          [
            [820, 390, 360, 350, 402, true],
            [866, 360, 380, 354, 392, false],
            [912, 380, 348, 340, 386, true],
            [958, 348, 330, 322, 356, true],
            [1004, 330, 346, 324, 354, false],
          ] as [number,number,number,number,number,boolean][]
        ).map(([x, open, close, high, low, bull], i) => {
          const bodyTop = Math.min(open, close)
          const bodyH = Math.max(Math.abs(open - close), 2)
          const color = bull ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
          return (
            <g key={`cb-${i}`} opacity="0.12">
              <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="1" />
              <rect x={x - 7} y={bodyTop} width="14" height={bodyH} fill={color} rx="1.5" />
            </g>
          )
        })}

        {/* Candle group C - right section */}
        {(
          [
            [1208, 296, 266, 256, 308, true],
            [1254, 266, 283, 260, 295, false],
            [1300, 283, 250, 240, 289, true],
            [1346, 250, 230, 222, 258, true],
            [1392, 230, 247, 224, 256, false],
          ] as [number,number,number,number,number,boolean][]
        ).map(([x, open, close, high, low, bull], i) => {
          const bodyTop = Math.min(open, close)
          const bodyH = Math.max(Math.abs(open - close), 2)
          const color = bull ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
          return (
            <g key={`cc-${i}`} opacity="0.12">
              <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="1" />
              <rect x={x - 7} y={bodyTop} width="14" height={bodyH} fill={color} rx="1.5" />
            </g>
          )
        })}

        {/* Price-level dashes */}
        <g opacity="0.05" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeDasharray="5 8">
          <line x1="100" y1="495" x2="560" y2="495" />
          <line x1="660" y1="380" x2="1100" y2="380" />
          <line x1="1140" y1="262" x2="1440" y2="262" />
        </g>

        {/* Data dots along curve */}
        <g fill="hsl(var(--muted-foreground))" opacity="0.20">
          {[[0,620],[320,540],[600,445],[880,368],[1180,282],[1440,212]].map(([cx,cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.5" />
          ))}
        </g>
      </svg>

      <style>{`
        @media (max-width: 767px) {
          .auth-chart-svg { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-chart-svg { opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}
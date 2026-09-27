'use client'

export function AuthPageBackground() {
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--card))_0%,transparent_60%)] opacity-80 z-[-1]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary))_0%,transparent_60%)] opacity-60 z-[-1]"></div>
      
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <g opacity="0.05" stroke="hsl(var(--foreground))" strokeWidth="0.6">
          {[144,288,432,576,720,864,1008,1152,1296].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" />
          ))}
          {[90,180,270,360,450,540,630,720,810].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y} />
          ))}
        </g>
      </svg>
    </div>
  )
}

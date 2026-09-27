export function CurvedDivider() {
  return (
    <>
      {/* Desktop Vertical Curve (eats into the right side of the visual panel) */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[60px] xl:w-[80px] z-20 pointer-events-none">
        <svg viewBox="0 0 100 800" preserveAspectRatio="none" className="w-full h-full text-[hsl(var(--card))]">
          <path d="M100,0 C30,250 70,550 0,800 L100,800 Z" fill="currentColor" />
        </svg>
      </div>
      
      {/* Mobile Horizontal Curve (eats into the bottom of the visual panel) */}
      <div className="block lg:hidden absolute bottom-0 left-0 right-0 h-[30px] sm:h-[40px] z-20 pointer-events-none">
        <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="w-full h-full text-[hsl(var(--card))]">
          <path d="M0,100 C250,30 550,70 800,0 L800,100 Z" fill="currentColor" />
        </svg>
      </div>
    </>
  )
}

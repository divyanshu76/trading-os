import { AuthShell } from '@/components/auth/auth-shell'
import { AuthVisualPanel } from '@/components/auth/auth-visual-panel'
import { PublicAttribution } from '@/components/shared/public-attribution'
import { AuthPageBackground } from '@/components/auth/auth-page-background'
import { AuthFormPanel } from '@/components/auth/auth-form-panel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[100dvh] w-full bg-[hsl(var(--background))] overflow-hidden flex flex-col items-center p-[8px_8px_12px] md:p-[16px_24px_20px] lg:p-[20px_24px_16px]">
      <AuthPageBackground />
      
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
      <AuthShell>
        {/* Left Side Visual Panel */}
        <AuthVisualPanel />
        
        {/* Right Side Form Panel */}
        <AuthFormPanel>
          {children}
        </AuthFormPanel>
      </AuthShell>

      </div>

      <div className="mt-2 sm:mt-4 relative z-10 w-full max-w-[1180px] flex justify-center shrink-0 h-[40px] sm:h-[48px] items-center">
        <PublicAttribution animate={false} />
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Trading OS — Journal. Analyze. Improve.',
    template: '%s | Trading OS',
  },
  description:
    'Professional trading journal, analytics, risk management, and prop firm tracker for serious traders.',
  keywords: ['trading journal', 'forex journal', 'trading analytics', 'risk management', 'prop firm tracker'],
  openGraph: {
    title: 'Trading OS',
    description: 'Journal. Analyze. Improve.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="ocean-atmosphere">
            <div className="ocean-grid" />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}

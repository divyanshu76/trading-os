'use client'

import { ThemeProvider } from '@teispace/next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark"]}
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(222 14% 9%)',
            border: '1px solid hsl(220 14% 14%)',
            color: 'hsl(220 9% 96%)',
          },
        }}
      />
    </ThemeProvider>
  )
}

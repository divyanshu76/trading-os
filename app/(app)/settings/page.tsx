import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Settings' }
export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">Configure your profile, preferences, and risk rules.</p>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {[
          { title: 'Profile', href: '/settings/profile', description: 'Name, timezone, base currency.' },
          { title: 'Risk Rules', href: '/settings/risk-rules', description: 'Configure daily/weekly loss limits. See Risk Manager.' },
          { title: 'Checklist', href: '/settings/checklist', description: 'Manage your pre-trade checklist items.' },
          { title: 'Instruments', href: '/settings/instruments', description: 'Add custom instruments with tick size/value specs.' },
          { title: 'Notifications', href: '/settings/notifications', description: 'Email and in-app notification preferences.' },
          { title: 'Data Export', href: '/settings/data-export', description: 'Export all your trade data as CSV or JSON.' },
        ].map(({ title, href, description }) => (
          <Link href={href} key={title} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors block">
            <h2 className="font-semibold text-sm text-charcoal">{title}</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

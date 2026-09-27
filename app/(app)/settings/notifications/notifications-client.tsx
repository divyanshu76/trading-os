'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Bell, Save, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function NotificationsClient() {
  const [inApp, setInApp] = useState(true)
  const [email, setEmail] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('trading_os_notifications')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setInApp(parsed.inApp)
        setEmail(parsed.email)
      } catch (e) {}
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500))
    
    localStorage.setItem('trading_os_notifications', JSON.stringify({ inApp, email }))
    setSaving(false)
    
    toast.success('Preference saved')
    
    if (email) {
      toast.info('Email delivery is not currently configured in the backend infrastructure.', { duration: 5000 })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings" className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-[hsl(var(--primary))]" />
            Notifications
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage alerts for risk limits and prop firm targets.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6">
        
        {!email && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Email infrastructure not connected</p>
              <p className="mt-1 opacity-90">You can save your preference here, but actual email delivery requires backend mailer configuration.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">In-App Notifications</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Show toast alerts within the application interface.</p>
            </div>
            <input 
              type="checkbox" 
              checked={inApp}
              onChange={e => setInApp(e.target.checked)}
              className="w-4 h-4 rounded text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Email Notifications</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Receive daily summaries and critical risk alerts via email.</p>
            </div>
            <input 
              type="checkbox" 
              checked={email}
              onChange={e => setEmail(e.target.checked)}
              className="w-4 h-4 rounded text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-[10px] bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:bg-[hsl(var(--primary)/0.9)] transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}

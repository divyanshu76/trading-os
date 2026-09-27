'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'
import type { Profile, Account } from '@/types/database'

interface AppInitializerProps {
  profile: Profile | null
  accounts: Account[]
  children: React.ReactNode
}

/**
 * Hydrates the Zustand store with server-loaded data.
 * This avoids duplicate API calls and prevents flash of empty state.
 */
export function AppInitializer({ profile, accounts, children }: AppInitializerProps) {
  const { setProfile, setAccounts } = useAppStore()

  useEffect(() => {
    setProfile(profile)
    setAccounts(accounts)
  }, [profile, accounts, setProfile, setAccounts])

  return <>{children}</>
}

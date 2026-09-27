import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account, Profile } from '@/types/database'

interface AppState {
  // User
  profile: Profile | null
  setProfile: (profile: Profile | null) => void

  // Account selection
  selectedAccountId: string | null  // null = all accounts
  setSelectedAccountId: (id: string | null) => void
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void

  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // Global date range filter
  dateRange: { from: string | null; to: string | null }
  setDateRange: (range: { from: string | null; to: string | null }) => void

  // Demo mode
  isDemoMode: boolean
  setDemoMode: (demo: boolean) => void

  // Notifications count
  unreadNotifications: number
  setUnreadNotifications: (count: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),

      selectedAccountId: null,
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
      accounts: [],
      setAccounts: (accounts) => set({ accounts }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      dateRange: { from: null, to: null },
      setDateRange: (range) => set({ dateRange: range }),

      isDemoMode: false,
      setDemoMode: (demo) => set({ isDemoMode: demo }),

      unreadNotifications: 0,
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
    }),
    {
      name: 'trading-os-app',
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
        sidebarCollapsed: state.sidebarCollapsed,
        dateRange: state.dateRange,
      }),
    }
  )
)

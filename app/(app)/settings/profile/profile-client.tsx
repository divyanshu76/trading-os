'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, User, Save } from 'lucide-react'
import Link from 'next/link'
import { Controller } from 'react-hook-form'
import { PremiumSelect } from '@/components/shared/premium-select'
import { SearchableSelect } from '@/components/shared/searchable-select'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES } from '@/lib/utils'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  base_currency: z.string().min(1),
  timezone: z.string().min(1),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfileClient({ profile }: { profile: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { register, control, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      base_currency: profile?.base_currency || 'USD',
      timezone: profile?.timezone || 'UTC',
    }
  })

  async function onSubmit(data: ProfileForm) {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase.from('profiles') as any).update(data).eq('user_id', user.id)
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated')
      router.refresh()
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-[10px] border border-[hsl(var(--border))] bg-[#FFFFFF] text-[#191D23] text-[14px] font-medium placeholder:text-[#979DAB] focus:outline-none focus:border-[#57707A] focus:ring-[3px] focus:ring-[#57707A]/10 transition-all shadow-sm'
  const labelClass = 'block text-[13px] font-bold text-charcoal mb-1.5'

  // Standard valid IANA timezones list
  const timezones = Intl.supportedValuesOf('timeZone')

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings" className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-[hsl(var(--primary))]" />
            Profile Settings
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage your identity and regional preferences.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className={labelClass}>Full Name</label>
            <input {...register('full_name')} className={inputClass} placeholder="John Doe" />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Base Currency</label>
            <Controller
              control={control}
              name="base_currency"
              render={({ field }) => (
                <PremiumSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CURRENCIES.map(c => ({ label: c, value: c }))}
                />
              )}
            />
          </div>

          <div>
            <label className={labelClass}>Timezone</label>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={timezones.map(tz => ({ label: tz, value: tz }))}
                  placeholder="Select timezone..."
                  searchPlaceholder="Search timezones..."
                />
              )}
            />
          </div>

          <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-[10px] bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:bg-[hsl(var(--primary)/0.9)] transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

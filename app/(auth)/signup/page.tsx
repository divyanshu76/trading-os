'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupForm) {
    setLoading(true)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      toast.error('Supabase is not connected yet.', {
        description: 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.',
        duration: 8000,
      })
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email may already exist.')
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Unable to connect to Supabase. Check your internet connection and try again.')
        } else if (error.message.toLowerCase().includes('password')) {
          toast.error('Please choose a stronger password.')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      if (authData.user && !authData.session) {
        toast.success('Check your email', {
          description: 'Your account has been created. Please verify your email before signing in.',
          duration: 10000,
        })
        setLoading(false)
        router.push('/login')
        return
      }

      toast.success('Account created! Redirecting...')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error('An unexpected error occurred.')
      setLoading(false)
    }
  }

  const inputBase = "w-full px-3 sm:px-4 h-[clamp(40px,6dvh,48px)] rounded-[8px] sm:rounded-[12px] bg-[hsl(var(--input))] text-[13px] sm:text-[15px] font-medium text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/60 border border-[rgba(23,27,32,0.10)] focus:outline-none focus:ring-4 focus:ring-[#65757C]/10 focus:border-[#65757C] hover:border-[rgba(23,27,32,0.16)] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
  const inputError = "border-red-300 focus:ring-red-500/20 focus:border-red-400 bg-red-50/40"

  return (
    <>
      <div className="mb-[clamp(8px,2dvh,16px)]">
        <h2 className="text-[clamp(20px,4dvh,28px)] font-extrabold text-[hsl(var(--foreground))] tracking-tight leading-[1.1]">Create your account</h2>
        <p className="mt-[clamp(2px,0.5dvh,6px)] text-[13px] sm:text-[15px] font-medium text-[hsl(var(--muted-foreground))]">
          Start journaling your trades in minutes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[clamp(6px,1.5dvh,12px)]" noValidate>
        <div>
          <label htmlFor="signup-name" className="block text-[11px] sm:text-[13px] font-bold text-[hsl(var(--foreground))] mb-[clamp(2px,0.5dvh,6px)]">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            {...register('fullName')}
            className={cn(inputBase, errors.fullName && inputError)}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-[12px] font-semibold text-loss">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-[11px] sm:text-[13px] font-bold text-[hsl(var(--foreground))] mb-[clamp(2px,0.5dvh,6px)]">
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="trader@example.com"
            {...register('email')}
            className={cn(inputBase, errors.email && inputError)}
          />
          {errors.email && (
            <p className="mt-1.5 text-[12px] font-semibold text-loss">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-[11px] sm:text-[13px] font-bold text-[hsl(var(--foreground))] mb-[clamp(2px,0.5dvh,6px)]">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register('password')}
              className={cn(inputBase, "pr-12", errors.password && inputError)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[12px] font-semibold text-loss">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-confirm" className="block text-[11px] sm:text-[13px] font-bold text-[hsl(var(--foreground))] mb-[clamp(2px,0.5dvh,6px)]">
            Confirm Password
          </label>
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat password"
            {...register('confirmPassword')}
            className={cn(inputBase, errors.confirmPassword && inputError)}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-[12px] font-semibold text-loss">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          id="signup-submit-btn"
          className="w-full mt-[clamp(4px,1dvh,6px)] h-[clamp(44px,7dvh,52px)] rounded-[8px] sm:rounded-[12px] bg-[hsl(var(--foreground))] text-[hsl(var(--card))] text-[13px] sm:text-[15px] font-bold hover:bg-[#20262B] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-60 disabled:hover:bg-[hsl(var(--foreground))] disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(23,27,32,0.2)] group"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </form>

      <div className="mt-[clamp(6px,1.5dvh,16px)] pt-[clamp(6px,1.5dvh,16px)] border-t border-[rgba(23,27,32,0.06)] text-center">
        <p className="text-[12px] sm:text-[14px] font-medium text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
          <Link href="/login" className="text-[hsl(var(--foreground))] font-bold hover:text-[hsl(var(--muted-foreground))] transition-colors inline-flex items-center gap-1 group">
            Sign in
            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </div>
    </>
  )
}
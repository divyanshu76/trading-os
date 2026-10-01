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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>



export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
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
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email or password is incorrect.')
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Unable to connect to Supabase. Check your internet connection and try again.')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-[clamp(8px,2dvh,16px)]">
        <h2 className="text-[clamp(20px,4dvh,28px)] font-extrabold text-[hsl(var(--foreground))] tracking-tight leading-[1.1]">Welcome back</h2>
        <p className="mt-[clamp(2px,0.5dvh,6px)] text-[13px] sm:text-[15px] font-medium text-[hsl(var(--muted-foreground))]">
          Sign in to your Trading OS account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[clamp(6px,1.5dvh,12px)]" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-[11px] sm:text-[13px] font-bold text-[hsl(var(--foreground))] mb-[clamp(2px,0.5dvh,6px)]">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="trader@example.com"
            {...register('email')}
            className={cn(
              "w-full px-3 sm:px-4 h-[clamp(40px,6dvh,48px)] rounded-[8px] sm:rounded-[12px] bg-[hsl(var(--input))] text-[13px] sm:text-[15px] font-medium text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/60 border border-[hsl(var(--border))/0.2] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] hover:border-[hsl(var(--border))/0.4] transition-all shadow-sm",
              errors.email && "border-[hsl(var(--loss))] focus:ring-[hsl(var(--loss))] focus:border-[hsl(var(--loss))] bg-[hsl(var(--loss))]/5"
            )}
          />
          {errors.email && (
            <p className="mt-1.5 text-[12px] font-semibold text-[hsl(var(--loss))]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-[clamp(2px,0.5dvh,6px)] gap-2">
            <label htmlFor="login-password" className="text-[11px] sm:text-[13px] font-bold text-[hsl(var(--foreground))] shrink-0">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] sm:text-[13px] font-semibold text-[hsl(var(--muted-foreground))]/80 hover:text-[hsl(var(--foreground))] transition-colors whitespace-nowrap"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="..."
              {...register('password')}
              className={cn(
              "w-full px-3 sm:px-4 h-[clamp(40px,6dvh,48px)] pr-12 rounded-[8px] sm:rounded-[12px] bg-[hsl(var(--input))] text-[13px] sm:text-[15px] font-medium text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/60 border border-[hsl(var(--border))/0.2] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] hover:border-[hsl(var(--border))/0.4] transition-all shadow-sm",
                errors.password && "border-[hsl(var(--loss))] focus:ring-[hsl(var(--loss))] focus:border-[hsl(var(--loss))] bg-[hsl(var(--loss))]/5"
              )}
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
            <p className="mt-1.5 text-[12px] font-semibold text-[hsl(var(--loss))]">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          id="login-submit-btn"
          className="w-full mt-[clamp(4px,1dvh,6px)] h-[clamp(44px,7dvh,52px)] rounded-[8px] sm:rounded-[12px] bg-[hsl(var(--primary))] text-white text-[13px] sm:text-[15px] font-bold hover:bg-[hsl(var(--primary-strong))] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-60 disabled:hover:bg-[hsl(var(--primary))] disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(23,27,32,0.2)] group"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </form>

      <div className="mt-[clamp(6px,1.5dvh,16px)] pt-[clamp(6px,1.5dvh,16px)] border-t border-[rgba(23,27,32,0.06)] text-center">
        <p className="text-[12px] sm:text-[14px] font-medium text-[hsl(var(--muted-foreground))]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[hsl(var(--foreground))] font-bold hover:text-[hsl(var(--primary))] transition-colors inline-flex items-center gap-1 group">
            Create one free
            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </div>
    </>
  )
}
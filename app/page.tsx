'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { ArrowRight, BarChart3, Shield, Target, Activity, CheckCircle2, ChevronRight, LayoutDashboard, LineChart, Brain, RefreshCw, BookOpen } from 'lucide-react'
import { InstagramIcon as Instagram, GithubIcon as Github } from '@/components/shared/social-icons'
import { PublicAttribution } from '@/components/shared/public-attribution'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Animations
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Floating Pill Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[1200px] z-50 border border-[rgba(25,29,35,0.08)] bg-[rgba(255,255,255,0.78)] backdrop-blur-[18px] rounded-[22px] shadow-[0_8px_32px_rgba(25,29,35,0.04)]"
      >
        <div className="px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-charcoal flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-offwhite" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-charcoal">Trading OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[14px] font-bold text-slate">
            <Link href="#features" className="hover:text-charcoal transition-colors">Features</Link>
            <Link href="#analytics" className="hover:text-charcoal transition-colors">Analytics</Link>
            <Link href="#propfirms" className="hover:text-charcoal transition-colors">Prop Firms</Link>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-[14px] font-bold text-charcoal hover:text-slate transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-[14px] font-bold bg-[#191D23] text-[#DEDCDC] px-4 py-2.5 rounded-[12px] hover:bg-[#57707A] transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
          {/* Subtle Grain Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
          
          {/* Subtle Radial Gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-mauve/20 via-steel/20 to-offwhite/0 opacity-60 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-xl">
              <h1 className="text-[42px] md:text-[56px] lg:text-[72px] font-extrabold tracking-tight leading-[0.95] mb-6">
                <motion.div variants={fadeUp} className="text-charcoal">Journal.</motion.div>
                <motion.div variants={fadeUp} className="text-charcoal">Analyze.</motion.div>
                <motion.div variants={fadeUp} className="bg-gradient-to-r from-slate to-steel bg-clip-text text-transparent">Improve.</motion.div>
              </h1>
              
              <motion.p variants={fadeUp} className="text-[16px] md:text-[18px] text-grey font-medium mb-10 max-w-md leading-relaxed">
                The professional trading journal built for serious retail traders. Track performance, manage prop firm accounts, and master your risk.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  href="/signup" 
                  className="w-full sm:w-auto px-8 py-4 bg-charcoal text-offwhite rounded-[12px] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-slate transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start for free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto px-8 py-4 border border-grey/50 text-charcoal rounded-[12px] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-mauve/10 transition-colors"
                >
                  Log in to dashboard
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Realistic Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[24px] border border-charcoal/10 bg-card shadow-[0_12px_40px_rgba(25,29,35,0.08)] overflow-hidden aspect-[4/3] flex flex-col">
                {/* Mockup Header */}
                <div className="h-12 border-b border-border/10 bg-background/50 flex items-center px-4 justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-charcoal/20" />
                    <div className="w-3 h-3 rounded-full bg-charcoal/20" />
                    <div className="w-3 h-3 rounded-full bg-charcoal/20" />
                  </div>
                  <div className="w-32 h-4 rounded bg-border/10" />
                </div>
                {/* Mockup Body */}
                <div className="flex-1 p-6 grid grid-cols-3 gap-4 bg-background">
                  <div className="col-span-full h-10 w-48 bg-charcoal/5 rounded-lg mb-2" />
                  
                  {/* KPI Cards */}
                  <div className="bg-card border border-border/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div className="text-[10px] font-semibold text-grey">NET P&L</div>
                    <div className="text-xl font-bold text-profit tabular-nums">+₹12,480</div>
                  </div>
                  <div className="bg-card border border-border/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div className="text-[10px] font-semibold text-grey">WIN RATE</div>
                    <div className="text-xl font-bold text-charcoal tabular-nums">54.2%</div>
                  </div>
                  <div className="bg-card border border-border/10 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div className="text-[10px] font-semibold text-grey">PROFIT FACTOR</div>
                    <div className="text-xl font-bold text-charcoal tabular-nums">1.84</div>
                  </div>

                  {/* Chart */}
                  <div className="col-span-full h-32 bg-gradient-to-t from-slate/5 to-transparent border border-border/10 rounded-xl relative mt-2 overflow-hidden">
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,100 L0,80 C20,70 40,90 60,50 C80,10 90,40 100,20 L100,100 Z" fill="hsl(var(--primary)/0.1)" />
                        <path d="M0,80 C20,70 40,90 60,50 C80,10 90,40 100,20" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                     </svg>
                  </div>
                  
                  {/* Mini Table */}
                  <div className="col-span-full mt-2 space-y-2">
                    <div className="h-8 bg-charcoal/5 rounded border border-border/10" />
                    <div className="h-8 bg-charcoal/5 rounded border border-border/10" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Floating Element */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 -bottom-8 bg-card border border-border/10 p-4 rounded-[16px] shadow-[0_12px_40px_rgba(25,29,35,0.08)] backdrop-blur-md"
              >
                <div className="text-xs font-bold text-grey mb-1">EXPECTANCY</div>
                <div className="text-lg font-extrabold text-charcoal">+1.2 R</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-card border-y border-border/5">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-20"
            >
              <h2 className="text-[36px] md:text-[48px] font-bold tracking-tight text-charcoal leading-tight mb-4">
                Everything you need<br />to trade with clarity.
              </h2>
              <p className="text-[16px] text-grey font-medium leading-relaxed">
                Journal every decision. Understand every pattern. Build consistency through data.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  icon: LineChart, 
                  title: 'Deep Analytics', 
                  desc: 'Auto-calculated R-multiples, expectancy, profit factors, and equity curves.',
                },
                { 
                  icon: Target, 
                  title: 'Prop Firm Tracker', 
                  desc: 'Track challenge phases, profit targets, and daily loss limits automatically.',
                },
                { 
                  icon: Shield, 
                  title: 'Risk Manager', 
                  desc: 'Live exposure tracking. Set hard limits for daily losses and consecutive bad trades.',
                },
                { 
                  icon: BookOpen, 
                  title: 'Strategy Journal', 
                  desc: 'Tag setups, sessions, and market conditions to see which strategies actually perform.',
                },
                { 
                  icon: Brain, 
                  title: 'Psychology', 
                  desc: 'Track your emotions and stress levels. Discover how your mood affects your win rate.',
                },
                { 
                  icon: RefreshCw, 
                  title: 'CSV Import', 
                  desc: 'Import your trade history from any broker export. Column mapping, validation, and duplicate protection included.',
                },
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group p-8 rounded-[20px] bg-background border border-border/5 hover:border-slate/30 transition-all shadow-sm hover:shadow-[0_8px_30px_rgba(25,29,35,0.04)]"
                >
                  <div className="w-12 h-12 rounded-[12px] bg-charcoal/5 flex items-center justify-center mb-6 group-hover:bg-slate/10 transition-colors">
                    <feature.icon className="w-5 h-5 text-slate" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-charcoal mb-3">{feature.title}</h3>
                  <p className="text-[14px] text-grey leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Showcase */}
        <section id="analytics" className="py-32 bg-background overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-[36px] md:text-[48px] font-bold tracking-tight text-charcoal leading-tight mb-6">
                  Know exactly<br />what works.
                </h2>
                <p className="text-[16px] text-grey font-medium leading-relaxed mb-8 max-w-md">
                  Stop guessing. Your dashboard automatically calculates your Win Rate, Profit Factor, Expectancy, and Average R-Multiple across every strategy and timeframe.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Filter by custom date ranges', 'Analyze individual strategies', 'Compare asset classes', 'Track drawdown accurately'].map(text => (
                    <li key={text} className="flex items-center gap-3 text-[14px] font-semibold text-charcoal">
                      <CheckCircle2 className="w-5 h-5 text-slate" />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-slate/20 to-transparent blur-[80px] -z-10" />
                <div className="bg-card rounded-[20px] p-6 border border-border/10 shadow-[0_12px_40px_rgba(25,29,35,0.08)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[14px] font-bold text-charcoal">Performance Overview</h3>
                    <div className="px-3 py-1 rounded-full bg-charcoal/5 text-charcoal text-[11px] font-bold">This Month</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border border-border/5 bg-background">
                      <div className="text-[11px] text-grey font-bold mb-1">PROFIT FACTOR</div>
                      <div className="text-[24px] font-extrabold text-charcoal">2.14</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border/5 bg-background">
                      <div className="text-[11px] text-grey font-bold mb-1">WIN RATE</div>
                      <div className="text-[24px] font-extrabold text-charcoal">62.5%</div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-t from-slate/10 to-transparent rounded-xl border border-slate/20 relative overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,20 L80,30 L90,10 L100,5 L100,100 L0,100 Z" fill="hsl(var(--primary)/0.1)" />
                      <path d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,20 L80,30 L90,10 L100,5" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Prop Firm Section */}
        <section id="propfirms" className="py-32 bg-charcoal text-offwhite border-t border-border/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <div className="bg-[#22272F] rounded-[24px] p-8 border border-offwhite/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate/20 blur-[60px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-[12px] bg-slate flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-bold">Phase 1 Challenge</h3>
                      <p className="text-[13px] text-offwhite/60 font-medium">$100,000 Account</p>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <div className="flex justify-between text-[13px] font-bold mb-2">
                        <span className="text-offwhite/60">Profit Target</span>
                        <span className="text-profit">+$3,240 / $8,000</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} whileInView={{ width: '40.5%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-profit rounded-full" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[13px] font-bold mb-2">
                        <span className="text-offwhite/60">Daily Loss Limit</span>
                        <span className="text-offwhite">-$1,240 / -$5,000</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} whileInView={{ width: '24.8%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-slate rounded-full" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2"
              >
                <h2 className="text-[36px] md:text-[48px] font-bold tracking-tight leading-tight mb-6">
                  Built for<br />funded trading.
                </h2>
                <p className="text-[16px] text-offwhite/60 font-medium leading-relaxed mb-8 max-w-md">
                  Keep your challenges organized. Track profit targets, daily loss limits, and max drawdown across all your prop firm accounts in one clean view.
                </p>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-2 text-[15px] font-bold text-slate hover:text-offwhite transition-colors"
                >
                  Start tracking accounts <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 bg-card relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[42px] md:text-[56px] font-extrabold tracking-tight text-charcoal leading-[1.1] mb-6"
            >
              Trade with data.<br />
              <span className="text-slate">Not memory.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[18px] text-grey font-medium mb-10 max-w-xl mx-auto"
            >
              Build a journal that turns every trade into useful information. Gain the clarity you need to reach the next level.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                href="/signup" 
                className="inline-flex px-10 py-5 bg-charcoal text-offwhite rounded-[14px] font-bold text-[16px] items-center justify-center gap-3 hover:bg-slate transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                Start Journaling Now <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Creator Attribution */}
        <section className="py-20 bg-background border-t border-border/5">
          <div className="max-w-4xl mx-auto px-6 flex justify-center">
            <PublicAttribution animate={false} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/10 bg-background py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-charcoal flex items-center justify-center">
              <Activity className="w-3 h-3 text-offwhite" />
            </div>
            <span className="font-bold text-[14px] text-charcoal">TRADING OS</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-[13px] font-semibold text-grey">
            <Link href="#features" className="hover:text-charcoal transition-colors">Features</Link>
            <Link href="#analytics" className="hover:text-charcoal transition-colors">Analytics</Link>
            <Link href="#propfirms" className="hover:text-charcoal transition-colors">Prop Firms</Link>
            <Link href="/login" className="hover:text-charcoal transition-colors">Login</Link>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4 text-grey">
              <a href="https://www.instagram.com/truly_divyanshu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-charcoal transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://github.com/divyanshu76" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-charcoal transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
            <div className="text-[12px] font-medium text-grey/60">
              &copy; {new Date().getFullYear()} Trading OS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STRIPE_LINKS = {
  creatorMonthly: 'https://buy.stripe.com/PLACEHOLDER_creator_monthly',
  proMonthly: 'https://buy.stripe.com/PLACEHOLDER_pro_monthly',
}
const PAYMENT_READY = !STRIPE_LINKS.creatorMonthly.includes('PLACEHOLDER')

interface PricingDict {
  label: string; title: string; highlight: string; suffix: string; subtitle: string
  plans: {
    free: { name: string; desc: string; cta: string }
    creator: { name: string; desc: string; cta: string; badge: string }
    pro: { name: string; desc: string; cta: string }
  }
}

const FEATURES = {
  free: ['3 videos/month','5 output formats','Basic AI model','120 mins transcription','Community support'],
  creator: ['30 videos/month','All 10 output formats','Premium AI model','1,200 mins transcription','Conversational refinement','Priority support','API access'],
  pro: ['Unlimited videos','All formats + custom','Premium AI + custom tone','6,000 mins transcription','Team collaboration','White-label export','Dedicated support','Analytics dashboard'],
}

export function Pricing({ dict }: { dict: PricingDict }) {
  const plans = [
    { ...dict.plans.free, price:'$0',period:'/month',href:'#tool',highlighted:false },
    { ...dict.plans.creator, price:'$19',period:'/month',href:PAYMENT_READY?STRIPE_LINKS.creatorMonthly:'#tool',highlighted:true },
    { ...dict.plans.pro, price:'$39',period:'/month',href:PAYMENT_READY?STRIPE_LINKS.proMonthly:'#tool',highlighted:false },
  ]

  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]"/></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{dict.label}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{dict.title} <span className="g-text">{dict.highlight}</span> {dict.suffix}</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{dict.subtitle}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, idx) => {
            const featKey = idx === 0 ? 'free' : idx === 1 ? 'creator' : 'pro'
            return (
              <div key={plan.name} className={cn('relative rounded-2xl border p-8 flex flex-col transition-all duration-300',plan.highlighted?'border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent shadow-xl shadow-violet-500/10 scale-[1.02]':'border-border/50 bg-card/30 hover:border-violet-500/20')}>
                {plan.highlighted&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white flex items-center gap-1 shadow-lg shadow-violet-500/25"><Sparkles className="h-3 w-3"/>{plan.badge}</div>}
                <div className="mb-6"><h3 className="text-lg font-bold">{plan.name}</h3><p className="text-sm text-muted-foreground mt-1">{plan.desc}</p></div>
                <div className="mb-6"><span className="text-4xl font-bold tracking-tight">{plan.price}</span><span className="text-muted-foreground">{plan.period}</span></div>
                <ul className="space-y-3 mb-8 flex-1">{FEATURES[featKey].map(f=><li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-violet-400 mt-0.5 shrink-0"/><span className="text-muted-foreground">{f}</span></li>)}</ul>
                <a href={plan.href} target={plan.href.startsWith('http')?'_blank':undefined} rel={plan.href.startsWith('http')?'noopener':undefined} className={cn('w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2',plan.highlighted?'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25':'border border-border/50 hover:bg-muted hover:border-violet-500/30')}>{plan.cta}{plan.href.startsWith('http')&&<ArrowRight className="h-4 w-4"/>}</a>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-10"><p className="text-sm text-muted-foreground">Need more? <a href="mailto:hi@ailomo.com" className="text-violet-400 hover:text-violet-300 underline">Contact us</a> for enterprise pricing.</p></div>
      </div>
    </section>
  )
}

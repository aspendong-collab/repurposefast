'use client'
import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dictionary } from '@/lib/dictionary'

async function handleCheckout(plan: string) {
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url, message } = await res.json()
    if (url) window.location.href = url
    else if (message) alert(message)
  } catch {
    alert('Payment coming soon! Email hi@ailomo.com')
  }
}

export function Pricing({ d }: { d: Dictionary }) {
  const plans = [
    { ...d.pricing.plans.free, price:'$0',period:'/month',href:'#tool',highlighted:false },
    { ...d.pricing.plans.creator, price:'$19',period:'/month',href:'#tool',highlighted:true },
    { ...d.pricing.plans.pro, price:'$39',period:'/month',href:'#tool',highlighted:false },
  ]
  return (<section id="pricing" className="py-24 sm:py-32 relative overflow-hidden"><div className="absolute inset-0 -z-10"><div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]"/></div><div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="text-center mb-16"><p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{d.pricing.label}</p><h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{d.pricing.title}<span className="g-text">{d.pricing.highlight}</span> {d.pricing.suffix}</h2><p className="text-muted-foreground mt-4 max-w-xl mx-auto">{d.pricing.subtitle}</p></div><div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">{plans.map((plan)=>(<div key={plan.name} className={cn('relative rounded-2xl border p-8 flex flex-col transition-all duration-300',plan.highlighted?'border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent shadow-xl shadow-violet-500/10 scale-[1.02]':'border-border/50 bg-card/30 hover:border-violet-500/20')}>{plan.highlighted&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white flex items-center gap-1 shadow-lg shadow-violet-500/25"><Sparkles className="h-3 w-3"/>{plan.badge}</div>}<div className="mb-6"><h3 className="text-lg font-bold">{plan.name}</h3><p className="text-sm text-muted-foreground mt-1">{plan.desc}</p></div><div className="mb-6"><span className="text-4xl font-bold tracking-tight">{plan.price}</span><span className="text-muted-foreground">{plan.period}</span></div><ul className="space-y-3 mb-8 flex-1">{(plan.features||[]).map((f:string)=><li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-violet-400 mt-0.5 shrink-0"/><span className="text-muted-foreground">{f}</span></li>)}</ul>{plan.name === 'Free' ? (
      <a href="#tool" className={cn('w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2','border border-border/50 hover:bg-muted hover:border-violet-500/30')}>{plan.cta}</a>
    ) : (
      <button onClick={() => handleCheckout(plan.name === 'Creator' ? 'creator' : 'pro')} className={cn('w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2',plan.highlighted?'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25':'border border-border/50 hover:bg-muted hover:border-violet-500/30')}>{plan.cta}<ArrowRight className="h-4 w-4"/></button>
    )}</div>))}</div><div className="text-center mt-10"><p className="text-sm text-muted-foreground">{d.pricing.enterprise}<a href="mailto:hi@ailomo.com" className="text-violet-400 hover:text-violet-300 underline">{d.pricing.enterpriseLink}</a>{d.pricing.enterpriseSuffix}</p></div></div></section>)
}
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for trying it out',
    features: ['3 videos per month', '5 output formats', 'Basic AI model', 'Community support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Creator',
    price: '$19',
    period: '/month',
    desc: 'For serious content creators',
    features: ['30 videos per month', 'All 10 output formats', 'Premium AI model', 'Conversational refinement', 'Priority support', 'API access'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    desc: 'For teams and agencies',
    features: ['Unlimited videos', 'All formats + custom', 'Premium AI + custom tone', 'Team collaboration', 'White-label export', 'Dedicated support', 'Analytics dashboard'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border p-8 flex flex-col',
                plan.highlighted
                  ? 'border-violet-500/30 bg-violet-500/5 shadow-xl shadow-violet-500/10 scale-[1.02]'
                  : 'border-border/50 bg-card/30',
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

            <a
              href={plan.name === 'Free' ? '#tool' : '#tool'}
              className={cn(
                  'w-full rounded-xl py-3 text-sm font-semibold transition-all',
                  plan.highlighted
                    ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/25'
                    : 'border border-border/50 hover:bg-muted',
                )}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

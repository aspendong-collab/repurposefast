import { ArrowRight, Sparkles } from 'lucide-react'

interface CTADict { title: string; highlight: string; suffix: string; subtitle: string; start: string; pricing: string }

export function CTASection({ dict }: { dict: CTADict }) {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/3 to-transparent"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/8 rounded-full blur-[180px]"/>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 p-10 sm:p-16 glow-v">
          <Sparkles className="h-10 w-10 text-violet-400 mx-auto mb-6"/>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{dict.title} <span className="g-text">{dict.highlight}</span> {dict.suffix}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">{dict.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#tool" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 shadow-xl shadow-violet-500/25 transition-all active:scale-95"><Sparkles className="h-4 w-4"/>{dict.start}<ArrowRight className="h-4 w-4"/></a>
            <a href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/50 px-8 py-3.5 text-sm font-semibold hover:bg-muted/50 transition-all">{dict.pricing}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

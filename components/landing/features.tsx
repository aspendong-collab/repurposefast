import { Sparkles, Globe, Zap, Shield, Download, MessageSquare, Layers, Share2, Wand2 } from 'lucide-react'

interface FeatDict { label: string; title: string; highlight: string; subtitle: string; list: Array<{ title: string; desc: string }> }

const ICONS = [Sparkles, Layers, Globe, Zap, MessageSquare, Download, Share2, Shield, Wand2]

export function Features({ dict }: { dict: FeatDict }) {
  return (
    <section id="features" className="py-32 sm:py-40 s-divider">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400/80 mb-6">{dict.label}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">{dict.title} <span className="g-text">{dict.highlight}</span></h2>
          <p className="text-muted-foreground/60 mt-5 max-w-xl mx-auto text-[15px]">{dict.subtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dict.list.map((f, i) => {
            const Icon = ICONS[i] || Sparkles
            return (
              <div key={f.title} className="group relative rounded-2xl border border-white/[0.04] g-card hover:border-violet-500/15 transition-all duration-300 p-6">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.08] group-hover:bg-violet-500/[0.12] transition-colors"><Icon className="h-5 w-5 text-violet-400/80" /></div>
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground/60 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { Sparkles, Brain, Share2 } from 'lucide-react'

interface HiDict { label: string; title: string; highlight: string }

const HIGHLIGHTS = [
  { icon:Brain, badge:'Intelligence', title:'Not Just Transcription', desc:'Our AI analyzes context, extracts insights, and generates content optimized for each platform\'s audience.', color:'violet' },
  { icon:Share2, badge:'Distribution', title:'One Click, Every Platform', desc:'All 10 formats generated simultaneously. From long-form blogs to social threads — everything ready in seconds.', color:'cyan' },
  { icon:Sparkles, badge:'Refinement', title:'Chat With Your Content', desc:'Every output has a built-in AI chat. "Add more data", "make it punchier" — changes applied instantly.', color:'fuchsia' },
]

export function FeatureHighlights({ dict }: { dict: HiDict }) {
  return (
    <section className="py-32 sm:py-40 s-divider relative">
      <div className="absolute inset-0 -z-10"><div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-cyan-500/[0.02] rounded-full blur-[180px]"/></div>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400/80 mb-6">{dict.label}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">{dict.title} <span className="g-text">{dict.highlight}</span></h2>
        </div>
        <div className="space-y-24">
          {HIGHLIGHTS.map(({icon:Icon,badge,title,desc,color},i)=>(
            <div key={title} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${i%2===1?'lg:flex-row-reverse':''}`}>
              <div className="flex-1 w-full max-w-lg">
                <div className={`relative rounded-3xl border border-violet-500/[0.06] backdrop-blur-sm p-10 aspect-square sm:aspect-video flex items-center justify-center ${color==='violet'?'bg-violet-500/[0.03]':color==='cyan'?'bg-cyan-500/[0.03]':'bg-fuchsia-500/[0.03]'}`}><Icon className={`h-20 w-20 ${color==='violet'?'text-violet-400/30':color==='cyan'?'text-cyan-400/30':'text-fuchsia-400/30'}`}/></div>
              </div>
              <div className="flex-1 max-w-lg">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-violet-500/[0.03] px-3 py-1 text-xs font-medium text-violet-400/80 mb-4">{badge}</span>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">{title}</h3>
                <p className="text-muted-foreground/60 text-[15px] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

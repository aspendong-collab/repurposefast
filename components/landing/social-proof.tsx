import { Star } from 'lucide-react'

interface SocialDict {
  label: string; stats: { users: string; videos: string; rating: string; languages: string }
  testimonials: Array<{ text: string; author: string; role: string }>
}

export function SocialProof({ dict }: { dict: SocialDict }) {
  const stats = [
    { value:'10K+', label:dict.stats.users },{ value:'500K+', label:dict.stats.videos },
    { value:'4.9', label:dict.stats.rating, star:true },{ value:'63+', label:dict.stats.languages },
  ]
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]"/></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{dict.label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map(s=>(
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-1">{s.value}{s.star&&<Star className="h-5 w-5 text-amber-400 fill-amber-400"/>}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dict.testimonials.map(t=>(
            <div key={t.author} className="rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-violet-500/20 transition-all duration-300">
              <div className="flex gap-0.5 mb-3">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400"/>)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">{t.text}</p>
              <div><p className="text-sm font-semibold">{t.author}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

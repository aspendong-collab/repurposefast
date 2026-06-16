import { FileText, Heart, MessageCircle, Linkedin, Mail, Search, Sparkles, GitFork, Subtitles } from 'lucide-react'

interface FmtDict { outputLabel:string;outputTitle:string;outputHighlight:string;outputSubtitle:string;langLabel:string;langTitle:string;langSubtitle:string;more:string }

const FORMATS = [
  {icon:FileText,name:'Blog Post',color:'text-orange-400 bg-orange-500/10'},{icon:FileText,name:'WeChat',color:'text-green-400 bg-green-500/10'},
  {icon:Heart,name:'Xiaohongshu',color:'text-red-400 bg-red-500/10'},{icon:MessageCircle,name:'Twitter',color:'text-sky-400 bg-sky-500/10'},
  {icon:Linkedin,name:'LinkedIn',color:'text-blue-400 bg-blue-500/10'},{icon:Search,name:'SEO Article',color:'text-amber-400 bg-amber-500/10'},
  {icon:Mail,name:'Newsletter',color:'text-cyan-400 bg-cyan-500/10'},{icon:Subtitles,name:'SRT Subtitles',color:'text-gray-400 bg-gray-500/10'},
  {icon:Sparkles,name:'AI Summary',color:'text-purple-400 bg-purple-500/10'},{icon:GitFork,name:'Mind Map',color:'text-teal-400 bg-teal-500/10'},
]
const LANGS = ['English','中文','日本語','한국어','Español','Français','Deutsch','Português','العربية','हिन्दी','Bahasa Indonesia','ไทย','Tiếng Việt','Русский','Italiano','Nederlands','Polski','Türkçe']

export function FormatShowcase({ dict }: { dict: FmtDict }) {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]"/></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{dict.outputLabel}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{dict.outputTitle} <span className="g-text">{dict.outputHighlight}</span></h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{dict.outputSubtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-20">
          {FORMATS.map(f=>{const Icon=f.icon;return(
            <div key={f.name} className="group rounded-xl border border-border/50 bg-card/30 p-4 text-center hover:border-violet-500/20 hover:bg-card/50 transition-all"><div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.color} mb-3`}><Icon className="h-5 w-5"/></div><h4 className="text-sm font-semibold">{f.name}</h4></div>
          )})}
        </div>
        <div className="text-center mb-12">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{dict.langLabel}</p>
          <h3 className="text-2xl sm:text-3xl font-bold">{dict.langTitle}</h3>
          <p className="text-muted-foreground mt-2">{dict.langSubtitle}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {LANGS.map(l=><span key={l} className="rounded-full border border-border/50 px-4 py-2 text-sm text-muted-foreground hover:border-violet-500/30 hover:text-foreground transition-colors cursor-default">{l}</span>)}
          <span className="rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-2 text-sm text-violet-400 font-medium">{dict.more}</span>
        </div>
      </div>
    </section>
  )
}

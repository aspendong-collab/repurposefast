import { Sparkles, Globe, Zap, Shield, Download, MessageSquare, FileText, Layers, Share2, Wand2 } from 'lucide-react'

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Rewriting', desc: 'Not just transcription — our AI understands context and rewrites for each platform\'s unique voice.' },
  { icon: Layers, title: '10 Output Formats', desc: 'Blog posts, Twitter threads, LinkedIn, Xiaohongshu, newsletters, SRT subtitles, SEO articles, more.' },
  { icon: Globe, title: '63+ Languages', desc: 'Transcribe and generate in 63+ languages. Built for international creators.' },
  { icon: Zap, title: 'Streaming Generation', desc: 'Content appears character by character in real-time. No waiting for spinners.' },
  { icon: MessageSquare, title: 'Conversational Refinement', desc: 'Chat with each output to fine-tune it. "Make it shorter" — done.' },
  { icon: Download, title: '6 Export Formats', desc: 'Markdown, TXT, PDF, DOCX, SRT, CSV. Ready to publish instantly.' },
  { icon: Share2, title: 'Share & Collaborate', desc: 'Generate links for teammates to view and collaborate on your content.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Files deleted after processing. Your content is never used for training.' },
  { icon: Wand2, title: 'Smart Detection', desc: 'YouTube link? → Blog + Twitter. Bilibili? → WeChat + Xiaohongshu. Automatic.' },
]

export function Features() {
  return (
    <section id="features" className="py-32 sm:py-40 s-divider">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400/80 mb-6">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Everything to{' '}
            <span className="g-text">Scale Content</span>
          </h2>
          <p className="text-muted-foreground/60 mt-5 max-w-xl mx-auto text-[15px]">
            Built for creators who turn every piece of content into maximum impact.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative rounded-2xl border border-white/[0.04] g-card hover:border-violet-500/15 transition-all duration-300 p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.08] group-hover:bg-violet-500/[0.12] transition-colors">
                <Icon className="h-5 w-5 text-violet-400/80" />
              </div>
              <h3 className="font-semibold text-[15px] mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

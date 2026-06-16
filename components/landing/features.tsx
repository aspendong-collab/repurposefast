import { Sparkles, Globe, Zap, Shield, Download, MessageSquare, FileText, Layers, Share2, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Sparkles, title: 'AI-Powered Rewriting',
    desc: 'Not just transcription — our AI understands context and rewrites for each platform\'s unique voice and format.',
  },
  {
    icon: Layers, title: '10 Output Formats',
    desc: 'Blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes, newsletters, SRT subtitles, SEO articles, and more.',
  },
  {
    icon: Globe, title: '63+ Languages',
    desc: 'Transcribe and generate content in 63+ languages. Perfect for international creators and global audiences.',
  },
  {
    icon: Zap, title: 'Streaming Generation',
    desc: 'See content appear character by character in real-time. No more waiting for loading spinners.',
  },
  {
    icon: MessageSquare, title: 'Conversational Refinement',
    desc: 'Chat with each output to fine-tune it. Say "make it shorter" or "add emoji" — AI applies it instantly.',
  },
  {
    icon: Download, title: '6 Export Formats',
    desc: 'Download as Markdown, TXT, PDF, DOCX, SRT, or CSV. Directly ready for publishing.',
  },
  {
    icon: Share2, title: 'Share & Collaborate',
    desc: 'Generate shareable links for your teammates to view and collaborate on content.',
  },
  {
    icon: Shield, title: 'Private & Secure',
    desc: 'Your content stays yours. Files are automatically deleted after processing. No data retention.',
  },
  {
    icon: Wand2, title: 'Smart Platform Detection',
    desc: 'Paste a YouTube link? We suggest blog + Twitter. Paste Bilibili? We suggest WeChat + Xiaohongshu.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything You Need to<br />
            <span className="gradient-text">Scale Your Content</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Built for creators who want to maximize every piece of content they produce.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-violet-500/20 hover:bg-card/50 transition-all duration-300"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

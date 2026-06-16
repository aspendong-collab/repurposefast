import { FileText, Heart, MessageCircle, Linkedin, Mail, Search, Sparkles, GitFork, Newspaper, Subtitles } from 'lucide-react'

const FORMATS = [
  { icon: FileText, name: 'Blog Post', color: 'text-orange-400 bg-orange-500/10', desc: 'Long-form structured articles' },
  { icon: FileText, name: 'WeChat Article', color: 'text-green-400 bg-green-500/10', desc: 'Official account style' },
  { icon: Heart, name: 'Xiaohongshu', color: 'text-red-400 bg-red-500/10', desc: 'Lifestyle & review notes' },
  { icon: MessageCircle, name: 'Twitter Thread', color: 'text-sky-400 bg-sky-500/10', desc: 'Hook-driven tweet chains' },
  { icon: Linkedin, name: 'LinkedIn Post', color: 'text-blue-400 bg-blue-500/10', desc: 'Professional insights' },
  { icon: Search, name: 'SEO Article', color: 'text-amber-400 bg-amber-500/10', desc: 'Keyword-optimized content' },
  { icon: Mail, name: 'Newsletter', color: 'text-cyan-400 bg-cyan-500/10', desc: 'Email-ready format' },
  { icon: Subtitles, name: 'SRT Subtitles', color: 'text-gray-400 bg-gray-500/10', desc: 'Timed subtitle files' },
  { icon: Sparkles, name: 'AI Summary', color: 'text-purple-400 bg-purple-500/10', desc: 'Concise key takeaways' },
  { icon: GitFork, name: 'Mind Map', color: 'text-teal-400 bg-teal-500/10', desc: 'XMind-compatible outlines' },
]

const LANGUAGES = [
  'English', '中文', '日本語', '한국어', 'Español', 'Français', 'Deutsch',
  'Português', 'العربية', 'हिन्दी', 'Bahasa Indonesia', 'ไทย', 'Tiếng Việt',
  'Русский', 'Italiano', 'Nederlands', 'Polski', 'Türkçe',
]

export function FormatShowcase() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Output Formats ── */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Output Formats
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            10 Formats, <span className="gradient-text">One Click</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Generate everything simultaneously — no need to run the tool multiple times.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-20">
          {FORMATS.map(({ icon: Icon, name, color, desc }) => (
            <div
              key={name}
              className="group rounded-xl border border-border/50 bg-card/30 p-4 text-center hover:border-violet-500/20 hover:bg-card/50 transition-all duration-300"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold">{name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Languages ── */}
        <div className="text-center mb-12">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Global Reach
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold">
            63+ <span className="gradient-text">Languages</span> Supported
          </h3>
          <p className="text-muted-foreground mt-2">Transcribe and generate content in 63+ languages. Perfect for international creators and global audiences.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {LANGUAGES.map((lang) => (
            <span
              key={lang}
              className="rounded-full border border-border/50 px-4 py-2 text-sm text-muted-foreground hover:border-violet-500/30 hover:text-foreground transition-colors cursor-default"
            >
              {lang}
            </span>
          ))}
          <span className="rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-2 text-sm text-violet-400 font-medium">
            +45 more
          </span>
        </div>
      </div>
    </section>
  )
}

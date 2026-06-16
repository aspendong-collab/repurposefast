import { Sparkles, Brain, Share2 } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    badge: 'Core Engine',
    title: 'AI Transcription That Actually Works',
    desc: 'Powered by the latest speech recognition models. Handles accents, background noise, and multi-speaker scenarios with industry-leading accuracy. Transcribe a 1-hour file in under 60 seconds.',
    items: ['63+ languages supported', 'Multi-speaker detection', 'SRT/VTT subtitle export', '99%+ accuracy in clear audio'],
    gradient: 'from-violet-600/20 to-violet-600/5',
    iconBg: 'bg-violet-500/10 text-violet-400',
  },
  {
    icon: Brain,
    badge: 'AI Intelligence',
    title: 'Smart Repurposing, Not Just Translation',
    desc: 'Our AI doesn\'t just convert speech to text — it understands context, extracts key insights, and rewrites content specifically for each platform\'s unique style and audience.',
    items: ['Platform-specific tone adaptation', 'Auto keyword extraction for SEO', 'Summary & mind map generation', 'Conversational refinement chat'],
    gradient: 'from-cyan-600/20 to-cyan-600/5',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
  },
  {
    icon: Share2,
    badge: 'Distribution',
    title: 'One Click, Every Platform Covered',
    desc: 'Generate all formats simultaneously in a single run. From long-form blog posts to bite-sized social threads, your content is ready to publish across every channel.',
    items: ['10 output formats in one run', 'Markdown, PDF, DOCX, SRT export', 'Shareable result links', 'Team collaboration ready'],
    gradient: 'from-fuchsia-600/20 to-fuchsia-600/5',
    iconBg: 'bg-fuchsia-500/10 text-fuchsia-400',
  },
]

export function FeatureHighlights() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/4 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Why RePurposeFast
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built Different.<br />
            <span className="gradient-text">AI-First From the Ground Up</span>
          </h2>
        </div>

        <div className="space-y-12 lg:space-y-20">
          {HIGHLIGHTS.map(({ icon: Icon, badge, title, desc, items, gradient, iconBg }, i) => (
            <div
              key={title}
              className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Visual */}
              <div className="flex-1 w-full max-w-lg">
                <div
                  className={`relative rounded-3xl bg-gradient-to-br ${gradient} border border-border/30 p-8 sm:p-12 aspect-square sm:aspect-[4/3] flex items-center justify-center`}
                >
                  <div className="text-center">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg} mb-6`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/30 px-3 py-1 text-xs text-muted-foreground mb-4">
                      {badge}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {items.map((item) => (
                        <span
                          key={item}
                          className="rounded-lg bg-background/50 border border-border/30 px-3 py-1.5 text-xs text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            {/* Text */}
              <div className="flex-1 max-w-lg">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

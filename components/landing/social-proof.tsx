import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    text: '"Finally a tool that understands content creation workflow. One video → all platforms in minutes. Game changer for my content schedule."',
    author: 'Sarah Chen',
    role: 'Content Creator, 120K subscribers',
    rating: 5,
  },
  {
    text: '"The conversational refinement is brilliant. I can tweak each output by just chatting with it. Saves me hours every week."',
    author: 'Marcus Rivera',
    role: 'Marketing Lead',
    rating: 5,
  },
  {
    text: '"I was skeptical about AI content, but the quality genuinely surprised me. The platform-specific formatting is spot on."',
    author: 'Yuki Tanaka',
    role: 'Podcast Host',
    rating: 5,
  },
  {
    text: '"As a solo founder, this tool gives me a content team\'s output. LinkedIn posts, blogs, tweets — all from one video."',
    author: 'Alex Park',
    role: 'Startup Founder',
    rating: 5,
  },
]

export function SocialProof() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Stats */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Trusted by Creators</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500K+', label: 'Videos Processed' },
              { value: '4.9', label: 'User Rating', star: true },
              { value: '63+', label: 'Languages' },
            ].map(({ value, label, star }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                  {value}
                  {star && <Star className="h-5 w-5 text-amber-400 fill-amber-400" />}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map(({ text, author, role, rating }) => (
            <div
              key={author}
              className="rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">{text}</p>
              <div>
                <p className="text-sm font-semibold">{author}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

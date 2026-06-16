import { Sparkles } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'How It Works', href: '#how-it-works' },
  ],
  Tools: [
    { label: 'YouTube to Blog', href: '/tools/youtube-to-blog-post' },
    { label: 'Video to Twitter', href: '/tools/video-to-twitter-thread' },
    { label: 'Video to Xiaohongshu', href: '/tools/video-to-xiaohongshu' },
    { label: 'Podcast to Article', href: '/tools/podcast-to-article' },
    { label: 'Audio to Text', href: '/tools/audio-to-text' },
    { label: 'All Tools →', href: '/tools' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Company: [
    { label: 'GitHub', href: 'https://github.com/aspendong-collab/repurposefast' },
    { label: 'Contact', href: 'mailto:hi@ailomo.com' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                <span className="text-foreground">ailo</span><span className="text-violet-400">mo</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground/50 leading-relaxed">
              AI-powered content repurposing. Turn one video into your entire multi-platform content strategy.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 text-foreground/80">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener' : undefined}
                      className="text-sm text-muted-foreground/50 hover:text-foreground/70 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} ailomo. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Built for content creators worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}

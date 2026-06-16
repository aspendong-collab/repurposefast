import { Sparkles } from 'lucide-react'

const LINKS = {
  Product: ['Features', 'Pricing', 'FAQ', 'Changelog'],
  Tools: ['YouTube to Blog', 'Video to Twitter', 'Video to Xiaohongshu', 'Podcast to Article', 'Audio to Text'],
  Company: ['About', 'Blog', 'Privacy', 'Terms'],
  Connect: ['Twitter', 'Discord', 'Email', 'Product Hunt'],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <span className="font-bold text-lg">RePurposeFast</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered content repurposing. Turn one video into your entire multi-platform content strategy.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RePurposeFast. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with &hearts; for content creators worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { allBlogPosts } from '@/content/blog/registry'

export const metadata: Metadata = {
  title: 'Blog — AI Content Repurposing Tips, Guides & Strategy | ailomo',
  description: 'Expert guides on AI content repurposing, video-to-blog workflows, social media strategy, SEO content clusters, and more. Updated weekly.',
  alternates: { canonical: '/blog' },
}

const categories = Array.from(new Set(allBlogPosts.map((p) => p.category)))

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            AI Content Repurposing <span className="g-text">Blog</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Expert guides, tutorials, and strategies for maximizing your content reach with AI.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="mx-auto max-w-4xl px-4 pb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-violet-500/20 hover:text-violet-300 transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </section>

      {/* All posts */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {allBlogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 hover:border-violet-500/15 transition-all duration-300"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-violet-500/[0.08] px-3 py-1 text-xs font-medium text-violet-300">
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">{post.readingTime} read</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold leading-snug group-hover:text-violet-300 transition-colors">
                {post.title}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground/70 line-clamp-2">
                {post.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

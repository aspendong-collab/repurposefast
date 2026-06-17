import Link from 'next/link'
import { getRelevantBlogs, getRelevantTools } from '@/lib/seo-crosslink'
import { toolPages } from '@/app/tools/generate-seo-pages'

export function RelatedBlogs({ slug }: { slug: string }) {
  const blogs = getRelevantBlogs(slug)
  if (blogs.length === 0) return null

  return (
    <section className="mx-auto max-w-4xl px-4 pb-20">
      <h2 className="mb-4 text-lg font-semibold">📚 Related Guides & Articles</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {blogs.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-white/[0.06] bg-white/[0.01] p-5 transition-all hover:border-violet-500/15 hover:bg-white/[0.02]"
          >
            <span className="mb-1 inline-block rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300">
              {post.category}
            </span>
            <h3 className="mt-2 font-medium text-sm group-hover:text-violet-300 transition-colors">
              {post.title.slice(0, 80)}...
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground/60">
              Keyword: {post.targetKeyword}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function RelatedTools({ slug, excludeSlug }: { slug: string; excludeSlug?: string }) {
  const tools = getRelevantTools(slug)

  if (tools.length === 0) {
    // Fallback: show 4 random other tools
    const others = toolPages.filter((p) => p.slug !== excludeSlug).slice(0, 4)
    if (others.length === 0) return null
    return (
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="mb-4 text-lg font-semibold">🛠️ Try These Free Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {others.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-4 text-sm transition-all hover:border-violet-500/15 hover:bg-white/[0.02]"
            >
              <span className="font-medium text-violet-300">{t.badge.split('→')[0]?.trim()}</span>
              <span className="mx-1 text-muted-foreground">→</span>
              <span className="text-muted-foreground">{t.badge.split('→')[1]?.trim()}</span>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 pb-20">
      <h2 className="mb-4 text-lg font-semibold">🛠️ Try These Free Tools</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-4 text-sm transition-all hover:border-violet-500/15 hover:bg-white/[0.02]"
          >
            <span className="font-medium text-violet-300">{t.badge.split('→')[0]?.trim()}</span>
            <span className="mx-1 text-muted-foreground">→</span>
            <span className="text-muted-foreground">{t.badge.split('→')[1]?.trim()}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

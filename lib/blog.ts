/**
 * Blog Content Loader — Virtual Silo Architecture
 * ===============================================
 * Uses static imports (bundled by webpack) — works on Vercel serverless.
 * All blog posts imported from content/blog/index.ts (auto-generated).
 */

import { blogPosts } from "@/content/blog/index"
import { type Locale } from "./i18n"

export interface BlogPost {
  slug: string
  locale: Locale
  title: string
  tldr: string
  description: string
  datePublished: string
  dateModified: string
  author: string
  tags: string[]
  keywords: string[]
  content: string
  faq: { q: string; a: string }[]
  relatedLinks: { label: string; url: string }[]
}

/** Get all blog posts for a locale */
export function getBlogPosts(locale: Locale): BlogPost[] {
  return blogPosts
    .filter((p) => p.locale === locale)
    .sort(
      (a, b) =>
        new Date(b.datePublished).getTime() -
        new Date(a.datePublished).getTime(),
    )
}

/** Get a single blog post by locale + slug */
export function getBlogPost(locale: Locale, slug: string): BlogPost | null {
  return blogPosts.find((p) => p.locale === locale && p.slug === slug) ?? null
}

/** Get all blog posts across all locales */
export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts]
}

/** Get all slugs for generateStaticParams */
export function getAllBlogSlugs(): { locale: string; slug: string }[] {
  return blogPosts.map((p) => ({ locale: p.locale, slug: p.slug }))
}

/** Get related posts for cross-linking (same locale only — silo rule) */
export function getRelatedPosts(
  locale: Locale,
  currentSlug: string,
  limit = 3,
): BlogPost[] {
  const current = getBlogPosts(locale).find((p) => p.slug === currentSlug)
  const others = getBlogPosts(locale).filter((p) => p.slug !== currentSlug)

  if (!current || others.length === 0) return others.slice(0, limit)

  // Score by tag overlap for true topic clustering
  const scored = others.map((p) => {
    const overlap = current.tags.filter((t) => p.tags.includes(t)).length
    return { post: p, score: overlap }
  })

  // Sort: highest tag overlap first, then recency (newer first)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.post.datePublished).getTime() - new Date(a.post.datePublished).getTime()
  })

  return scored.slice(0, limit).map((s) => s.post)
}

/** Generate breadcrumb trail */
export function getBreadcrumbs(
  locale: Locale,
  dict: Record<string, any>,
  post?: BlogPost,
): { name: string; url: string }[] {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
    .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
    .replace(/\/\/saveik\.com/, "//www.saveik.com")
  const base = locale === "en" ? siteUrl : `${siteUrl}/${locale}`
  const homeLabel = locale === "en" ? "Home" : (dict as any)?.hero?.title || "Home"

  const crumbs = [{ name: homeLabel, url: base }]

  if (post) {
    const blogLabel = (dict as any)?.ui?.discover || "Blog"
    crumbs.push({ name: blogLabel, url: `${base}/blog` })
    crumbs.push({ name: post.title, url: `${base}/blog/${post.slug}` })
  } else {
    crumbs.push({ name: (dict as any)?.ui?.discover || "Blog", url: `${base}/blog` })
  }

  return crumbs
}

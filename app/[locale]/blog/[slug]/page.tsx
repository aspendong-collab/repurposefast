/**
 * Blog Post Page — Virtual Silo Architecture
 * ============================================
 * Renders individual blog article with:
 * - Breadcrumb navigation (Home > Blog > Article)
 * - TL;DR summary box (GEO optimized)
 * - Full Markdown content
 * - Auto-generated FAQ (high AI citation value)
 * - Strict one-way internal links (→ tool homepage only)
 * - JSON-LD: TechArticle + BreadcrumbList
 */

import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Calendar, Clock, ArrowLeft, Zap, HelpCircle } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { AdUnit } from "@/components/adsense"
import { getBlogPost, getRelatedPosts, getBreadcrumbs, getAllBlogSlugs } from "@/lib/blog"
import { getDictionary } from "@/lib/dictionaries"
import { locales, defaultLocale, localeLabels, type Locale } from "@/lib/i18n"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

export function generateStaticParams() {
  return getAllBlogSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!locales.includes(locale as Locale)) return {}

  const post = getBlogPost(locale as Locale, slug)
  if (!post) return {}

  const canonical =
    locale === defaultLocale
      ? `${siteUrl}/blog/${slug}`
      : `${siteUrl}/${locale}/blog/${slug}`

  return {
    metadataBase: new URL(siteUrl),
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: canonical,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    robots: { index: true, follow: true },
    alternates: { canonical },
  }
}

/** Simple Markdown → HTML renderer (inline, no dependencies) */
function renderMarkdown(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black mt-10 mb-4">$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="text-violet-400 hover:underline">$1</a>',
    )
    // Line breaks → paragraphs
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ""
      if (trimmed.startsWith("<h") || trimmed.startsWith("<ol") || trimmed.startsWith("<ul")) return trimmed
      // Ordered list
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed
          .split("\n")
          .filter(Boolean)
          .map((li) => `<li>${li.replace(/^\d+\.\s/, "")}</li>`)
          .join("")
        return `<ol class="list-decimal pl-6 space-y-2 my-4">${items}</ol>`
      }
      // Unordered list
      if (/^[•\-*]\s/.test(trimmed)) {
        const items = trimmed
          .split("\n")
          .filter(Boolean)
          .map((li) => `<li>${li.replace(/^[•\-*]\s/, "")}</li>`)
          .join("")
        return `<ul class="list-disc pl-6 space-y-2 my-4">${items}</ul>`
      }
      return `<p class="my-4 leading-relaxed">${trimmed.replace(/\n/g, "<br/>")}</p>`
    })
    .join("")

  return html
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!locales.includes(locale as Locale)) notFound()

  const post = getBlogPost(locale as Locale, slug)
  if (!post) notFound()

  const dict = await getDictionary(locale as Locale)
  const relatedPosts = getRelatedPosts(locale as Locale, slug)
  const breadcrumbs = getBreadcrumbs(locale as Locale, dict as any, post)

  // Split content at midpoint for in-article ad placement
  const blocks = post.content.split("\n\n").filter(b => b.trim())
  const midPoint = Math.ceil(blocks.length / 2)
  const contentFirstHalf = renderMarkdown(blocks.slice(0, midPoint).join("\n\n"))
  const contentSecondHalf = renderMarkdown(blocks.slice(midPoint).join("\n\n"))

  const canonical =
    locale === defaultLocale
      ? `${siteUrl}/blog/${slug}`
      : `${siteUrl}/${locale}/blog/${slug}`

  // Schema: TechArticle + BreadcrumbList + FAQPage
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: post.title,
        description: post.description,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: "Saveik", url: siteUrl },
        about: { "@type": "SoftwareApplication", name: "TikTok" },
        mainEntityOfPage: canonical,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
      ...(post.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: post.faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          ]
        : []),
    ],
  }

  return (
    <main className="container max-w-3xl py-12">
      {/* ===== Breadcrumbs ===== */}
      <Breadcrumbs items={breadcrumbs} />

      <article>
        {/* ===== Header ===== */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.datePublished).toLocaleDateString(
                locale === "en" ? "en-US" : locale,
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {Math.ceil(post.content.length / 1500)} min read
            </span>
            <span className="text-muted-foreground">by {post.author}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* ===== TL;DR Box (GEO Optimization) ===== */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
            <Zap className="h-3 w-3 inline mr-1" />
            TL;DR
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {post.tldr}
          </p>
        </div>

        {/* ===== Content ===== */}
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: contentFirstHalf }}
        />

        {/* AdSense — 博客文章中部 */}
        <AdUnit slot="2675971662" format="rectangle" className="my-8" />

        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: contentSecondHalf }}
        />

        {/* ===== FAQ Section (High GEO Citation Value) ===== */}
        {post.faq.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border/50">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-violet-400" />
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Quick answers about downloading TikTok videos
            </p>
            <div className="space-y-4">
              {post.faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border/40 bg-card/50 overflow-hidden"
                >
                  <summary className="cursor-pointer p-5 font-medium flex items-center justify-between hover:bg-accent/50 transition-colors">
                    {item.q}
                    <span className="shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ===== Related Links (Strict Silo → Only Tool Homepage) ===== */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-10 border-t border-border/50">
            <h3 className="text-lg font-bold mb-4">Related Articles</h3>
            <div className="grid gap-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/${locale}/blog/${rp.slug}`}
                  className="block rounded-xl border border-border/40 bg-card/50 p-4 hover:border-violet-500/30 transition-all"
                >
                  <p className="font-medium">{rp.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {rp.tldr}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== Back to Tool (One-Way Link Flow) ===== */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <Link
            href={locale === "en" ? "/" : `/${locale}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-violet-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {(dict as any)?.hero?.cta || "Back to TikTok Downloader"}
          </Link>
        </div>
      </article>

      {/* ===== JSON-LD Structured Data ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  )
}
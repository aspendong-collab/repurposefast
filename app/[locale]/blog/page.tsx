/**
 * Blog Listing Page — Virtual Silo Architecture
 * ==============================================
 * Lists all blog posts for current locale.
 * Strict one-way link flow: blog posts only point → tool homepage.
 */

import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BreadcrumbListSchema } from "@/components/structured-data"
import { getBlogPosts, getBreadcrumbs } from "@/lib/blog"
import { getDictionary } from "@/lib/dictionaries"
import { locales, defaultLocale, localeHtmlLang, localeOgLocale, type Locale } from "@/lib/i18n"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) return {}

  const dict = await getDictionary(locale as Locale)
  const canonical = locale === defaultLocale ? `${siteUrl}/blog` : `${siteUrl}/${locale}/blog`

  return {
    title: `Blog | Saveik`,
    description: `Read our latest guides and tutorials about downloading TikTok videos. Learn tips, tricks, and step-by-step instructions.`,
    alternates: {
      canonical,
    },
    robots: { index: true, follow: true },
  }
}

export default async function BlogListingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const posts = getBlogPosts(locale as Locale)
  const breadcrumbs = getBreadcrumbs(locale as Locale, dict as any)

  return (
    <main className="container max-w-4xl py-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          {(dict as any)?.ui?.discover || "Blog"}
        </h1>
        <p className="text-lg text-muted-foreground">
          Tutorials, guides, and tips for downloading TikTok videos without
          watermark. Learn everything about TikTok video downloading.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No articles yet. Check back soon!</p>
          <Link
            href={locale === "en" ? "/" : `/${locale}`}
            className="inline-flex items-center gap-2 mt-4 text-violet-500 hover:underline"
          >
            ← {(dict as any)?.hero?.cta || "Go to Downloader"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-border/50 bg-card/50 p-6 hover:border-violet-500/30 hover:bg-card transition-all"
            >
              <Link href={`/${locale}/blog/${post.slug}`}>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.datePublished).toLocaleDateString(
                      locale === "en" ? "en-US" : locale,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.ceil(post.content.length / 1500)} min read
                  </span>
                </div>

                <h2 className="text-xl font-bold mb-2 group-hover:text-violet-500 transition-colors">
                  {post.title}
                </h2>

                {/* TL;DR — GEO optimized summary */}
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.tldr}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 text-sm text-violet-500 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Back to tool link — one-way flow */}
      <div className="mt-16 pt-8 border-t border-border/50 text-center">
        <Link
          href={locale === "en" ? "/" : `/${locale}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {(dict as any)?.hero?.cta || "Back to Downloader"}
        </Link>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              BreadcrumbListSchema(breadcrumbs),
            ],
          }),
        }}
      />
    </main>
  )
}
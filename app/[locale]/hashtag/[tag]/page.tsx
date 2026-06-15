/**
 * Hashtag Landing Page — Programmatic SEO
 * =========================================
 * URL: /{locale}/hashtag/{tag-slug}
 *
 * Each page targets searches like:
 *   "download {hashtag} TikTok videos"
 *   "save {hashtag} TikToks without watermark"
 */

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { locales, defaultLocale, localeLabels, type Locale } from "@/lib/i18n"
import { hashtagPages, type HashtagPage } from "@/lib/hashtag-data"
import { getDictionary } from "@/lib/dictionaries"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BreadcrumbListSchema } from "@/components/structured-data"
import { AdUnit } from "@/components/adsense"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

const PRIORITY_LOCALES = ["en", "id", "vi", "th", "es", "pt-br", "zh", "ja", "ko", "ar"]

export function generateStaticParams() {
  const params: { locale: string; tag: string }[] = []
  for (const locale of PRIORITY_LOCALES) {
    for (const tag of hashtagPages) {
      params.push({ locale, tag: tag.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>
}): Promise<Metadata> {
  const { locale, tag: tagSlug } = await params
  if (!locales.includes(locale as Locale)) return {}

  const tag = hashtagPages.find((t) => t.slug === tagSlug)
  if (!tag) return {}

  const canonical = locale === defaultLocale
    ? `${siteUrl}/hashtag/${tagSlug}`
    : `${siteUrl}/${locale}/hashtag/${tagSlug}`

  return {
    title: `Download ${tag.hashtag} TikTok Videos — Free HD, No Watermark`,
    description: `Save ${tag.hashtag} TikTok videos without watermark. ${tag.description} Download in HD MP4 or MP3. No app needed.`,
    keywords: [`${tag.hashtag} download`, `save ${tag.hashtag} TikTok`, `download ${tag.hashtag} videos`],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `Save ${tag.hashtag} TikTok Videos — Free, HD, No Watermark`,
      description: tag.description,
      locale,
      url: canonical,
      type: "website",
    },
  }
}

export default async function HashtagPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>
}) {
  const { locale, tag: tagSlug } = await params
  if (!PRIORITY_LOCALES.includes(locale)) notFound()

  const tag = hashtagPages.find((t) => t.slug === tagSlug)
  if (!tag) notFound()

  const dict = await getDictionary(locale as Locale)
  const homeUrl = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`

  const breadcrumbs = [
    { name: localeLabels[locale as Locale] || "Home", url: homeUrl },
    { name: `${tag.hashtag} Videos`, url: "" },
  ]

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      BreadcrumbListSchema(breadcrumbs),
      {
        "@type": "WebApplication",
        name: `Saveik — ${tag.hashtag} TikTok Video Downloader`,
        description: `Download ${tag.hashtag} TikTok videos without watermark in HD quality. Free, no app needed.`,
        applicationCategory: "Multimedia",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Can I download ${tag.hashtag} TikTok videos without watermark?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes! Saveik lets you download any ${tag.hashtag} TikTok video in HD without watermark. Just paste the video link and click download. No registration needed.`,
            },
          },
          {
            "@type": "Question",
            name: `How do I save ${tag.hashtag} videos to my phone?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Open your browser, go to saveik.com, paste the TikTok link for the video you want, and tap Download. Works on iPhone, Android, and PC. Choose MP4 for video or MP3 for audio.",
            },
          },
          {
            "@type": "Question",
            name: `Are ${tag.hashtag} TikTok videos free to download?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Saveik is 100% free. Download as many TikTok videos as you want — including all popular hashtag content. No limits, no fees, no registration.",
            },
          },
        ],
      },
    ],
  }

  // Related hashtags (same category)
  const related = hashtagPages
    .filter((t) => t.category === tag.category && t.slug !== tagSlug)
    .slice(0, 5)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="container max-w-4xl py-12">
        <Breadcrumbs items={breadcrumbs} />

        <section className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-6">
            {tag.category}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Download {tag.hashtag} TikTok Videos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {tag.description} Save any {tag.hashtag} video without watermark, in full HD quality.
          </p>
        </section>

        <AdUnit slot="7781253833" format="horizontal" className="mb-12" />

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            How to Download {tag.hashtag} Videos
          </h2>
          <div className="space-y-6">
            {[
              { step: 1, title: "Find a Video", desc: `Browse TikTok for ${tag.hashtag} videos. Tap the Share icon on any video you want to save.` },
              { step: 2, title: "Copy & Paste", desc: "Tap Copy Link, then go to saveik.com. Paste the link and click Download." },
              { step: 3, title: "Save in HD", desc: "Your video processes in seconds. Choose MP4 for video or MP3 for audio. No watermark, full quality." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-lg">{step}</div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              More {tag.category} Hashtags
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={locale === defaultLocale ? `/hashtag/${r.slug}` : `/${locale}/hashtag/${r.slug}`}
                  className="px-4 py-2 rounded-full border border-border/50 bg-card/50 text-sm hover:border-violet-500/30 hover:text-violet-400 transition-all"
                >
                  {r.hashtag}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-8 border-t border-border/30">
          <Link
            href={locale === defaultLocale ? "/" : `/${locale}`}
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            ← {locale === defaultLocale ? "Back to Saveik Downloader" : `Back to Saveik ${localeLabels[locale as Locale]}`}
          </Link>
        </div>
      </main>
    </>
  )
}

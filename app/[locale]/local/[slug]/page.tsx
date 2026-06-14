/**
 * Local SEO Landing Page — Dynamic Route
 * ========================================
 * Route: /[locale]/local/[slug]
 * Generates geo-targeted landing pages like:
 *   /id/local/indonesia → "Download TikTok di Indonesia"
 *   /vi/local/vietnam    → "Tải TikTok tại Việt Nam"
 *
 * Each page targets "TikTok Downloader [Country]" keywords
 * with localized content, HowTo schema, FAQ, and proper hreflang.
 */

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { locales, defaultLocale, localeLabels, type Locale } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"
import { localPages, type LocalLandingPage } from "@/lib/local-seo-data"
import { BreadcrumbListSchema, HowToSchema, FAQSchema } from "@/components/structured-data"
import { Breadcrumbs } from "@/components/breadcrumbs"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const [locale, pages] of Object.entries(localPages)) {
    for (const page of pages) {
      params.push({ locale, slug: page.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!locales.includes(locale as Locale)) return {}

  const pages = localPages[locale]
  if (!pages) return {}
  const page = pages.find((p) => p.slug === slug)
  if (!page) return {}

  const canonical = `${siteUrl}/${locale}/local/${slug}`

  return {
    title: page.headline,
    description: page.description,
    keywords: page.localKeywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: page.headline,
      description: page.description,
      url: canonical,
    },
    robots: { index: true, follow: true },
  }
}

export default async function LocalSEOPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!locales.includes(locale as Locale)) notFound()

  const pages = localPages[locale]
  if (!pages) notFound()
  const page = pages.find((p) => p.slug === slug)
  if (!page) notFound()

  const dict = await getDictionary(locale as Locale)
  const canonical = `${siteUrl}/${locale}/local/${slug}`

  // JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      HowToSchema(locale as Locale, {
        ui: {
          howToUse: {
            heading: page.headline,
            steps: page.howToSteps.map((s) => ({
              step: s.step,
              title: s.title,
              description: s.desc,
            })),
          },
        },
        meta: { title: page.headline },
      } as any, canonical),
      FAQSchema({
        ui: {
          faq: {
            heading: "FAQ",
            items: page.faq.map((f) => ({
              question: f.q,
              answer: f.a,
            })),
          },
        },
      } as any),
      BreadcrumbListSchema([
        { name: localeLabels[locale as Locale] || "Home", url: locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}` },
        { name: "Local", url: "" },
        { name: page.localName, url: canonical },
      ]),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="container max-w-4xl py-16">
        <Breadcrumbs
          items={[
            { name: localeLabels[locale as Locale] || "Home", url: locale === defaultLocale ? "/" : `/${locale}` },
            { name: page.localName, url: `/${locale}/local/${slug}` },
          ]}
        />

        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-balance">
            {page.headline}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {page.subheadline}
          </p>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-6 mb-12">
          {page.features.map((feat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card/50 p-6 hover:border-violet-500/30 transition-all"
            >
              <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* How-To Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How to Use Saveik in {page.countryName}</h2>
          <div className="space-y-4">
            {page.howToSteps.map((step) => (
              <div
                key={step.step}
                className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-5"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mb-12 p-8 rounded-2xl bg-violet-500/5 border border-violet-500/20">
          <h2 className="text-2xl font-bold mb-2">Ready to Download?</h2>
          <p className="text-muted-foreground mb-6">
            Start downloading TikTok videos without watermark — free and unlimited.
          </p>
          <Link
            href={locale === defaultLocale ? "/" : `/${locale}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-violet-500 text-white font-bold hover:bg-violet-400 transition-colors"
          >
            Go to Downloader →
          </Link>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {page.faq.map((item, i) => (
              <details
                key={i}
                className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden group"
              >
                <summary className="p-5 cursor-pointer font-medium hover:text-violet-400 transition-colors">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

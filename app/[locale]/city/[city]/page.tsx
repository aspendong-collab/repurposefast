/**
 * City-Level Landing Page — Programmatic SEO
 * ===========================================
 * URL: /{locale}/city/{city-slug}
 *
 * Auto-generates unique pages for each city in city-data.ts.
 * Each page has unique title, meta, keywords, and localized content.
 * Scales infinitely: add cities to city-data.ts → new pages auto-created.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { locales, defaultLocale, localeLabels, type Locale } from "@/lib/i18n"
import { cityPages, type CityPage } from "@/lib/city-data"
import { getDictionary } from "@/lib/dictionaries"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BreadcrumbListSchema } from "@/components/structured-data"
import { AdUnit } from "@/components/adsense"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

export function generateStaticParams() {
  const params: { locale: string; city: string }[] = []
  for (const [locale, cities] of Object.entries(cityPages)) {
    for (const city of cities) {
      params.push({ locale, city: city.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>
}): Promise<Metadata> {
  const { locale, city: citySlug } = await params
  if (!locales.includes(locale as Locale)) return {}

  const cities = cityPages[locale]
  if (!cities) return {}
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) return {}

  const canonical = locale === defaultLocale
    ? `${siteUrl}/city/${citySlug}`
    : `${siteUrl}/${locale}/city/${citySlug}`

  return {
    title: city.headline,
    description: city.subheadline,
    keywords: city.localKeywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: city.headline,
      description: city.subheadline,
      locale: locale,
      url: canonical,
      type: "website",
    },
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>
}) {
  const { locale, city: citySlug } = await params
  if (!locales.includes(locale as Locale)) notFound()

  const cities = cityPages[locale]
  if (!cities) notFound()
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) notFound()

  const dict = await getDictionary(locale as Locale)
  const homeUrl = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`

  const breadcrumbs = [
    { name: localeLabels[locale as Locale] || "Home", url: homeUrl },
    { name: city.cityName, url: "" },
  ]

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      BreadcrumbListSchema(breadcrumbs),
      {
        "@type": "WebApplication",
        name: `Saveik — TikTok Downloader in ${city.cityName}`,
        description: city.subheadline,
        url: locale === defaultLocale ? `${siteUrl}/city/${citySlug}` : `${siteUrl}/${locale}/city/${citySlug}`,
        applicationCategory: "Multimedia",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Does Saveik work in ${city.cityName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes! Saveik works perfectly in ${city.cityName} and all of ${city.region}. No VPN needed, no restrictions.`,
            },
          },
          {
            "@type": "Question",
            name: `Can I download TikTok videos on my phone in ${city.cityName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes — open your browser, go to saveik.com, paste your TikTok link, and download. Works on iPhone, Android, and PC.",
            },
          },
          {
            "@type": "Question",
            name: "Is it free to download TikTok videos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "100% free. No registration, no limits, no hidden fees. Download as many TikTok videos as you want in HD quality without watermark.",
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="container max-w-4xl py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            {city.headline}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {city.subheadline}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">
              📍 {city.cityName}, {city.region}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400">
              👥 {city.population} people
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
              ✅ Works everywhere
            </span>
          </div>
        </section>

        {/* Ad */}
        <AdUnit slot="7781253833" format="horizontal" className="mb-12" />

        {/* How to Download */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            How to Download TikTok Videos in {city.cityName}
          </h2>
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Copy the TikTok Link",
                desc: `Open TikTok on your phone in ${city.cityName}, tap the Share button on any video, then tap Copy Link.`,
              },
              {
                step: 2,
                title: "Paste on Saveik",
                desc: `Open your browser and go to saveik.com. Paste the link into the download box and tap Download. It works from ${city.cityName} with no VPN or special setup.`,
              },
              {
                step: 3,
                title: "Save Your Video",
                desc: "Choose MP4 for video or MP3 for audio only. Your file saves instantly to your Downloads folder or Files app.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-lg">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="mb-12 grid sm:grid-cols-2 gap-4">
          {[
            { title: "No Watermark", desc: `Clean MP4 downloads — perfect for sharing from ${city.cityName}.` },
            { title: "HD 1080p Quality", desc: "Full resolution, zero compression." },
            { title: "No App Needed", desc: `Works in your browser — iPhone and Android in ${city.cityName}.` },
            { title: "Free Forever", desc: "No limits, no registration, no fees." },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4">
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: `Does Saveik work in ${city.cityName}?`, a: `Yes! Saveik is fully available in ${city.cityName}, ${city.region}. No VPN or proxy needed — just open your browser and go.` },
              { q: `Can I use Saveik on my iPhone in ${city.cityName}?`, a: "Absolutely. Open Safari (or any browser), go to saveik.com, paste your TikTok link, and download. No app installation required." },
              { q: "Is it legal to download TikTok videos?", a: "For personal use, yes. Saveik helps you save videos you have the right to access publicly. We respect copyright — please don't redistribute without permission." },
              { q: "What quality will my downloads be?", a: "Saveik downloads videos in the highest available quality — up to 1080p HD. No compression, no watermarks added." },
              { q: `Can I download from ${city.cityName} without using mobile data?`, a: "Yes! If you're on WiFi, downloads won't use your mobile data. Saveik processes the link server-side and gives you a direct download link." },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-5">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Back to home */}
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

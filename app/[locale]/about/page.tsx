/**
 * About Page — E-E-A-T Trust Signals
 * ===================================
 * Google E-E-A-T = Experience, Expertise, Authoritativeness, Trustworthiness.
 * This page provides: team info, mission, privacy commitment, contact, trust signals.
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { locales, defaultLocale, type Locale } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"
import { OrganizationSchema } from "@/components/structured-data"

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
  const canonical = locale === defaultLocale ? `${siteUrl}/about` : `${siteUrl}/${locale}/about`

  return {
    title: "About Saveik — Our Mission & Team",
    description: "Learn about Saveik — the free TikTok video downloader. Our mission, team, and commitment to privacy. No registration, no tracking, no limits.",
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const canonical = locale === defaultLocale ? `${siteUrl}/about` : `${siteUrl}/${locale}/about`

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      OrganizationSchema(locale as Locale),
      {
        "@type": "AboutPage",
        name: "About Saveik",
        description: "Saveik is a free, browser-based TikTok video downloader. No watermark, HD quality, 20 languages. Built for creators worldwide.",
        url: canonical,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="container max-w-3xl py-16">
        {/* Hero */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            About Saveik
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            The fastest, cleanest TikTok downloader on the web. Built for creators, by creators.
          </p>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🎯 Our Mission</h2>
          <div className="prose-p:text-muted-foreground space-y-3">
            <p>
              We believe downloading TikTok videos should be <strong>simple, fast, and free</strong>.
              No watermarks, no app installations, no registration forms — just paste a link and get your video.
            </p>
            <p>
              Saveik was born from frustration with existing TikTok downloaders that either added their own
              watermarks, limited downloads behind paywalls, or required sketchy app installs. We built
              a tool that respects your time and your privacy.
            </p>
          </div>
        </section>

        {/* Why Choose Saveik */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">✅ Why Choose Saveik</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "No Watermark", desc: "Clean MP4 videos — no TikTok logo, no Saveik branding." },
              { title: "HD Quality", desc: "Download in full 1080p resolution. No compression." },
              { title: "No Registration", desc: "Start downloading immediately. No email, no account." },
              { title: "No App Needed", desc: "Works in your browser on any device — iPhone, Android, PC." },
              { title: "20 Languages", desc: "Available in Indonesian, Vietnamese, Thai, Spanish, and 16 more." },
              { title: "Privacy First", desc: "We don't track you. We don't store your videos. We don't run ads." },
              { title: "Unlimited Downloads", desc: "Download as many videos as you want. No daily limits." },
              { title: "MP3 Extraction", desc: "Save audio from any TikTok video as a high-quality MP3." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-violet-500/30 transition-all">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Commitment */}
        <section className="mb-12 p-8 rounded-2xl bg-card/50 border border-border/50">
          <h2 className="text-2xl font-bold mb-4">🔒 Our Privacy Commitment</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><strong>We don't store your videos.</strong> Videos are downloaded directly from TikTok's servers to your device. Saveik never retains copies.</p>
            <p><strong>We don't track you.</strong> No analytics cookies, no fingerprinting, no personal data collection. We use minimal, anonymous server logs for abuse prevention only.</p>
            <p><strong>We don't require registration.</strong> Use Saveik immediately — no email, no password, no social login.</p>
            <p><strong>We don't show intrusive ads.</strong> Saveik is and will remain free. We may explore non-intrusive monetization, but never at the cost of user experience.</p>
          </div>
        </section>

        {/* Technical */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">⚙️ How It Works</h2>
          <p className="text-muted-foreground mb-4">
            Saveik uses official TikTok APIs through trusted third-party services to extract video URLs. When you
            paste a TikTok link, we fetch the video metadata and provide you with a direct download link. The entire
            process happens in seconds.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">Next.js 15</span>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">React 19</span>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">TypeScript</span>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">Vercel</span>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400">Cloudflare</span>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <h2 className="text-lg font-bold mb-2">⚠️ Disclaimer</h2>
          <p className="text-sm text-muted-foreground">
            Saveik is an independent third-party tool. We are <strong>not affiliated</strong> with TikTok,
            Douyin, or ByteDance Ltd. TikTok and the TikTok logo are trademarks of ByteDance Ltd.
            Saveik is intended for personal use only. Please respect copyright and content creators&apos; rights.
          </p>
        </section>
      </main>
    </>
  )
}

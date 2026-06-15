import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Help Center — Saveik TikTok Downloader Support",
  description: "Need help using Saveik? Check our FAQ, send feedback, or find answers to common TikTok downloading questions.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.saveik.com/help-center" },
}

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Saveik Help Center",
      "description": "Get help using Saveik — the free TikTok video downloader. FAQ, troubleshooting, and support resources.",
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.saveik.com" },
        { "@type": "ListItem", "position": 2, "name": "Help Center", "item": "https://www.saveik.com/help-center" },
      ],
    },
  ],
}

export default function HelpCenterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black tracking-tight mb-6">Help Center</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Need assistance using Saveik? Start by checking the FAQ for answers to common questions.
          If you can&apos;t find what you&apos;re looking for, send us feedback.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Link href="/faq" className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-violet-500/30 transition-all">
            <h2 className="text-lg font-bold mb-2">📋 FAQ</h2>
            <p className="text-sm text-muted-foreground">Answers to common questions about downloading, formats, and legality.</p>
          </Link>
          <Link href="/feedback" className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-violet-500/30 transition-all">
            <h2 className="text-lg font-bold mb-2">💬 Send Feedback</h2>
            <p className="text-sm text-muted-foreground">Report bugs, suggest features, or share your experience.</p>
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Tips</h2>
          {[
            "Copy any TikTok video link by tapping the Share button, then Copy Link.",
            "Paste the link into the download box on the homepage and click Download.",
            "Choose MP4 for video or MP3 for audio-only downloads.",
            "Downloads work on iPhone, Android, PC, and Mac — no app needed.",
            "Videos save in HD quality without watermarks.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-violet-400 font-bold">{i + 1}.</span>
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

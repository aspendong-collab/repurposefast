import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feedback — Saveik TikTok Downloader",
  description: "Share your feedback about Saveik. Report bugs, suggest features, or tell us about your experience using the free TikTok video downloader.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.saveik.com/feedback" },
}

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Saveik Feedback",
      "description": "Send feedback about Saveik — the free TikTok video downloader with no watermark.",
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.saveik.com" },
        { "@type": "ListItem", "position": 2, "name": "Feedback", "item": "https://www.saveik.com/feedback" },
      ],
    },
  ],
}

export default function FeedbackPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black tracking-tight mb-4">Feedback</h1>
        <p className="text-muted-foreground mb-8">
          We value your feedback! Share suggestions, report bugs, or tell us about your experience using Saveik.
          Your input helps improve the service for everyone.
        </p>

        <form className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email (optional)</label>
            <input
              id="email" type="email" placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
            <textarea
              id="message" rows={6} placeholder="Enter your feedback here..."
              className="w-full border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            ></textarea>
          </div>
          <button
            type="submit" disabled
            className="px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium opacity-60 cursor-not-allowed"
            title="Coming soon"
          >
            Submit Feedback
          </button>
        </form>
      </main>
    </>
  )
}

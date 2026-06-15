import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saveik FAQ — Frequently Asked Questions | Free TikTok Downloader",
  description: "Answers to common questions about Saveik. Is it free? Is it legal? What formats? How does it work? No registration, no limits.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.saveik.com/faq" },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Saveik free?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes, Saveik is completely free to use. There are no hidden fees, subscriptions, or limits. Download as many TikTok videos as you want without watermarks." }
    },
    {
      "@type": "Question",
      "name": "Is it legal to download TikTok videos?",
      "acceptedAnswer": { "@type": "Answer", "text": "Downloading videos for personal use is generally acceptable. However, you should not redistribute or use the content commercially without permission from the creator. Saveik is intended for personal use only." }
    },
    {
      "@type": "Question",
      "name": "What formats can I download?",
      "acceptedAnswer": { "@type": "Answer", "text": "You can download TikTok content as MP4 videos (HD, no watermark), MP3 audio files, or JPG/PNG images depending on the original content type." }
    },
    {
      "@type": "Question",
      "name": "Do you store the downloaded videos?",
      "acceptedAnswer": { "@type": "Answer", "text": "No, we don't store any downloaded videos or user data on our servers. Videos download directly from TikTok's servers to your device. Saveik never retains copies." }
    },
    {
      "@type": "Question",
      "name": "Do I need to create an account?",
      "acceptedAnswer": { "@type": "Answer", "text": "No registration required. Just paste your TikTok link, click download, and save. Saveik works instantly with no sign-up." }
    },
  ]
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h1>

        {[
          { q: "Is Saveik free?", a: "Yes, Saveik is completely free to use. There are no hidden fees, subscriptions, or download limits. Download as many TikTok videos as you want — no watermarks, HD quality." },
          { q: "Is it legal to download TikTok videos?", a: "Downloading videos for personal use is generally acceptable. However, you should not redistribute or use the content commercially without permission from the creator. Saveik is intended for personal use only." },
          { q: "What formats can I download?", a: "You can download TikTok content as MP4 videos (HD, no watermark), MP3 audio files, or JPG/PNG images depending on the original content type." },
          { q: "Do you store the downloaded videos?", a: "No, we don't store any downloaded videos or user data on our servers. Videos download directly from TikTok's servers to your device. Saveik never retains copies." },
          { q: "Do I need to create an account?", a: "No registration required. Just paste your TikTok link, click download, and save. Saveik works instantly on any device — iPhone, Android, PC." },
          { q: "What quality are the downloads?", a: "Videos download in the highest available quality — up to 1080p HD. No compression, no watermarks added by Saveik." },
          { q: "Can I download TikTok audio only?", a: "Yes! Choose MP3 format when downloading to save just the audio. Perfect for saving music, podcasts, or voiceovers." },
          { q: "Does it work on my phone?", a: "Yes — Saveik works on iPhone (Safari), Android (Chrome), PC, and Mac. No app installation needed." },
        ].map(({ q, a }, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-6">
            <h2 className="text-lg font-semibold mb-2">{q}</h2>
            <p className="text-muted-foreground">{a}</p>
          </div>
        ))}
      </main>
    </>
  )
}

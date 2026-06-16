import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://repurposefast.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7c3aed',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RePurposeFast — AI Video Content Repurposing | One Video, Multi-Platform',
    template: '%s | RePurposeFast',
  },
  description:
    'AI-powered content repurposing tool. Turn one video into blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes, newsletters, SRT subtitles, and more. 63+ languages, 10 output formats.',
  keywords: [
    'AI content repurposing', 'video to blog', 'video to article', 'YouTube transcription',
    'speech to text', 'content repurposing tool', 'multi-platform content',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'RePurposeFast — AI Video Content Repurposing',
    description: 'Turn one video into your entire multi-platform content strategy. AI-powered, 63+ languages.',
    siteName: 'RePurposeFast',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RePurposeFast — AI Video Content Repurposing',
    description: 'Turn one video into your entire multi-platform content strategy.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}

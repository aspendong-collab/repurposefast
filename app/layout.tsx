import type { Metadata, Viewport } from 'next'
import { LocaleProvider } from '@/hooks/use-locale'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8b5cf6',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ailomo — AI Video Content Repurposing | Turn One Video Into Multi-Platform Content',
    template: '%s | ailomo',
  },
  description: 'AI-powered content repurposing tool. Turn one video into blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes, newsletters, SRT subtitles, and more. 63+ languages.',
  keywords: ['AI content repurposing', 'video to blog', 'speech to text', 'content creation', 'multi-platform content', 'video transcription'],
  openGraph: {
    type: 'website', locale: 'en_US', url: siteUrl,
    title: 'ailomo — AI Video Content Repurposing',
    description: 'Turn one video into your entire content strategy. Free to start.',
    siteName: 'ailomo',
  },
  twitter: { card: 'summary_large_image', title: 'ailomo — AI Content Repurposing', description: 'Turn one video into your entire content strategy.' },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="preconnect" href="https://api.deepseek.com" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}

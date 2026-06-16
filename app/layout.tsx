import type { Metadata, Viewport } from 'next'
import { LocaleProvider } from '@/hooks/use-locale'
import {
  SoftwareApplicationSchema,
  OrganizationSchema,
  WebSiteSchema,
} from '@/components/seo/schemas'
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
    default: 'ailomo — Turn One Video Into Multi-Platform Content | AI Content Repurposing',
    template: '%s | ailomo',
  },
  description:
    'AI-powered content repurposing. Paste a link → get blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes & more. 63 languages. Free to start.',
  keywords: [
    'AI content repurposing',
    'video to blog',
    'video to article',
    'speech to text',
    'content creation tool',
    'multi-platform content',
    'video transcription',
    'YouTube to blog post',
    'podcast to article',
    'AI content writer',
  ],
  authors: [{ name: 'ailomo' }],
  creator: 'ailomo',
  publisher: 'ailomo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ailomo',
    title: 'ailomo — AI Video Content Repurposing',
    description: 'Turn one video into your entire content strategy. Free to start.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ailomo — AI Content Repurposing',
    description: 'Turn one video into your entire content strategy.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      zh: `${siteUrl}/zh`,
      ja: `${siteUrl}/ja`,
      ko: `${siteUrl}/ko`,
      es: `${siteUrl}/es`,
      fr: `${siteUrl}/fr`,
      de: `${siteUrl}/de`,
      pt: `${siteUrl}/pt`,
      ar: `${siteUrl}/ar`,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="preconnect" href="https://api.deepseek.com" />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}

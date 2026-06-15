import type React from "react"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DefaultLocaleProvider } from "@/components/default-locale-provider"
import { defaultLocale, locales } from "@/lib/i18n"

const isProduction = process.env.VERCEL_ENV === "production" || !process.env.VERCEL

const siteConfig = {
  name: "Saveik",
  description:
    "Saveik is a free TikTok video downloader. Download TikTok videos without watermark in HD quality. Save as MP4 or MP3. No app installation, no registration required. Works on all devices.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
    .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
    .replace(/\/\/saveik\.com/, "//www.saveik.com"),
  ogImage: "/og-image.png",
  keywords: [
    "TikTok downloader",
    "download TikTok video",
    "TikTok no watermark",
    "TikTok video downloader",
    "saveik",
    "download TikTok without watermark",
    "TikTok to MP4",
    "TikTok to MP3",
    "save TikTok video",
    "free TikTok downloader",
    "TikTok video saver",
    "online TikTok downloader",
    "download TikTok HD",
    "TikTok MP4 download",
    "TikTok MP3 converter",
    "TikTok photo download",
    "remove TikTok watermark",
    "download TikTok videos free",
    "TikTok download without app",
    "TikTok download for iPhone",
    "TikTok download for Android",
    "TikTok download for PC",
  ],
}

// Build hreflang map: en → https://www.saveik.com, id → https://www.saveik.com/id, ...
const hreflangLanguages: Record<string, string> = Object.fromEntries(
  locales.map((l) => [
    l,
    l === defaultLocale ? siteConfig.url : `${siteConfig.url}/${l}`,
  ])
) as Record<string, string>
hreflangLanguages["x-default"] = siteConfig.url

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7c3aed',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Download TikTok Videos Without Watermark | Free HD TikTok Downloader`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Saveik" }],
  creator: "Saveik",
  publisher: "Saveik",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — Download TikTok Videos Without Watermark`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Saveik — TikTok Video Downloader Without Watermark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Download TikTok Videos Without Watermark`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@saveik",
  },
  robots: isProduction
    ? {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
      },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins — saves ~300ms on first request */}
        <link rel="preconnect" href="https://p16-sign-sg.tiktokcdn.com" />
        <link rel="preconnect" href="https://www.tiktok.com" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="manifest" href="/manifest.json" />
        {/* Hreflang — use lowercase attr via spread (React19 passes through arbitrary lowercase attrs). Google/Bing require lowercase. */}
        {locales.map((l) => (
          <link
            key={l}
            rel="alternate"
            {...({ hreflang: l } as React.LinkHTMLAttributes<HTMLLinkElement>)}
            href={l === defaultLocale ? siteConfig.url : `${siteConfig.url}/${l}`}
          />
        ))}
        <link
          rel="alternate"
          {...({ hreflang: "x-default" } as React.LinkHTMLAttributes<HTMLLinkElement>)}
          href={siteConfig.url}
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <DefaultLocaleProvider>
            {children}
          </DefaultLocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

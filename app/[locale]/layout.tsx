/**
 * Locale-aware Layout — generates per-language SEO metadata
 * and wraps pages with LocaleProvider + translations.
 * Includes automated JSON-LD Structured Data for GEO optimization.
 */
import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LocaleProvider } from "@/components/locale-provider"
import { OrganizationSchema, WebApplicationSchema, HowToSchema, FAQSchema, BreadcrumbListSchema } from "@/components/structured-data"
import { locales, defaultLocale, localeHtmlLang, localeOgLocale, localeLabels, type Locale } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"

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

  const dict = await getDictionary(locale as Locale)
  const lang = localeHtmlLang[locale as Locale]
  const ogLocale = localeOgLocale[locale as Locale]
  const canonical = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`

  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    authors: [{ name: "Saveik" }],
    creator: "Saveik",
    publisher: "Saveik",
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: canonical,
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: "Saveik",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: dict.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og-image.png"],
    },
    robots: process.env.VERCEL_ENV === "production" || !process.env.VERCEL
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
      },
    alternates: {
      canonical,
    },
    category: "technology",
  }
}

/** Server component that injects JSON-LD structured data for GEO */
async function SchemaScript({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  const pageUrl = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`

  const schemas = [
    OrganizationSchema(locale),
    WebApplicationSchema(locale, dict as any),
    HowToSchema(locale, dict as any, pageUrl),
    FAQSchema(dict as any),
    BreadcrumbListSchema([
      { name: localeLabels[locale] || "Home", url: pageUrl },
    ]),
  ]

  const graph = {
    "@context": "https://schema.org",
    "@graph": schemas,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const dict = await getDictionary(locale as Locale)

  return (
    <LocaleProvider locale={locale as Locale} dict={dict}>
      <SchemaScript locale={locale as Locale} />
      {children}
    </LocaleProvider>
  )
}
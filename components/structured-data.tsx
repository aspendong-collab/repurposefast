/**
 * StructuredData — Automated JSON-LD Schema Generator
 * =====================================================
 * Generates all Schema.org types for GEO (Generative Engine Optimization).
 * Optimized for ChatGPT, Perplexity, Google AI Overviews, Claude citations.
 *
 * Schema types:
 *  - WebApplication (tool homepage)
 *  - HowTo (step-by-step guides)
 *  - FAQPage (FAQ sections)
 *  - BreadcrumbList (silo navigation)
 *  - Organization (brand entity)
 */

import type { Locale } from "@/lib/i18n"
import {
  localeLabels,
  localeNative,
  localeHtmlLang,
  localeOgLocale,
} from "@/lib/i18n"

// ============================================================
// Brand Constants
// ============================================================
const BRAND = {
  name: "Saveik",
  url: "https://saveik.com",
  description:
    "Free TikTok video downloader. Download TikTok videos without watermark in HD quality. Save as MP4 or MP3. No registration required.",
  slogan: "Download TikTok Videos Without Watermark",
  foundingDate: "2024",
  sameAs: [
    "https://saveik.com",
  ],
}

const LANGUAGES = [
  "en", "id", "vi", "th", "es", "pt-br",
  "zh", "ja", "ko", "ar", "hi", "fr", "de",
  "ru", "tr", "it", "pl", "nl", "ms", "fil",
] as const

// ============================================================
// Schema Builders
// ============================================================

/** Organization schema — brand entity for Knowledge Graph */
export function OrganizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: locale === "en" ? BRAND.url : `${BRAND.url}/${locale}`,
    description: BRAND.description,
    slogan: BRAND.slogan,
    foundingDate: BRAND.foundingDate,
    sameAs: BRAND.sameAs,
    knowsLanguage: LANGUAGES.map((l) => ({
      "@type": "Language",
      name: localeLabels[l as Locale] || l,
      alternateName: localeNative[l as Locale] || l,
    })),
  }
}

/** WebApplication schema — for tool homepage (critical for GEO) */
export function WebApplicationSchema(locale: Locale, dict: Record<string, any>) {
  const pageUrl = locale === "en" ? BRAND.url : `${BRAND.url}/${locale}`
  const title = dict?.meta?.title || `${BRAND.name} — ${BRAND.slogan}`

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${BRAND.name} — ${title.replace(/\s*\|\s*Saveik$/, "")}`,
    url: pageUrl,
    description: dict?.meta?.description || BRAND.description,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires JavaScript. Works on all modern browsers.",
    featureList: [
      dict?.download?.mp4 || "Download MP4",
      dict?.download?.mp3 || "Download MP3",
      dict?.features?.items?.[0]?.title || "No Watermark",
      dict?.features?.items?.[1]?.title || "HD Quality",
      dict?.features?.items?.[4]?.title || "All Devices",
    ],
    inLanguage: localeHtmlLang[locale] || locale,
    author: {
      "@type": "Organization",
      name: BRAND.name,
      url: BRAND.url,
    },
  }
}

/** HowTo Schema — step-by-step instructions (high GEO citation value) */
export function HowToSchema(
  locale: Locale,
  dict: Record<string, any>,
  pageUrl: string,
) {
  const steps = dict?.howTo?.steps || []
  const stepsSchema = steps.map((step: any, i: number) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.desc,
    url: pageUrl,
  }))

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${dict?.howTo?.title || "How to Download TikTok Videos"} | ${BRAND.name}`,
    description: dict?.howTo?.subtitle || "Download TikTok videos without watermark in 3 simple steps.",
    totalTime: "PT30S",
    supply: {
      "@type": "HowToSupply",
      name: "TikTok Video URL",
    },
    tool: {
      "@type": "HowToTool",
      name: BRAND.name,
      url: pageUrl,
    },
    step: stepsSchema,
  }
}

/** FAQPage Schema — Q&A pairs (engines love extracting these) */
export function FAQSchema(
  dict: Record<string, any>,
) {
  const questions = dict?.faq?.questions || []
  const faqTitle = dict?.faq?.title || "Frequently Asked Questions"

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: faqTitle,
    mainEntity: questions.map((item: any) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  }
}

/** BreadcrumbList Schema — silo navigation */
export function BreadcrumbListSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** SoftwareSourceCode schema — signals code quality to AI engines */
export function SoftwareSourceCodeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: "https://github.com/saveik",
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js",
  }
}

// ============================================================
// Combined Page Schema Generator
// ============================================================

export interface PageSchemaInput {
  locale: Locale
  dict: Record<string, any>
  pageUrl: string
  pageType: "home" | "blog"
  blogMeta?: {
    title: string
    description: string
    datePublished: string
    dateModified: string
    author: string
    breadcrumbs: { name: string; url: string }[]
  }
}

/** Generate complete schema markup for any page type */
export function generatePageSchema(input: PageSchemaInput): Record<string, any>[] {
  const { locale, dict, pageUrl, pageType, blogMeta } = input
  const schemas: Record<string, any>[] = []

  // Always include Organization
  schemas.push(OrganizationSchema(locale))

  if (pageType === "home") {
    // Tool homepage: WebApplication + HowTo + FAQ + Breadcrumb
    schemas.push(WebApplicationSchema(locale, dict))
    schemas.push(HowToSchema(locale, dict, pageUrl))
    schemas.push(FAQSchema(dict))

    const homeLabel = locale === "en" ? "Home" : localeLabels[locale] || "Home"
    schemas.push(
      BreadcrumbListSchema([
        { name: homeLabel, url: pageUrl },
      ]),
    )
  }

  if (pageType === "blog" && blogMeta) {
    // Blog post: TechArticle + Breadcrumb + FAQ
    schemas.push({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: blogMeta.title,
      description: blogMeta.description,
      datePublished: blogMeta.datePublished,
      dateModified: blogMeta.dateModified,
      author: {
        "@type": "Person",
        name: blogMeta.author,
      },
      publisher: {
        "@type": "Organization",
        name: BRAND.name,
        url: BRAND.url,
      },
      inLanguage: localeHtmlLang[locale] || locale,
      about: {
        "@type": "SoftwareApplication",
        name: "TikTok",
        applicationCategory: "SocialMediaApplication",
      },
      mainEntityOfPage: pageUrl,
    })

    schemas.push(BreadcrumbListSchema(blogMeta.breadcrumbs))
  }

  return schemas
}

// ============================================================
// React Component: StructuredData
// ============================================================

export function StructuredData({
  schemas,
}: {
  schemas: Record<string, any>[]
}) {
  // For homepage, combine all schemas into a @graph
  const graph = {
    "@context": "https://schema.org",
    "@graph": schemas,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph, null, 0),
      }}
    />
  )
}

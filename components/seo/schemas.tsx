// ── JSON-LD Structured Data Components ──────────────────────────────────────
// Critical for GEO: AI crawlers (Perplexity, ChatGPT, Gemini) consume
// structured data to understand and cite your content.

export function SoftwareApplicationSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ailomo',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '39',
      priceCurrency: 'USD',
      offerCount: '3',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '250',
      bestRating: '5',
    },
    description:
      'AI-powered content repurposing tool. Turn one video into blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes, and more in 63+ languages.',
    url: 'https://ailomo.com',
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem', position: i + 1, name: item.name, item: item.url,
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function HowToSchema({ name, steps }: { name: string; steps: string[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((text, i) => ({
      '@type': 'HowToStep', position: i + 1, text,
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function ArticleSchema({
  headline, description, datePublished, dateModified, author, url, keywords,
}: {
  headline: string; description: string; datePublished: string; dateModified: string
  author?: string; url: string; keywords: string[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished,
    dateModified,
    author: { '@type': 'Person', name: author || 'ailomo' },
    publisher: {
      '@type': 'Organization', name: 'ailomo', url: 'https://ailomo.com',
      logo: { '@type': 'ImageObject', url: 'https://ailomo.com/logo.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: keywords.join(', '),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function VideoObjectSchema({ name, description, thumbnailUrl, uploadDate }: {
  name: string; description: string; thumbnailUrl?: string; uploadDate?: string
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(uploadDate ? { uploadDate } : {}),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function SpeakableSchema({ cssSelector = 'h1, h2, .speakable' }: { cssSelector?: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: cssSelector.split(', ').map((s) => s.trim()),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function OrganizationSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ailomo',
    url: 'https://ailomo.com',
    logo: 'https://ailomo.com/logo.svg',
    sameAs: [
      'https://github.com/aspendong-collab/repurposefast',
      'https://ailomo.com',
    ],
    knowsAbout: [
      'AI Content Repurposing',
      'Speech-to-Text Transcription',
      'Content Marketing Automation',
      'Multi-Platform Content Distribution',
      'Video Content Strategy',
      'YouTube SEO',
      'Podcast Content Marketing',
      'Social Media Content Creation',
    ],
    description: 'AI content repurposing platform — turn one video into multi-platform content matrix.',
    foundingDate: '2025',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hi@ailomo.com',
      contactType: 'customer support',
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function WebSiteSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ailomo',
    url: 'https://ailomo.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://ailomo.com/tools/{search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

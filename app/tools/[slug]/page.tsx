import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toolPages, type ToolPageConfig } from '../generate-seo-pages'
import { BreadcrumbSchema, HowToSchema, FAQSchema } from '@/components/seo/schemas'
import { RelatedBlogs } from '@/components/seo/crosslinks'

// Generate static params for all tool pages
export function generateStaticParams() {
  return toolPages.map((page) => ({ slug: page.slug }))
}

// Dynamic metadata per page with GEO-optimized fields
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = toolPages.find((p) => p.slug === slug)
  if (!page) return { title: 'Not Found' }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

  return {
    title: page.title,
    description: page.description,
    keywords: [
      page.badge.replace('→', 'to'),
      page.badge,
      'AI tool',
      'free online tool',
      'no signup',
    ],
    openGraph: {
      title: page.ogTitle,
      description: page.ogDescription,
      type: 'article',
      url: `${siteUrl}/tools/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.ogTitle,
      description: page.ogDescription,
    },
    alternates: { canonical: `/tools/${slug}` },
    robots: { index: true, follow: true },
    other: {
      // GEO: structured content signal for AI crawlers
      'ailomo:tool': page.badge,
      'ailomo:category': 'content-repurposing',
    },
  }
}

// Auto-generate FAQ from features
function generateFAQ(page: ToolPageConfig) {
  return page.features.map((f) => ({
    question: `How does ${page.badge.split('→')[0]?.trim() || 'this tool'} help with ${f.title}?`,
    answer: f.desc,
  }))
}

// Auto-generate HowTo steps
function generateHowTo(page: ToolPageConfig) {
  return [
    {
      name: 'Paste or upload your content',
      text: `Go to ailomo.com and paste a video link or upload an audio/video file. No signup required for the first 3 conversions.`,
    },
    {
      name: 'AI processes and transcribes',
      text: `Our AI automatically transcribes the audio and understands the content structure. Supports 63+ languages with high accuracy.`,
    },
    {
      name: `Get your ${page.badge.split('→')[1]?.trim() || 'content'}`,
      text: `Download or copy your formatted ${page.badge.split('→')[1]?.trim() || 'content'}. Review and refine with our AI chat assistant.`,
    },
  ]
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = toolPages.find((p) => p.slug === slug)

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <Link href="/" className="mt-4 inline-block text-violet-400 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const faqItems = generateFAQ(page)
  const howToSteps = generateHowTo(page)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Structured Data ── */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Tools', url: `${siteUrl}/tools` },
          { name: page.badge, url: `${siteUrl}/tools/${slug}` },
        ]}
      />
      <HowToSchema name={page.h1} steps={[
        `Paste your video link or upload a file`,
        `AI automatically transcribes and processes the content`,
        `Get your ${page.badge.split('→')[1]?.trim() || 'output'} instantly`,
      ]} />
      <FAQSchema questions={faqItems} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-violet-400 transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/tools" className="hover:text-violet-400 transition-colors">Tools</Link></li>
              <li>/</li>
              <li className="text-violet-300">{page.badge.split('→')[0]?.trim()}</li>
            </ol>
          </nav>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.04] px-4 py-1.5 text-sm text-violet-300 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            {page.badge}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {page.h1}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {page.description}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.97]"
          >
            Try Free Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-8">
        <h2 className="mb-8 text-center text-2xl font-bold">Key Features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {page.features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.01] p-6 hover:border-violet-500/15 transition-all duration-300"
            >
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ (GEO-optimized) ── */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.01]"
            >
              <summary className="cursor-pointer px-6 py-4 font-medium text-sm list-none flex items-center justify-between">
                {faq.question}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-6 pb-4 text-sm text-muted-foreground/70 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
        <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.04] p-8 sm:p-12">
          <h2 className="text-2xl font-bold">Ready to try it?</h2>
          <p className="mt-3 text-muted-foreground">Free to start. No credit card required.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.97]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Related Tools (internal linking) ── */}
      <section className="mx-auto max-w-4xl px-4 pb-12">
        <h2 className="mb-4 text-lg font-semibold">Explore More Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {toolPages
            .filter((p) => p.slug !== slug)
            .slice(0, 6)
            .map((related) => (
              <Link
                key={related.slug}
                href={`/tools/${related.slug}`}
                className="rounded-lg border border-white/[0.06] p-4 text-sm transition-all hover:border-violet-500/15 hover:bg-white/[0.02]"
              >
                <span className="font-medium">{related.badge.split('→')[0]?.trim()}</span>
                <span className="mx-1 text-muted-foreground">→</span>
                <span className="text-muted-foreground">{related.badge.split('→')[1]?.trim()}</span>
              </Link>
            ))}
        </div>
      </section>

      {/* ── Related Blog Posts (AI-matched cross-links) ── */}
      <RelatedBlogs slug={slug} />
    </div>
  )
}

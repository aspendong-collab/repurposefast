import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toolPages, type ToolPageConfig } from '../generate-seo-pages'

// Generate static params for all tool pages
export function generateStaticParams() {
  return toolPages.map((page) => ({
    slug: page.slug,
  }))
}

// Generate metadata per page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = toolPages.find((p) => p.slug === slug)
  if (!page) return { title: 'Not Found' }

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.ogTitle,
      description: page.ogDescription,
    },
    alternates: {
      canonical: `/tools/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
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
          <h1 className="text-2xl font-bold">页面未找到</h1>
          <Link href="/tools" className="mt-4 inline-block text-primary hover:underline">
            返回工具列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            {page.badge}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {page.h1}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {page.description.slice(0, 150)}...
          </p>
          <Link
            href="/repurpose"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            免费试用
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 pt-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {page.features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:p-12">
          <h2 className="text-2xl font-bold">准备好试试了吗？</h2>
          <p className="mt-3 text-muted-foreground">
            免费试用，无需信用卡。
          </p>
          <Link
            href="/repurpose"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            立即开始
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Related tools */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="mb-4 text-lg font-semibold">更多工具</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {toolPages
            .filter((p) => p.slug !== slug)
            .slice(0, 6)
            .map((related) => (
              <Link
                key={related.slug}
                href={`/tools/${related.slug}`}
                className="rounded-lg border p-4 text-sm transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <span className="font-medium">{related.badge.split('→')[0].trim()}</span>
                <span className="mx-1 text-muted-foreground">→</span>
                <span>{related.badge.split('→')[1]?.trim()}</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}

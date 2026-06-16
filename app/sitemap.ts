import type { MetadataRoute } from 'next'
import { toolPages } from './tools/generate-seo-pages'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

// Blog slugs — generated at build time
const blogSlugs: string[] = [] // populated by generateBlogSitemap()

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date()

  // Core pages
  const core: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/tools`, lastModified: today, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${siteUrl}/privacy`, lastModified: today, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: today, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Tool landing pages (12)
  const tools: MetadataRoute.Sitemap = toolPages.map((p) => ({
    url: `${siteUrl}/tools/${p.slug}`,
    lastModified: today,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Language alternates for tool pages
  const locales = ['en','zh','ja','ko','es','fr','de','pt','ar','hi','id','th','vi','ru','it']
  const langPages: MetadataRoute.Sitemap = []
  for (const p of toolPages) {
    for (const lang of locales) {
      langPages.push({
        url: `${siteUrl}/${lang}/tools/${p.slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }
  }

  // Blog posts
  const blogs: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...core, ...tools, ...langPages, ...blogs]
}

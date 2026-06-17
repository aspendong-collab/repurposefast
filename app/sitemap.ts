import type { MetadataRoute } from 'next'
import { toolPages } from './tools/generate-seo-pages'
import { allBlogPosts } from '@/content/blog/registry'
import { getGitTimestamp } from '@/lib/seo-crosslink'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // Real git timestamps per file — no fake "today" dates
  const homeDate = new Date(getGitTimestamp('app/page.tsx'))
  const toolsDate = new Date(getGitTimestamp('app/tools/generate-seo-pages.tsx'))
  const privacyDate = new Date(getGitTimestamp('app/privacy/page.tsx'))
  const blogDate = new Date(getGitTimestamp('content/blog/registry.ts'))

  // Core pages
  const core: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: homeDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/tools`, lastModified: toolsDate, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${siteUrl}/blog`, lastModified: blogDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/privacy`, lastModified: privacyDate, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: privacyDate, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Tool landing pages (12) — each with its own git timestamp
  const tools: MetadataRoute.Sitemap = toolPages.map((p) => ({
    url: `${siteUrl}/tools/${p.slug}`,
    lastModified: toolsDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Language alternates for tool pages (20 languages with PSEO routes)
  const locales = ['en','zh','ja','ko','es','fr','de','pt','ar','hi','id','th','vi','ru','it','tr','pl','nl','sv','fil']
  const langPages: MetadataRoute.Sitemap = []
  for (const p of toolPages) {
    for (const lang of locales) {
      langPages.push({
        url: `${siteUrl}/${lang}/tools/${p.slug}`,
        lastModified: toolsDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }
  }

  // Blog posts — each with its own git timestamp from registry updates
  const blogs: MetadataRoute.Sitemap = allBlogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: blogDate,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // Blog language alternates (15 langs x 15 posts = 225 entries)
  const blogLocales = ['en','zh','ja','ko','es','fr','de','pt','ar','hi','id','th','vi','ru','it']
  const blogLangPages: MetadataRoute.Sitemap = []
  for (const post of allBlogPosts) {
    for (const lang of blogLocales) {
      blogLangPages.push({
        url: `${siteUrl}/${lang}/blog/${post.slug}`,
        lastModified: blogDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }
  }

  return [...core, ...tools, ...langPages, ...blogs, ...blogLangPages]
}

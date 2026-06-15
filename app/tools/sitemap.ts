import type { MetadataRoute } from 'next'
import { toolPages } from './generate-seo-pages'

/**
 * Generate sitemap entries for all tool pages.
 * This ensures search engines discover all our SEO landing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://repurposefast.com'

  const toolEntries: MetadataRoute.Sitemap = toolPages.map((page) => ({
    url: `${baseUrl}/tools/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Main pages
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/repurpose`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  return [...mainPages, ...toolEntries]
}

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saveik.com')
        .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
        .replace(/\/\/saveik\.com/, "//www.saveik.com")

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/private/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
            },
            // AI Crawlers — critical for GEO (Generative Engine Optimization)
            {
                userAgent: 'GPTBot',
                allow: '/',
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
            },
            {
                userAgent: 'Applebot',
                allow: '/',
            },
            {
                userAgent: 'Bytespider',
                allow: '/',  // ByteDance (TikTok) crawler
            },
            // Additional AI crawlers for GEO coverage
            {
                userAgent: 'Google-Extended',
                allow: '/',  // Controls Google AI Overviews / Gemini training
            },
            {
                userAgent: 'CCBot',
                allow: '/',  // Common Crawl (used by many AI training datasets)
            },
            {
                userAgent: 'FacebookBot',
                allow: '/',  // Meta AI crawling
            },
            {
                userAgent: 'cohere-ai',
                allow: '/',  // Cohere training data
            },
            {
                userAgent: 'GoogleOther',
                allow: '/',  // Google research crawler
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}

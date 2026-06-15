/**
 * Multilingual Sitemap Generator
 * ==============================
 * Next.js 15 native sitemap API — dynamically generates sitemap.xml
 * with all 20 locales, blog posts, static pages, local SEO pages, and About pages.
 */

import { type MetadataRoute } from "next"
import { locales, defaultLocale } from "@/lib/i18n"
import { getAllBlogPosts } from "@/lib/blog"
import { localPages } from "@/lib/local-seo-data"
import { cityPages } from "@/lib/city-data"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  const today = new Date().toISOString()

  // ── 20 Locale Homepages ──
  for (const locale of locales) {
    const url = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`
    const alternates: Record<string, string> = {}
    for (const l of locales) {
      alternates[l] = l === defaultLocale ? siteUrl : `${siteUrl}/${l}`
    }

    entries.push({
      url,
      lastModified: today,
      changeFrequency: "daily",
      priority: locale === defaultLocale ? 1.0 : 0.9,
      alternates: { languages: alternates },
    })
  }

  // ── Blog Listing Pages (20 locales) ──
  for (const locale of locales) {
    const url = locale === defaultLocale
      ? `${siteUrl}/blog`
      : `${siteUrl}/${locale}/blog`
    entries.push({
      url,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  }

  // ── Blog Posts (all locales) ──
  const posts = getAllBlogPosts()
  for (const post of posts) {
    const url = post.locale === defaultLocale
      ? `${siteUrl}/blog/${post.slug}`
      : `${siteUrl}/${post.locale}/blog/${post.slug}`
    entries.push({
      url,
      lastModified: post.dateModified || post.datePublished,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  // ── Local SEO Landing Pages ──
  for (const [locale, pages] of Object.entries(localPages)) {
    for (const page of pages) {
      entries.push({
        url: `${siteUrl}/${locale}/local/${page.slug}`,
        lastModified: today,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  // ── About Pages (20 locales) ──
  for (const locale of locales) {
    const url = locale === defaultLocale
      ? `${siteUrl}/about`
      : `${siteUrl}/${locale}/about`
    entries.push({
      url,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  }

  // ── Static Pages ──
  const staticPages = [
    { path: "/terms", priority: 0.3, freq: "monthly" as const },
    { path: "/privacy", priority: 0.3, freq: "monthly" as const },
    { path: "/faq", priority: 0.5, freq: "weekly" as const },
    { path: "/help-center", priority: 0.4, freq: "monthly" as const },
    { path: "/feedback", priority: 0.3, freq: "monthly" as const },
  ]
  for (const { path, priority, freq } of staticPages) {
    entries.push({
      url: `${siteUrl}${path}`,
      lastModified: today,
      changeFrequency: freq,
      priority,
    })
  }

  // ── City-Level Landing Pages (programmatic SEO) ──
  for (const [locale, cities] of Object.entries(cityPages)) {
    for (const city of cities) {
      entries.push({
        url: locale === defaultLocale
          ? `${siteUrl}/city/${city.slug}`
          : `${siteUrl}/${locale}/city/${city.slug}`,
        lastModified: today,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })
    }
  }

  return entries
}

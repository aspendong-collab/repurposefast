/**
 * i18n Middleware — auto-detects locale and handles routing
 *
 * Strategy:
 * - / → detect from Accept-Language, serve EN (no redirect)
 * - /id, /vi, /th, /es, /pt-br → explicit locale pages
 * - Static assets & API routes pass through untouched
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale, detectLocale, getLocaleFromPath } from "./lib/i18n"

// Paths that should NOT be localized
const SKIP_PATTERNS = [
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/logo.svg",
  "/og-image.png",
  "/fonts/",
  ".svg",
  ".png",
  ".jpg",
  ".ico",
]

// Static pages that exist at root level (not under [locale])
const ROOT_PAGES = [
  "/terms",
  "/privacy",
  "/faq",
  "/help-center",
  "/feedback",
  "/repurpose",
  "/tools",
]

function shouldSkip(pathname: string): boolean {
  return SKIP_PATTERNS.some((p) => pathname.startsWith(p) || pathname.includes(p))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and API routes
  if (shouldSkip(pathname)) return NextResponse.next()

  // Skip root-level static pages (terms, privacy, faq, etc.)
  if (ROOT_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  // Check if path already has a locale prefix
  const { locale: urlLocale } = getLocaleFromPath(pathname)
  const hasLocalePrefix = locales.includes(pathname.split("/")[1] as any)
  const isRoot = pathname === "/"

  if (hasLocalePrefix && urlLocale !== defaultLocale) {
    // Already on a locale-specific path (e.g., /id/blog) — pass through
    return NextResponse.next()
  }

  // Detect preferred locale
  const acceptLang = request.headers.get("accept-language")
  const detected = detectLocale(acceptLang)
  const targetLocale = hasLocalePrefix ? urlLocale : detected

  // Root path: redirect non-English users (307 — user language may change)
  if (isRoot) {
    if (detected === defaultLocale) return NextResponse.next()
    const newUrl = new URL(request.url)
    newUrl.pathname = `/${detected}`
    return NextResponse.redirect(newUrl, 307)
  }

  // Non-root path without locale prefix (e.g., /blog, /about):
  // Use INTERNAL REWRITE instead of redirect — keeps the URL clean for SEO.
  // Google sees /blog (200 OK), contentcomes from /[defaultLocale]/blog.
  // This breaks the redirect chain that was preventing indexing.
  if (!hasLocalePrefix) {
    const newUrl = new URL(request.url)
    newUrl.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.rewrite(newUrl)
  }

  // Has locale prefix — pass through
  return NextResponse.next()
}

export const config = {
  // Match all paths except static files
  matcher: ["/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|ico|txt|xml)).*)"],
}
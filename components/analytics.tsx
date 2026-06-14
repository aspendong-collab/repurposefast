/**
 * GA4 Analytics Component
 * ========================
 * Lightweight Google Analytics 4 integration for Next.js App Router.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local to activate.
 *
 * 1. Add <Analytics /> to root layout <body>
 * 2. Track key events:
 *    - download_started  (user clicks Download)
 *    - download_success  (video fetched successfully)
 *    - download_failed   (error occurred)
 *    - locale_switch     (user changes language)
 *    - blog_view         (user reads a blog post)
 *    - local_page_view   (user visits local SEO page)
 */

"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/** Page view tracking — call from any client component */
export function usePageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (!MEASUREMENT_ID || typeof window === "undefined") return

    const gtag = (window as any).gtag
    if (!gtag) return

    // Detect locale from pathname: /id/xxx → id, /xxx → en
    const locale = pathname.match(/^\/([a-z]{2}(-[a-z]{2})?)\//)
      ? pathname.split("/")[1]
      : "en"

    gtag("event", "page_view", {
      page_path: pathname,
      page_title: document.title,
      page_locale: locale,
    })

    // Detect if this is a local SEO page
    if (pathname.includes("/local/")) {
      gtag("event", "local_page_view", {
        page_path: pathname,
        country: pathname.split("/local/")[1] || "unknown",
        locale,
      })
    }

    // Detect blog page
    if (pathname.includes("/blog/")) {
      gtag("event", "blog_view", {
        page_path: pathname,
        slug: pathname.split("/blog/")[1] || "unknown",
        locale,
      })
    }

    prevPath.current = pathname
  }, [pathname, searchParams])
}

/** Track a custom event */
export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return
  const gtag = (window as any).gtag
  if (gtag) gtag("event", name, params)
}

/** GA4 Script loader */
export function Analytics() {
  if (!MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}', {
  page_path: window.location.pathname,
  send_page_view: false,
  cookie_flags: 'SameSite=None;Secure',
  anonymize_ip: true
});`}
      </Script>
    </>
  )
}

/**
 * Quick-start instructions:
 *
 * 1. Create GA4 property at https://analytics.google.com
 *    → Admin → Data Streams → Web → enter saveik.com
 *    → Copy Measurement ID (G-XXXXXXXXXX)
 *
 * 2. Add to .env.local:
 *    NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * 3. Add <Analytics /> to root layout:
 *
 *    // app/layout.tsx
 *    import { Analytics } from "@/components/analytics"
 *    export default function RootLayout({ children }) {
 *      return (
 *        <html>
 *          <body>
 *            {children}
 *            <Analytics />
 *          </body>
 *        </html>
 *      )
 *    }
 *
 * 4. Optional: Track custom events in any component:
 *    import { trackEvent } from "@/components/analytics"
 *    trackEvent("download_started", { video_url: url })
 */

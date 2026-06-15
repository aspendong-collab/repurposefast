"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

const PUBLISHER_ID = "ca-pub-2085357111333686"

/**
 * AdSense Auto Ads script — loads once in root layout.
 */
export function AdSenseScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
      crossOrigin="anonymous"
    />
  )
}

/**
 * Manual ad unit with optional fallback for unfilled slots.
 *
 * When AdSense doesn't fill the slot (data-ad-status="unfilled"),
 * the fallback content is shown automatically — no wasted impressions.
 *
 * Props:
 *  - slot:      AdSense ad unit ID
 *  - format:    "auto" | "rectangle" | "horizontal" | "vertical"
 *  - className: wrapper styling
 *  - fallback:  ReactNode shown when ad is unfilled or blocked
 */
export function AdUnit({
  slot,
  format = "auto",
  className = "",
  fallback,
}: {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical"
  className?: string
  fallback?: ReactNode
}) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (initialized.current || !adRef.current) return
    initialized.current = true

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Ad blocker
      if (fallback) setShowFallback(true)
    }
  }, [fallback])

  // Watch for unfilled status (ssstik.io pattern)
  useEffect(() => {
    if (!fallback || !adRef.current) return
    const ins = adRef.current

    if (ins.getAttribute("data-ad-status") === "unfilled") {
      setShowFallback(true)
      return
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.attributeName === "data-ad-status" &&
          ins.getAttribute("data-ad-status") === "unfilled"
        ) {
          observer.disconnect()
          setShowFallback(true)
          return
        }
      }
    })
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] })

    // Timeout: if no status after 3s, show fallback
    const timer = setTimeout(() => {
      if (!ins.getAttribute("data-ad-status")) {
        setShowFallback(true)
      }
    }, 3000)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [slot, fallback])

  // Re-init on route changes
  useEffect(() => {
    try {
      if (adRef.current && adRef.current.innerHTML === "") {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch {}
  }, [slot])

  if (showFallback && fallback) {
    return <div className={className}>{fallback}</div>
  }

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: slot ? "90px" : "0" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"

const PUBLISHER_ID = "ca-pub-2085357111333686"

/**
 * AdSense Auto Ads script — loads once in root layout.
 * Enables Google to automatically place ads in optimal positions.
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
 * Manual ad unit — place this component wherever you want a fixed ad slot.
 *
 * Props:
 *  - slot:    AdSense ad unit ID (from your AdSense dashboard → Ads → Ad units)
 *  - format:  "auto" | "rectangle" | "horizontal" | "vertical" (default: "auto")
 *  - className: optional wrapper styling
 *
 * Usage:
 *  <AdUnit slot="1234567890" format="rectangle" className="my-8" />
 */
export function AdUnit({
  slot,
  format = "auto",
  className = "",
}: {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical"
  className?: string
}) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double-init in React Strict Mode
    if (initialized.current || !adRef.current) return
    initialized.current = true

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      // AdSense blocked by ad-blocker — silently ignore
    }
  }, [])

  // Re-initialize on route changes (Next.js client navigation)
  useEffect(() => {
    const pushAd = () => {
      try {
        if (adRef.current && adRef.current.innerHTML === "") {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        }
      } catch {}
    }
    pushAd()
  }, [slot])

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

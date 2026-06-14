"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { locales, defaultLocale, localeNative, type Locale } from "@/lib/i18n"

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Detect current locale from pathname
  const currentLocale: Locale =
    (locales.find((l) => pathname.startsWith(`/${l}`)) as Locale) || defaultLocale

  const switchTo = (locale: Locale) => {
    setOpen(false)
    if (locale === currentLocale) return

    // Build new path
    let newPath = pathname
    if (currentLocale !== defaultLocale) {
      newPath = pathname.replace(`/${currentLocale}`, "") || "/"
    }
    if (locale !== defaultLocale) {
      newPath = `/${locale}${newPath === "/" ? "" : newPath}`
    }
    router.push(newPath)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNative[currentLocale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchTo(locale)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-muted/50 flex items-center gap-2 ${
                locale === currentLocale
                  ? "text-violet-400 font-medium"
                  : "text-foreground"
              }`}
            >
              {localeNative[locale]}
              {locale === currentLocale && (
                <span className="ml-auto text-xs text-violet-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
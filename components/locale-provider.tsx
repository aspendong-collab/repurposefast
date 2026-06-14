"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Locale } from "@/lib/i18n"
import { localeLabels, localeNative, defaultLocale } from "@/lib/i18n"
import type { Dictionary } from "@/lib/dictionaries"

type LocaleContextType = {
  locale: Locale
  dict: Dictionary
  /** Build a URL with the current locale prefix */
  localizePath: (path: string) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

/** Get locale display name */
export function getLocaleLabel(locale: Locale) {
  return localeLabels[locale] || locale
}

export function getLocaleNative(locale: Locale) {
  return localeNative[locale] || locale
}

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale
  dict: Dictionary
  children: ReactNode
}) {
  const localizePath = (path: string) => {
    if (locale === defaultLocale) return path
    return `/${locale}${path}`
  }

  return (
    <LocaleContext.Provider value={{ locale, dict, localizePath }}>
      {children}
    </LocaleContext.Provider>
  )
}
"use client"

import type React from "react"
import { LocaleProvider } from "@/components/locale-provider"
import { defaultLocale } from "@/lib/i18n"
import type { Dictionary } from "@/lib/dictionaries"
import enDict from "@/dictionaries/en.json"

/**
 * DefaultLocaleProvider — wraps children with English LocaleProvider
 * Used in root layout so that `useLocale()` never throws.
 */
export function DefaultLocaleProvider({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale={defaultLocale} dict={enDict as Dictionary}>
      {children}
    </LocaleProvider>
  )
}
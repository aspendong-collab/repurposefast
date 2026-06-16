'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Locale } from '@/lib/i18n'
import { defaultLocale, localeMap } from '@/lib/i18n'
import type { Dictionary } from '@/lib/dictionary'
import enDict from '@/dictionaries/en.json'

interface LocaleContextType {
  locale: Locale
  dict: Dictionary
  setLocale: (l: Locale) => void
  t: (path: string) => string
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  dict: enDict as unknown as Dictionary,
  setLocale: () => {},
  t: () => '',
})

function getFromPath(obj: any, path: string): string {
  const parts = path.split('.')
  let current = obj
  for (const p of parts) {
    if (current?.[p] === undefined) return path
    current = current[p]
  }
  return typeof current === 'string' ? current : path
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [dict, setDict] = useState<Dictionary>(enDict as unknown as Dictionary)

  // Load saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem('ailomo_locale') as Locale | null
    if (saved && saved in localeMap) {
      setLocaleState(saved)
    }
  }, [])

  // Load dictionary when locale changes
  useEffect(() => {
    if (locale === 'en') {
      setDict(enDict as unknown as Dictionary)
      return
    }
    import(`@/dictionaries/${locale}.json`)
      .then(m => setDict(m.default || m))
      .catch(() => setDict(enDict as unknown as Dictionary))
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem('ailomo_locale', l)
    document.cookie = `ailomo_locale=${l};path=/;max-age=31536000`
    setLocaleState(l)
  }, [])

  const t = useCallback((path: string) => getFromPath(dict, path), [dict])

  return (
    <LocaleContext.Provider value={{ locale, dict, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

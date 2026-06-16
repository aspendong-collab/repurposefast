'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Locale } from '@/lib/i18n'
import { defaultLocale, localeMap } from '@/lib/i18n'
import type { Dictionary } from '@/lib/dictionary'

import en from '@/dictionaries/en.json'
import af from '@/dictionaries/af.json'
import bg from '@/dictionaries/bg.json'
import bn from '@/dictionaries/bn.json'
import ca from '@/dictionaries/ca.json'
import cs from '@/dictionaries/cs.json'
import cy from '@/dictionaries/cy.json'
import da from '@/dictionaries/da.json'
import el from '@/dictionaries/el.json'
import et from '@/dictionaries/et.json'
import eu from '@/dictionaries/eu.json'
import fa from '@/dictionaries/fa.json'
import fi from '@/dictionaries/fi.json'
import fil from '@/dictionaries/fil.json'
import ga from '@/dictionaries/ga.json'
import gl from '@/dictionaries/gl.json'
import gu from '@/dictionaries/gu.json'
import ha from '@/dictionaries/ha.json'
import he from '@/dictionaries/he.json'
import hr from '@/dictionaries/hr.json'
import hu from '@/dictionaries/hu.json'
import ig from '@/dictionaries/ig.json'
import is from '@/dictionaries/is.json'
import lt from '@/dictionaries/lt.json'
import lv from '@/dictionaries/lv.json'
import mr from '@/dictionaries/mr.json'
import ms from '@/dictionaries/ms.json'
import mt from '@/dictionaries/mt.json'
import nl from '@/dictionaries/nl.json'
import no from '@/dictionaries/no.json'
import pa from '@/dictionaries/pa.json'
import pl from '@/dictionaries/pl.json'
import ro from '@/dictionaries/ro.json'
import sk from '@/dictionaries/sk.json'
import sl from '@/dictionaries/sl.json'
import sr from '@/dictionaries/sr.json'
import sv from '@/dictionaries/sv.json'
import sw from '@/dictionaries/sw.json'
import ta from '@/dictionaries/ta.json'
import te from '@/dictionaries/te.json'
import tr from '@/dictionaries/tr.json'
import uk from '@/dictionaries/uk.json'
import ur from '@/dictionaries/ur.json'
import xh from '@/dictionaries/xh.json'
import yo from '@/dictionaries/yo.json'
import zu from '@/dictionaries/zu.json'

const DICT_MAP = { en, af, bg, bn, ca, cs, cy, da, el, et, eu, fa, fi, fil, ga, gl, gu, ha, he, hr, hu, ig, is, lt, lv, mr, ms, mt, nl, no, pa, pl, ro, sk, sl, sr, sv, sw, ta, te, tr, uk, ur, xh, yo, zu } as Record<string, Dictionary>

interface LocaleContextType { locale: Locale; dict: Dictionary; setLocale: (l: Locale) => void; t: (path: string) => string }
const LocaleContext = createContext<LocaleContextType>({ locale: defaultLocale, dict: en as unknown as Dictionary, setLocale: () => {}, t: () => '' })

function getFromPath(obj: any, path: string): string { return path.split('.').reduce((o: any, k: string) => o?.[k], obj) ?? path }

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [dict, setDict] = useState<Dictionary>(en as unknown as Dictionary)

  useEffect(() => {
    // Priority: localStorage > cookie > browser language > default
    const saved = localStorage.getItem('ailomo_locale') as Locale | null
    if (saved && saved in localeMap) { setLocaleState(saved); return }

    // Check cookie (from middleware IP detection)
    const cookie = document.cookie.split('; ').find(r => r.startsWith('ailomo_locale='))
    if (cookie) {
      const cookieVal = cookie.split('=')[1] as Locale
      if (cookieVal in localeMap) { setLocaleState(cookieVal); return }
    }

    // Browser language
    const browserLang = navigator.language?.split('-')[0] as Locale
    if (browserLang && browserLang in localeMap) { setLocaleState(browserLang); return }
  }, [])

  useEffect(() => { setDict(DICT_MAP[locale] || en) }, [locale])

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem('ailomo_locale', l)
    document.cookie = `ailomo_locale=${l};path=/;max-age=31536000`
    setLocaleState(l)
  }, [])

  const t = useCallback((path: string) => getFromPath(dict, path), [dict])

  return (<LocaleContext.Provider value={{ locale, dict, setLocale, t }}>{children}</LocaleContext.Provider>)
}

export function useLocale() { return useContext(LocaleContext) }

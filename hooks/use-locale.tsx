'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Locale } from '@/lib/i18n'
import { defaultLocale, localeMap } from '@/lib/i18n'
import type { Dictionary } from '@/lib/dictionary'

import en from '@/dictionaries/en.json'
import af from '@/dictionaries/af.json'; import am from '@/dictionaries/am.json'; import ar from '@/dictionaries/ar.json'
import bg from '@/dictionaries/bg.json'; import bn from '@/dictionaries/bn.json'; import ca from '@/dictionaries/ca.json'
import cs from '@/dictionaries/cs.json'; import cy from '@/dictionaries/cy.json'; import da from '@/dictionaries/da.json'
import de from '@/dictionaries/de.json'; import el from '@/dictionaries/el.json'; import es from '@/dictionaries/es.json'
import et from '@/dictionaries/et.json'; import eu from '@/dictionaries/eu.json'; import fa from '@/dictionaries/fa.json'
import fi from '@/dictionaries/fi.json'; import fil from '@/dictionaries/fil.json'; import fr from '@/dictionaries/fr.json'
import ga from '@/dictionaries/ga.json'; import gl from '@/dictionaries/gl.json'; import gu from '@/dictionaries/gu.json'
import ha from '@/dictionaries/ha.json'; import he from '@/dictionaries/he.json'; import hi from '@/dictionaries/hi.json'
import hr from '@/dictionaries/hr.json'; import hu from '@/dictionaries/hu.json'; import id from '@/dictionaries/id.json'
import ig from '@/dictionaries/ig.json'; import is from '@/dictionaries/is.json'; import it from '@/dictionaries/it.json'
import ja from '@/dictionaries/ja.json'; import km from '@/dictionaries/km.json'; import ko from '@/dictionaries/ko.json'
import lt from '@/dictionaries/lt.json'; import lv from '@/dictionaries/lv.json'; import mr from '@/dictionaries/mr.json'
import ms from '@/dictionaries/ms.json'; import mt from '@/dictionaries/mt.json'; import nl from '@/dictionaries/nl.json'
import no from '@/dictionaries/no.json'; import pa from '@/dictionaries/pa.json'; import pl from '@/dictionaries/pl.json'
import pt from '@/dictionaries/pt.json'; import ro from '@/dictionaries/ro.json'; import ru from '@/dictionaries/ru.json'
import sk from '@/dictionaries/sk.json'; import sl from '@/dictionaries/sl.json'; import so from '@/dictionaries/so.json'
import sr from '@/dictionaries/sr.json'; import sv from '@/dictionaries/sv.json'; import sw from '@/dictionaries/sw.json'
import ta from '@/dictionaries/ta.json'; import te from '@/dictionaries/te.json'; import th from '@/dictionaries/th.json'
import tr from '@/dictionaries/tr.json'; import uk from '@/dictionaries/uk.json'; import ur from '@/dictionaries/ur.json'
import vi from '@/dictionaries/vi.json'; import xh from '@/dictionaries/xh.json'; import yo from '@/dictionaries/yo.json'
import zh from '@/dictionaries/zh.json'; import zu from '@/dictionaries/zu.json'

const DICT_MAP: Record<string, Dictionary> = {
  en, af, am, ar, bg, bn, ca, cs, cy, da, de, el, es, et, eu, fa, fi, fil, fr, ga, gl, gu, ha, he, hi, hr, hu, id, ig, is, it, ja, km, ko, lt, lv, mr, ms, mt, nl, no, pa, pl, pt, ro, ru, sk, sl, so, sr, sv, sw, ta, te, th, tr, uk, ur, vi, xh, yo, zh, zu,
} as Record<string, Dictionary>

interface LocaleContextType {
  locale: Locale; dict: Dictionary; setLocale: (l: Locale) => void; t: (path: string) => string
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale, dict: en as unknown as Dictionary, setLocale: () => {}, t: () => '',
})

function getFromPath(obj: any, path: string): string {
  return path.split('.').reduce((o: any, k: string) => o?.[k], obj) ?? path
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [dict, setDict] = useState<Dictionary>(en as unknown as Dictionary)

  useEffect(() => {
    const saved = localStorage.getItem('ailomo_locale') as Locale | null
    if (saved && saved in localeMap) setLocaleState(saved)
  }, [])

  useEffect(() => {
    setDict(DICT_MAP[locale] || en)
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

export function useLocale() { return useContext(LocaleContext) }

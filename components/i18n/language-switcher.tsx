'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, Search } from 'lucide-react'
import { localeMap, type Locale } from '@/lib/i18n'
import { useLocale } from '@/hooks/use-locale'
import { cn } from '@/lib/utils'

const TOP_LOCALES: Locale[] = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ar', 'hi', 'id', 'th', 'vi', 'ru']

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSearch(''); setShowAll(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = search
    ? Object.values(localeMap).filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.includes(search) ||
        l.code.includes(search)
      )
    : showAll
      ? Object.values(localeMap)
      : TOP_LOCALES.map(c => localeMap[c])

  const selectLang = (code: Locale) => {
    setLocale(code)
    setOpen(false)
    setSearch('')
    setShowAll(false)
  }

  const info = localeMap[locale]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-sm hover:bg-white/[0.04] transition-colors"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-base">{info.flag}</span>
        <span className="hidden sm:inline text-muted-foreground text-xs">{info.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/[0.08] bg-card shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-white/[0.04]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-3 py-2 text-sm outline-none focus:border-violet-500/30 transition-colors placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-56 p-1">
            {filtered.map(l => (
              <button
                key={l.code}
                onClick={() => selectLang(l.code)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.04]',
                  locale === l.code && 'bg-violet-500/[0.08]',
                )}
              >
                <span className="text-lg">{l.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{l.nativeName}</p>
                  <p className="text-xs text-muted-foreground/60">{l.name}</p>
                </div>
                {locale === l.code && <Check className="h-4 w-4 text-violet-400" />}
              </button>
            ))}

            {!search && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full text-center py-3 text-xs text-violet-400/80 hover:text-violet-300 transition-colors"
              >
                Show all 63 languages →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

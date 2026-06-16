'use client'

import { useState, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { localeMap, type Locale, defaultLocale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const TOP_LOCALES: Locale[] = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ar', 'hi', 'id', 'th', 'vi', 'ru']

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Locale>(defaultLocale)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.addEventListener('click', () => setOpen(false))
    return () => document.removeEventListener('click', () => setOpen(false))
  }, [])

  const filtered = search
    ? Object.values(localeMap).filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.includes(search) ||
        l.code.includes(search)
      )
    : TOP_LOCALES.map((c) => localeMap[c])

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>{localeMap[current].flag}</span>
        <span className="hidden sm:inline text-muted-foreground">{localeMap[current].name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs outline-none focus:border-violet-500/50"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-64 p-1">
            {filtered.map((l) => (
              <button
                key={l.code}
                onClick={() => { setCurrent(l.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50',
                  current === l.code && 'bg-violet-500/10',
                )}
              >
                <span className="text-lg">{l.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{l.nativeName}</p>
                  <p className="text-xs text-muted-foreground">{l.name}</p>
                </div>
                {current === l.code && <Check className="h-4 w-4 text-violet-400" />}
              </button>
            ))}

            {!search && (
              <button
                onClick={() => setSearch('')}
                className="w-full text-center py-2 text-xs text-violet-400 hover:text-violet-300"
              >
                Show all 63 languages
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

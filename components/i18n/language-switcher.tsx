'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, Search } from 'lucide-react'
import { localeMap, type Locale } from '@/lib/i18n'
import { useLocale } from '@/hooks/use-locale'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch('') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const allLocales = Object.values(localeMap)
  const filtered = search
    ? allLocales.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.nativeName.includes(search) || l.code.includes(search))
    : allLocales

  const selectLang = (code: Locale) => { setLocale(code); setOpen(false); setSearch('') }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-sm hover:bg-white/[0.04] transition-colors">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-base">{localeMap[locale].flag}</span>
        <span className="hidden sm:inline text-muted-foreground text-xs">{localeMap[locale].name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/[0.08] bg-card shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50">
          <div className="p-3 border-b border-white/[0.04]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search language..." className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-3 py-2 text-sm outline-none focus:border-violet-500/30 transition-colors placeholder:text-muted-foreground/40" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-72 p-1">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No languages found</p>
            ) : (
              filtered.map(l => (
                <button key={l.code} onClick={() => selectLang(l.code)} className={cn('w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.04]', locale === l.code && 'bg-violet-500/[0.08]')}>
                  <span className="text-lg shrink-0">{l.flag}</span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm truncate">{l.nativeName}</p>
                    <p className="text-xs text-muted-foreground/60">{l.name}</p>
                  </div>
                  {locale === l.code && <Check className="h-4 w-4 text-violet-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-white/[0.04] px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground/40">{allLocales.length} languages</p>
          </div>
        </div>
      )}
    </div>
  )
}

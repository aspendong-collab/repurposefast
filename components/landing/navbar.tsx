'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Menu, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import type { Dictionary } from '@/lib/dictionary'

export function Navbar({ d }: { d: Dictionary }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { const h = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h) }, [])

  const links = [
    { href: '#features', label: d.nav.features },
    { href: '#how-it-works', label: d.nav.howItWorks },
    { href: '#pricing', label: d.nav.pricing },
    { href: '#faq', label: d.nav.faq },
  ]
  const Tg = () => (<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"><Sparkles className="h-4.5 w-4.5 text-white" /></div>)

  return (
    <header className={cn('fixed top-0 z-50 w-full transition-all duration-500', scrolled ? 'bg-background/80 backdrop-blur-2xl border-b border-violet-500/[0.06]' : 'bg-transparent')}>
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group"><Tg /><span className="font-bold text-lg"><span className="text-foreground">ailo</span><span className="text-violet-400">mo</span></span></a>
        <nav className="hidden md:flex items-center gap-1">{links.map(l => <a key={l.href} href={l.href} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-violet-500/[0.04] transition-all">{l.label}</a>)}</nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a href="#tool" className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition-all shadow-sm"><Sparkles className="h-3.5 w-3.5" />{d.nav.tryFree}</a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {menuOpen && (<div className="md:hidden border-t border-violet-500/[0.06] bg-background/95 backdrop-blur-xl">{links.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-muted/50">{l.label}<ChevronRight className="h-4 w-4 text-muted-foreground" /></a>)}</div>)}
    </header>
  )
}

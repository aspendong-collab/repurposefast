// ── Dictionary Loader ──────────────────────────────────────────────────────
// Dynamically loads JSON dictionaries for the selected locale.
// Falls back to English if translation is missing.

import type { Locale } from './i18n'
import { defaultLocale, localeMap } from './i18n'

export interface Dictionary {
  nav: {
    features: string
    pricing: string
    faq: string
    tryFree: string
  }
  hero: {
    badge: string
    title: string
    highlight: string
    subtitle: string
    accent: string
    stats: { languages: string; formats: string; speed: string }
    tabs: { url: string; file: string; text: string }
    placeholder: string
    generate: string
    processing: string
    error: string
    tryAgain: string
    startOver: string
    formatsGenerated: string
  }
  howItWorks: {
    label: string
    title: string
    highlight: string
    suffix: string
    steps: Array<{ title: string; desc: string }>
  }
  features: {
    label: string
    title: string
    highlight: string
    subtitle: string
    list: Array<{ title: string; desc: string }>
  }
  highlights: {
    label: string
    title: string
    highlight: string
  }
  formats: {
    outputLabel: string
    outputTitle: string
    outputHighlight: string
    outputSubtitle: string
    langLabel: string
    langTitle: string
    langSubtitle: string
    more: string
  }
  social: {
    label: string
    stats: { users: string; videos: string; rating: string; languages: string }
    testimonials: Array<{ text: string; author: string; role: string }>
  }
  pricing: {
    label: string
    title: string
    highlight: string
    suffix: string
    subtitle: string
    plans: {
      free: { name: string; desc: string; cta: string }
      creator: { name: string; desc: string; cta: string; badge: string }
      pro: { name: string; desc: string; cta: string }
    }
  }
  cta: {
    title: string
    highlight: string
    suffix: string
    subtitle: string
    start: string
    pricing: string
  }
  faq: {
    label: string
    title: string
  }
  footer: {
    tagline: string
    copyright: string
    builtWith: string
  }
}

let cached: Record<string, Dictionary> = {}

export async function getDictionary(locale: Locale = defaultLocale): Promise<Dictionary> {
  if (cached[locale]) return cached[locale]

  try {
    const mod = await import(`@/dictionaries/${locale}.json`)
    cached[locale] = mod.default || mod
    return cached[locale]
  } catch {
    // Fallback to English
    const mod = await import(`@/dictionaries/en.json`)
    cached[locale] = mod.default || mod
    return cached[locale]
  }
}

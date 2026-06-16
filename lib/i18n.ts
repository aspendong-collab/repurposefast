// ── RePurposeFast i18n System ──────────────────────────────────────────────
// 63 languages with flag emoji, auto-detect from browser/IP, manual switch

export type Locale = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'ar' | 'hi' | 'id' | 'th' | 'vi' | 'ru' | 'it' | 'nl' | 'pl' | 'tr' | 'ms' | 'fil' | 'bn' | 'ur' | 'sw' | 'ta' | 'te' | 'mr' | 'gu' | 'pa' | 'fa' | 'he' | 'el' | 'cs' | 'sk' | 'hu' | 'ro' | 'bg' | 'sr' | 'hr' | 'uk' | 'sv' | 'da' | 'no' | 'fi' | 'et' | 'lv' | 'lt' | 'sl' | 'is' | 'ga' | 'mt' | 'cy' | 'eu' | 'ca' | 'gl' | 'af' | 'zu' | 'xh' | 'am' | 'ha' | 'ig' | 'yo' | 'so' | 'km'

export const locales: Locale[] = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ar', 'hi', 'id', 'th', 'vi', 'ru', 'it', 'nl', 'pl', 'tr', 'ms', 'fil', 'bn', 'ur', 'sw', 'ta', 'te', 'mr', 'gu', 'pa', 'fa', 'he', 'el', 'cs', 'sk', 'hu', 'ro', 'bg', 'sr', 'hr', 'uk', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'sl', 'is', 'ga', 'mt', 'cy', 'eu', 'ca', 'gl', 'af', 'zu', 'xh', 'am', 'ha', 'ig', 'yo', 'so', 'km']

export interface LocaleInfo {
  code: Locale
  name: string
  nativeName: string
  flag: string
}

export const localeMap: Record<Locale, LocaleInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  th: { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  ms: { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  fil: { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  sw: { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  fa: { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  sk: { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  hu: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  ro: { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  bg: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  sr: { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  hr: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  da: { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  fi: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  et: { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  lv: { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  lt: { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  sl: { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  is: { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  ga: { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪' },
  mt: { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹' },
  cy: { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  eu: { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸' },
  ca: { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  gl: { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸' },
  af: { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  zu: { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  xh: { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  am: { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  ha: { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  ig: { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  yo: { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  so: { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴' },
  km: { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
}

export const defaultLocale: Locale = 'en'

// IP-based locale detection (simplified mapping by country code)
const countryToLocale: Record<string, Locale> = {
  CN: 'zh', HK: 'zh', TW: 'zh', JP: 'ja', KR: 'ko',
  ES: 'es', MX: 'es', AR: 'es', FR: 'fr', DE: 'de',
  BR: 'pt', PT: 'pt', SA: 'ar', AE: 'ar', IN: 'hi',
  ID: 'id', TH: 'th', VN: 'vi', RU: 'ru', IT: 'it',
  NL: 'nl', PL: 'pl', TR: 'tr', MY: 'ms', PH: 'fil',
  BD: 'bn', PK: 'ur', TZ: 'sw', KE: 'sw',
  IR: 'fa', IL: 'he', GR: 'el', CZ: 'cs', SK: 'sk',
  HU: 'hu', RO: 'ro', BG: 'bg', RS: 'sr', HR: 'hr',
  UA: 'uk', SE: 'sv', DK: 'da', NO: 'no', FI: 'fi',
  EE: 'et', LV: 'lv', LT: 'lt', SI: 'sl', IS: 'is',
  IE: 'ga', MT: 'mt', ZA: 'af', NG: 'ha', ET: 'am',
  SO: 'so', KH: 'km',
}

export function detectLocale(acceptLang: string | null, country?: string): Locale {
  // 1. Check country code first (from IP)
  if (country && countryToLocale[country.toUpperCase()]) {
    return countryToLocale[country.toUpperCase()]
  }
  // 2. Check Accept-Language header
  if (acceptLang) {
    for (const lang of acceptLang.split(',')) {
      const code = lang.split(';')[0].split('-')[0].toLowerCase()
      if (locales.includes(code as Locale)) return code as Locale
    }
  }
  return defaultLocale
}

export function getLocaleFromPath(pathname: string): { locale: Locale; path: string } {
  const seg = pathname.split('/')[1]
  if (locales.includes(seg as Locale)) {
    return { locale: seg as Locale, path: '/' + pathname.split('/').slice(2).join('/') }
  }
  return { locale: defaultLocale, path: pathname }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const countryToLocale: Record<string, string> = {
  CN:'zh',HK:'zh',TW:'zh',JP:'ja',KR:'ko',ES:'es',MX:'es',AR:'es',FR:'fr',DE:'de',
  BR:'pt',PT:'pt',SA:'ar',AE:'ar',IN:'hi',ID:'id',TH:'th',VN:'vi',RU:'ru',IT:'it',
  NL:'nl',PL:'pl',TR:'tr',MY:'ms',PH:'fil',BD:'bn',PK:'ur',TZ:'sw',KE:'sw',
  IR:'fa',IL:'he',GR:'el',CZ:'cs',SK:'sk',HU:'hu',RO:'ro',BG:'bg',RS:'sr',HR:'hr',
  UA:'uk',SE:'sv',DK:'da',NO:'no',FI:'fi',EE:'et',LV:'lv',LT:'lt',SI:'sl',IS:'is',
  IE:'ga',MT:'mt',ZA:'af',NG:'ha',ET:'am',SO:'so',KH:'km',
}

const locales = ['en','zh','ja','ko','es','fr','de','pt','ar','hi','id','th','vi','ru','it','nl','pl','tr','ms','fil','bn','ur','sw','ta','te','mr','gu','pa','fa','he','el','cs','sk','hu','ro','bg','sr','hr','uk','sv','da','no','fi','et','lv','lt','sl','is','ga','mt','cy','eu','ca','gl','af','zu','xh','am','ha','ig','yo','so','km']

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Skip API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return response
  }

  // Only set locale cookie if not already set
  if (!request.cookies.get('ailomo_locale')) {
    // 1. IP country (Vercel header)
    const country = request.headers.get('x-vercel-ip-country') || ''
    const ipLocale = countryToLocale[country.toUpperCase()]

    // 2. Browser Accept-Language
    const acceptLang = request.headers.get('accept-language') || ''
    let browserLocale = ''
    for (const lang of acceptLang.split(',')) {
      const code = lang.split(';')[0].split('-')[0].toLowerCase()
      if (locales.includes(code)) { browserLocale = code; break }
    }

    const detected = ipLocale || browserLocale || 'en'
    response.cookies.set('ailomo_locale', detected, { path: '/', maxAge: 31536000 })
  }

  return response
}

export const config = { matcher: '/((?!api|_next|favicon.ico|.*\\.).*)' }

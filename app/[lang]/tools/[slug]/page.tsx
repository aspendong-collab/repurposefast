import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getToolPagesByLocale, type ToolPageConfig } from '@/app/tools/generate-seo-pages'
import { BreadcrumbSchema, HowToSchema, FAQSchema } from '@/components/seo/schemas'
import { RelatedBlogs } from '@/components/seo/crosslinks'
import { localeMap, type Locale } from '@/lib/i18n'

// 20 languages with PSEO coverage
const PSEO_LOCALES: Locale[] = [
  'en','zh','es','pt','hi','ar','ja','ko','de','fr',
  'id','th','vi','ru','it','tr','pl','nl','sv','fil',
]

export function generateStaticParams() {
  const params: { lang: string; slug: string }[] = []
  const allSlugs = getToolPagesByLocale('en').map(p => p.slug)
  for (const lang of PSEO_LOCALES) {
    for (const slug of allSlugs) {
      params.push({ lang, slug })
    }
  }
  return params
}

// Simple translation map for common tool page elements
const translations: Record<string, Record<string, string>> = {
  tryFree: { zh:'免费试用', ja:'無料で試す', ko:'무료로 시도', es:'Prueba gratis', fr:'Essayer gratuitement',
    de:'Kostenlos testen', pt:'Teste grátis', ar:'جرب مجاناً', hi:'मुफ्त में आज़माएं', id:'Coba gratis',
    th:'ทดลองฟรี', vi:'Dùng thử miễn phí', ru:'Попробовать бесплатно', it:'Prova gratis',
    tr:'Ücretsiz dene', pl:'Wypróbuj za darmo', nl:'Gratis proberen', sv:'Testa gratis', fil:'Subukan nang libre' },
  keyFeatures: { zh:'核心功能', ja:'主な機能', ko:'주요 기능', es:'Características', fr:'Fonctionnalités',
    de:'Funktionen', pt:'Recursos', ar:'الميزات', hi:'मुख्य विशेषताएं', id:'Fitur utama',
    th:'คุณสมบัติหลัก', vi:'Tính năng', ru:'Возможности', it:'Caratteristiche',
    tr:'Özellikler', pl:'Funkcje', nl:'Functies', sv:'Funktioner', fil:'Mga Tampok' },
  faq: { zh:'常见问题', ja:'よくある質問', ko:'자주 묻는 질문', es:'Preguntas frecuentes',
    fr:'FAQ', de:'FAQ', pt:'Perguntas frequentes', ar:'الأسئلة الشائعة', hi:'अक्सर पूछे जाने वाले प्रश्न',
    id:'FAQ', th:'คำถามที่พบบ่อย', vi:'Câu hỏi thường gặp', ru:'Часто задаваемые вопросы',
    it:'Domande frequenti', tr:'SSS', pl:'FAQ', nl:'Veelgestelde vragen', sv:'Vanliga frågor',
    fil:'Mga Madalas Itanong' },
  exploreTools: { zh:'探索更多工具', ja:'他のツールを見る', ko:'더 많은 도구', es:'Explorar más herramientas',
    fr:'Explorer plus d\'outils', de:'Weitere Tools', pt:'Explorar mais ferramentas', ar:'استكشف المزيد',
    hi:'और उपकरण', id:'Jelajahi alat lainnya', th:'สำรวจเครื่องมือเพิ่มเติม', vi:'Khám phá thêm',
    ru:'Больше инструментов', it:'Esplora altri strumenti', tr:'Diğer araçlar', pl:'Więcej narzędzi',
    nl:'Meer tools', sv:'Fler verktyg', fil:'Higit pang mga tool' },
  ready: { zh:'准备好开始了吗？', ja:'始める準備はできましたか？', ko:'시작할 준비가 되셨나요?',
    es:'¿Listo para empezar?', fr:'Prêt à commencer ?', de:'Bereit loszulegen?', pt:'Pronto para começar?',
    ar:'هل أنت مستعد للبدء؟', hi:'शुरू करने के लिए तैयार?', id:'Siap memulai?', th:'พร้อมเริ่มต้นหรือยัง?',
    vi:'Sẵn sàng bắt đầu?', ru:'Готовы начать?', it:'Pronto per iniziare?', tr:'Başlamaya hazır mısın?',
    pl:'Gotowy?', nl:'Klaar om te beginnen?', sv:'Redo att börja?', fil:'Handa nang magsimula?' },
}

function t(lang: string, key: string, fallback: string): string {
  return translations[key]?.[lang] || fallback
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!PSEO_LOCALES.includes(lang as Locale)) notFound()

  const toolPages = getToolPagesByLocale(lang)
  const page = toolPages.find((p) => p.slug === slug)
  if (!page) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'
  const langInfo = localeMap[lang as Locale]

  return {
    title: page.title,
    description: page.description,
    keywords: [page.badge, 'AI tool', 'free online tool', langInfo?.name || ''],
    openGraph: {
      title: page.ogTitle,
      description: page.ogDescription,
      locale: `${lang}_${lang.toUpperCase()}`,
    },
    alternates: {
      canonical: `${siteUrl}/tools/${slug}`,
      languages: Object.fromEntries(
        PSEO_LOCALES.map((l) => [l, `${siteUrl}/${l}/tools/${slug}`])
      ),
    },
    robots: { index: true, follow: true },
  }
}

export default async function LangToolPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!PSEO_LOCALES.includes(lang as Locale)) notFound()

  const toolPages = getToolPagesByLocale(lang)
  const page = toolPages.find((p) => p.slug === slug)
  if (!page) notFound()

  const faqItems = lang === 'zh' ? [
    { question: `${page.badge.replace('→', '转')} 工具是什么？`, answer: `ailomo 的 ${page.badge.replace('→', '转')} 工具帮助您使用 AI 自动转化内容。只需粘贴链接，即可获得格式精美的输出。` },
    { question: '这个工具免费吗？', answer: '是的！可以免费试用，无需信用卡。付费方案为高级用户提供更高的额度和更强大的功能。' },
    { question: '支持哪些语言？', answer: `ailomo 支持 63 种语言，包括 ${PSEO_LOCALES.map((l) => localeMap[l]?.name).slice(0, 6).join('、')}等。` },
    { question: 'AI 生成的结果准确度如何？', answer: '我们的 AI 在清晰语音上达到 95% 以上的准确率，内容生成针对每种输出格式进行了优化。' },
  ] : [
    { question: `What is the ${page.badge.replace('→', 'to')} tool?`, answer: `ailomo's ${page.badge.replace('→', 'to')} tool helps you automatically transform content using AI. Just paste a link and get beautifully formatted output instantly.` },
    { question: 'Is this tool free to use?', answer: 'Yes! You can try it for free with no credit card required. Paid plans offer higher limits and advanced features for power users.' },
    { question: 'What languages does it support?', answer: `ailomo supports 63 languages including ${PSEO_LOCALES.map((l) => localeMap[l]?.name).slice(0, 6).join(', ')} and more.` },
    { question: 'How accurate are the AI-generated results?', answer: 'Our AI achieves 95%+ accuracy on clear speech, and the content generation is optimized for each specific output format.' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `/${lang}` },
          { name: 'Tools', url: `/${lang}/tools` },
          { name: page.badge, url: `/${lang}/tools/${slug}` },
        ]}
      />
      <HowToSchema name={page.badge.replace('→', 'to')} steps={[
        'Paste your video link or upload a file',
        `AI transcribes and processes the content`,
        `Get your ${page.badge.split('→')[1]?.trim() || 'output'} in seconds`,
      ]} />
      <FAQSchema questions={faqItems} />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-20 pb-12 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.04] px-4 py-1.5 text-sm text-violet-300">
          <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          {page.badge}
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{page.h1}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">{page.description}</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-white/90">
          {t(lang, 'tryFree', 'Try Free Now')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">{t(lang, 'keyFeatures', 'Key Features')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {page.features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-white/[0.06] bg-white/[0.01] p-6 hover:border-violet-500/15">
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">{t(lang, 'faq', 'FAQ')}</h2>
        <div className="space-y-3">
          {faqItems.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-white/[0.06] bg-white/[0.01]">
              <summary className="cursor-pointer px-6 py-4 font-medium text-sm list-none flex items-center justify-between">
                {faq.question} <span className="text-muted-foreground group-open:rotate-180">▾</span>
              </summary>
              <p className="px-6 pb-4 text-sm text-muted-foreground/70">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-12">
        <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.04] to-purple-500/[0.04] p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold">{t(lang, 'ready', 'Ready to get started?')}</h2>
          <p className="mt-3 text-muted-foreground">Free to start. No credit card required.</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-white/90">
            {t(lang, 'tryFree', 'Get Started Free')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Cross-links */}
      <RelatedBlogs slug={slug} />
    </div>
  )
}

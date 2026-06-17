import type { Metadata } from 'next'
import Link from 'next/link'
import { allBlogPosts } from '@/content/blog/registry'
import { localeMap, type Locale } from '@/lib/i18n'

const BLOG_LOCALES: Locale[] = ['en','zh','ja','ko','es','fr','de','pt','ar','hi','id','th','vi','ru','it']

export function generateStaticParams() {
  return BLOG_LOCALES.map((lang) => ({ lang }))
}

const titles: Record<string, { blog: string; desc: string }> = {
  en: { blog: 'Blog', desc: 'AI content repurposing, video to blog, multi-platform strategy — ailomo official blog' },
  zh: { blog: '博客', desc: 'AI 内容复用、视频转博客、多平台内容策略——ailomo 官方博客' },
  ja: { blog: 'ブログ', desc: 'AIコンテンツ再活用、動画からブログ、マルチプラットフォーム戦略' },
  ko: { blog: '블로그', desc: 'AI 콘텐츠 재활용, 비디오를 블로그로, 멀티 플랫폼 전략' },
  es: { blog: 'Blog', desc: 'Reutilización de contenido con IA, video a blog, estrategia multiplataforma' },
  fr: { blog: 'Blog', desc: 'Réutilisation de contenu IA, vidéo en blog, stratégie multiplateforme' },
  de: { blog: 'Blog', desc: 'KI-Content-Wiederverwendung, Video zu Blog, Multi-Plattform-Strategie' },
  pt: { blog: 'Blog', desc: 'Reaproveitamento de conteúdo com IA, vídeo para blog, estratégia multiplataforma' },
  ar: { blog: 'المدونة', desc: 'إعادة استخدام المحتوى بالذكاء الاصطناعي، فيديو إلى مدونة، استراتيجية متعددة المنصات' },
  hi: { blog: 'ब्लॉग', desc: 'AI कंटेंट रीपर्पजिंग, वीडियो से ब्लॉग, मल्टी-प्लेटफॉर्म रणनीति' },
  id: { blog: 'Blog', desc: 'Repurposing konten AI, video ke blog, strategi multi-platform' },
  th: { blog: 'บล็อก', desc: 'การนำเนื้อหากลับมาใช้ใหม่ด้วย AI, วิดีโอเป็นบล็อก, กลยุทธ์หลายแพลตฟอร์ม' },
  vi: { blog: 'Blog', desc: 'Tái sử dụng nội dung AI, video thành blog, chiến lược đa nền tảng' },
  ru: { blog: 'Блог', desc: 'Переиспользование контента с ИИ, видео в блог, мультиплатформенная стратегия' },
  it: { blog: 'Blog', desc: 'Riutilizzo dei contenuti con AI, video in blog, strategia multi-piattaforma' },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = titles[lang] || titles.en
  return {
    title: `${t.blog} | ailomo`,
    description: t.desc,
    alternates: { canonical: '/blog' },
    robots: { index: true, follow: true },
  }
}

export default async function LangBlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = titles[lang] || titles.en
  const categories = [...new Set(allBlogPosts.map((p) => p.category))]

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.blog}</h1>
        <p className="mt-4 text-muted-foreground">{t.desc}</p>

        <div className="mt-12 space-y-6">
          {allBlogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/${lang}/blog/${post.slug}`}
              className="block rounded-xl border border-white/[0.06] bg-white/[0.01] p-6 hover:border-violet-500/15 transition-all"
            >
              <span className="inline-block rounded-full bg-violet-500/10 px-3 py-0.5 text-xs text-violet-300">{post.category}</span>
              <h2 className="mt-3 text-lg font-semibold hover:text-violet-300 transition-colors">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{post.readingTime}</span>
                <span>·</span>
                <span>{post.tags.slice(0, 3).join(', ')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

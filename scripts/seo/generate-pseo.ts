/**
 * Programmatic SEO Page Generator
 *
 * Generates thousands of SEO pages from template × language × keyword matrices.
 * Pattern: /{lang}/tools/{slug} → auto-translated SEO pages
 *
 * Usage:
 *   npx tsx scripts/seo/generate-pseo.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

// Top 20 languages for SEO (most traffic)
const SEO_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
]

// Tool slugs with their keyword translations per language
const TOOL_PAGES = [
  { slug: 'youtube-to-blog-post', keywords: { en: 'youtube to blog post', zh: 'YouTube转博客文章', es: 'youtube a blog', pt: 'youtube para blog', ja: 'YouTubeをブログ記事に', ko: '유튜브 블로그 변환' } },
  { slug: 'video-to-twitter-thread', keywords: { en: 'video to twitter thread', zh: '视频转推文串', es: 'video a hilo de twitter', ja: '動画をツイッタースレッドに', ko: '동영상 트위터 스레드' } },
  { slug: 'video-to-linkedin-post', keywords: { en: 'video to linkedin post', zh: '视频转LinkedIn帖子', es: 'video a linkedin', ja: '動画をLinkedIn投稿に', ko: '동영상 LinkedIn 게시물' } },
  { slug: 'video-to-xiaohongshu', keywords: { en: 'video to xiaohongshu', zh: '视频转小红书笔记', ja: '動画を小紅書に', ko: '동영상 샤오훙슈 변환' } },
  { slug: 'audio-to-text', keywords: { en: 'audio to text', zh: '音频转文字', es: 'audio a texto', pt: 'áudio para texto', ja: '音声をテキストに', ko: '음성을 텍스트로' } },
  { slug: 'video-to-subtitle', keywords: { en: 'video to subtitle SRT', zh: '视频转字幕SRT', es: 'video a subtitulos', ja: '動画を字幕SRTに', ko: '동영상 자막 SRT' } },
  { slug: 'mp4-to-text', keywords: { en: 'mp4 to text', zh: 'MP4转文字', es: 'mp4 a texto', ja: 'MP4をテキストに', ko: 'MP4 텍스트 변환' } },
  { slug: 'podcast-to-article', keywords: { en: 'podcast to article', zh: '播客转文章', es: 'podcast a articulo', ja: 'ポッドキャストを記事に', ko: '팟캐스트 기사 변환' } },
  { slug: 'video-to-seo-article', keywords: { en: 'video to SEO article', zh: '视频转SEO文章', ja: '動画をSEO記事に', ko: '동영상 SEO 기사' } },
  { slug: 'meeting-to-notes', keywords: { en: 'meeting to notes AI', zh: '会议录音转纪要', es: 'reunion a notas', ja: '会議を議事録に', ko: '회의록 AI' } },
  { slug: 'interview-transcript', keywords: { en: 'interview transcription AI', zh: '采访录音转文字', ja: 'インタビュー文字起こし', ko: '인터뷰 녹취록' } },
  { slug: 'video-content-repurposing', keywords: { en: 'video content repurposing', zh: '视频内容复用', es: 'reutilizacion de contenido', ja: '動画コンテンツ再利用', ko: '동영상 콘텐츠 재활용' } },
]

interface PSEOConfig {
  lang: string
  toolSlug: string
  url: string
  title: string
  description: string
  h1: string
  canonical: string
  languageName: string
  keyword: string
}

function generatePSEOConfigs(): PSEOConfig[] {
  const configs: PSEOConfig[] = []

  const titles: Record<string, Record<string, string>> = {
    'youtube-to-blog-post': {
      en: 'Convert YouTube Videos to Blog Posts — Free AI Tool | ailomo',
      zh: 'YouTube视频转博客文章 — 免费AI工具 | ailomo',
      es: 'Convertir YouTube a Artículo de Blog — Herramienta AI Gratis | ailomo',
      ja: 'YouTube動画をブログ記事に変換 — 無料AIツール | ailomo',
      ko: 'YouTube 동영상을 블로그 글로 변환 — 무료 AI 도구 | ailomo',
    },
  }

  const descriptions: Record<string, Record<string, string>> = {
    'youtube-to-blog-post': {
      en: 'Free AI tool to convert YouTube videos into SEO-optimized blog posts. Paste a link, get a complete article in minutes. No signup required.',
      zh: '免费AI工具，将YouTube视频转为SEO优化博客文章。粘贴链接，几分钟生成完整文章。无需注册。',
      es: 'Herramienta AI gratuita para convertir videos de YouTube en artículos de blog optimizados para SEO. Sin registro.',
      ja: 'YouTube動画をSEO最適化されたブログ記事に無料で変換。リンクを貼るだけで数分で完成。登録不要。',
      ko: 'YouTube 동영상을 SEO 최적화된 블로그 글로 변환하는 무료 AI 도구. 링크만 붙여넣으면 몇 분 안에 완성.',
    },
  }

  for (const tool of TOOL_PAGES) {
    for (const lang of SEO_LANGUAGES) {
      const keyword = tool.keywords[lang.code] || tool.keywords.en || tool.slug.replace(/-/g, ' ')
      const titleTemplate = titles[tool.slug]?.[lang.code] ||
        `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} — Free AI Tool | ailomo`
      const descTemplate = descriptions[tool.slug]?.[lang.code] ||
        `Free AI ${keyword} tool. Convert audio/video to text and repurpose content in ${lang.nativeName}. No signup.`

      configs.push({
        lang: lang.code,
        toolSlug: tool.slug,
        url: `/${lang.code}/tools/${tool.slug}`,
        title: titleTemplate,
        description: descTemplate,
        h1: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
        canonical: `${SITE_URL}/tools/${tool.slug}`,
        languageName: lang.nativeName,
        keyword,
      })
    }
  }

  return configs
}

function generateSitemapEntries(configs: PSEOConfig[]) {
  const entries = configs.map((c) =>
    `  <url><loc>${SITE_URL}${c.url}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority><xhtml:link rel="alternate" hreflang="${c.lang}" href="${SITE_URL}${c.url}"/><xhtml:link rel="alternate" hreflang="x-default" href="${c.canonical}"/></url>`
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`

  const outDir = path.join(process.cwd(), 'public')
  fs.writeFileSync(path.join(outDir, 'sitemap-pseo.xml'), sitemap)
  console.log(`✅ Sitemap saved: public/sitemap-pseo.xml (${entries.length} entries)`)
}

async function main() {
  console.log('\n🔧 ailomo PSEO Generator')
  console.log('='.repeat(50))

  const configs = generatePSEOConfigs()

  // Stats
  const languages = new Set(configs.map((c) => c.lang))
  const tools = new Set(configs.map((c) => c.toolSlug))
  console.log(`   Tools: ${tools.size} | Languages: ${languages.size}`)
  console.log(`   Total pages: ${configs.length}`)
  console.log(`   Estimted SEO coverage: ${configs.length} pages × multi-keyword targeting`)

  generateSitemapEntries(configs)

  // Save configs for route generation
  const outDir = path.join(process.cwd(), 'content/seo')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'pseo-configs.json'),
    JSON.stringify(configs, null, 2)
  )
  console.log(`✅ Configs saved: content/seo/pseo-configs.json`)

  // Print top pages by language
  const byLang = new Map<string, number>()
  configs.forEach((c) => byLang.set(c.lang, (byLang.get(c.lang) || 0) + 1))
  console.log(`\n📊 Pages per language:`)
  for (const [lang, count] of [...byLang.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`   ${lang}: ${count} pages`)
  }
  console.log('='.repeat(50))
}

main().catch(console.error)

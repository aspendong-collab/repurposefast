import type { Metadata } from 'next'
import { ArrowRight, FileText, Sparkles, TrendingUp, Globe, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'YouTube 视频转博客文章 - AI 一键生成 | RePurposeFast',
  description:
    '将 YouTube 视频一键转为高质量博客文章。AI 智能转写+改写，保留原意同时优化结构和可读性。支持中英文，免费试用。',
  openGraph: {
    title: 'YouTube 视频转博客文章 - AI 一键生成',
    description:
      '将 YouTube 视频一键转为高质量博客文章。AI 智能转写+改写，支持中英文。',
  },
  alternates: {
    canonical: '/tools/youtube-to-blog-post',
  },
}

const features = [
  {
    icon: Sparkles,
    title: 'AI 智能改写',
    desc: '不只是逐字转写，而是理解内容后重新组织为适合阅读的博客结构',
  },
  {
    icon: Globe,
    title: '双语支持',
    desc: '支持中英文输出，自动检测视频语言，可跨语言转换',
  },
  {
    icon: TrendingUp,
    title: 'SEO 优化',
    desc: '自动生成 SEO 友好的标题、描述和关键词，提升搜索引擎排名',
  },
  {
    icon: Zap,
    title: '极速处理',
    desc: '10 分钟视频 1 分钟内完成转写和文章生成',
  },
]

const steps = [
  { title: '粘贴链接', desc: '复制 YouTube 视频链接，粘贴到输入框' },
  { title: 'AI 转写', desc: '我们的 AI 自动将视频语音转为文字' },
  { title: '智能改写', desc: 'AI 将转录文本改写为结构化博客文章' },
  { title: '一键发布', desc: '复制或下载文章，直接发布到你的博客平台' },
]

export default function YouTubeToBlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <FileText className="h-4 w-4" />
            YouTube → 博客文章
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            YouTube 视频一键转
            <span className="gradient-premium-text">高质量博客文章</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            粘贴 YouTube 链接，AI 自动将视频内容转为结构化、可读性强、SEO 友好的博客文章。
            支持中英文，让你的视频内容产生更大价值。
          </p>

          <Link
            href="/repurpose"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            免费试用
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <f.icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">如何使用</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="mb-1 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:p-12">
          <h2 className="text-2xl font-bold">开始转化你的第一条视频</h2>
          <p className="mt-3 text-muted-foreground">
            免费试用，无需信用卡。支持 YouTube、B站等主流平台。
          </p>
          <Link
            href="/repurpose"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            立即开始
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import { ArrowRight, Heart, Sparkles, Hash, Wand2, Zap } from 'lucide-react'
import Link from 'next/link'
import { RelatedBlogs } from '@/components/seo/crosslinks'

export const metadata: Metadata = {
  title: '视频转小红书笔记 - AI 智能改写种草文案 | RePurposeFast',
  description:
    '视频一键转小红书笔记。AI 智能生成 emoji 种草风格的图文内容，自动配上热门话题标签。让你的视频内容在小红书获得更多曝光。',
  openGraph: {
    title: '视频转小红书笔记 - AI 智能改写',
    description: '视频一键转小红书笔记，emoji 种草风格 + 热门标签。',
  },
  alternates: { canonical: '/tools/video-to-xiaohongshu' },
}

export default function VideoToXiaohongshuPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Heart className="h-4 w-4" />
            视频 → 小红书笔记
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            视频一键转
            <span className="gradient-premium-text">小红书种草笔记</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI 理解视频内容，自动生成小红书风格的种草笔记。emoji 拉满、短句排版、热门标签，让你的内容在小红书轻松获赞。
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

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Wand2, title: '种草风格', desc: '自动生成真诚分享式的种草文案，像朋友推荐一样自然' },
            { icon: Sparkles, title: 'Emoji 润色', desc: '智能添加 emoji，提升笔记亲和力和阅读体验' },
            { icon: Hash, title: '热门标签', desc: '自动匹配相关话题标签，提升笔记曝光量' },
            { icon: Zap, title: '即时生成', desc: '粘贴链接，10 秒内生成可发布的完整笔记' },
            { icon: Sparkles, title: '短句排版', desc: '每句一行，适合手机端快速阅读' },
            { icon: Heart, title: '互动引导', desc: '结尾自动加上互动引导，提高点赞收藏率' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <f.icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <RelatedBlogs slug="video-to-xiaohongshu" />
    </div>
  )
}

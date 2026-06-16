import type { Metadata } from 'next'
import { ArrowRight, MessageCircle, Sparkles, Zap, PenLine, Hash } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '视频转 Twitter/X 线程 - AI 自动生成推文串 | RePurposeFast',
  description:
    '将视频内容自动转化为 Twitter/X 线程。AI 提取关键观点，生成 Hook 开头、分点论述、CTA 结尾的完整推文串。一次生成 6-12 条。',
  openGraph: {
    title: '视频转 Twitter/X 线程 - AI 自动生成',
    description: '将视频内容自动转化为 Twitter/X 线程，Hook + 观点 + CTA。',
  },
  alternates: { canonical: '/tools/video-to-twitter-thread' },
}

const features = [
  { icon: Sparkles, title: 'AI Hook 生成', desc: '自动生成吸引人的第一条推文，让人忍不住点开查看全文' },
  { icon: PenLine, title: '观点提炼', desc: '从视频中提取 6-12 个关键观点，每条控制在 280 字符以内' },
  { icon: Hash, title: '自动 CTA', desc: '最后一条自动生成点赞/收藏/关注引导，提升互动率' },
  { icon: Zap, title: '即时生成', desc: '粘贴链接，10 秒内生成完整线程' },
]

export default function VideoToTwitterPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <MessageCircle className="h-4 w-4" />
            视频 → Twitter/X 线程
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            视频一键转
            <span className="gradient-premium-text">Twitter/X 推文串</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            粘贴视频链接，AI 自动提取关键观点，生成完整的 Twitter/X 线程。
            Hook 开头 + 分点论述 + CTA 结尾，一次搞定 6-12 条推文。
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

      <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:p-12">
          <h2 className="text-2xl font-bold">让你的视频内容在 X 上引爆讨论</h2>
          <p className="mt-3 text-muted-foreground">
            免费试用，无需注册。
          </p>
          <Link
            href="/repurpose"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            立即生成推文串
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

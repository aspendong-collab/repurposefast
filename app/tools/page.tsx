import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// All tool landing pages
const tools = [
  {
    href: '/tools/youtube-to-blog-post',
    title: 'YouTube 转博客文章',
    desc: '将 YouTube 视频一键转为高质量博客文章，AI 智能改写优化结构',
  },
  {
    href: '/tools/video-to-twitter-thread',
    title: '视频转 Twitter/X 线程',
    desc: '视频内容自动转为推文串，Hook + 观点 + CTA 完整结构',
  },
  {
    href: '/tools/video-to-xiaohongshu',
    title: '视频转小红书笔记',
    desc: '视频一键转种草风格笔记，emoji + 短句 + 热门标签',
  },
  {
    href: '/tools/video-to-linkedin-post',
    title: '视频转 LinkedIn 帖子',
    desc: '视频内容转为专业 LinkedIn 帖子，个人见解 + 行业洞察',
  },
  {
    href: '/tools/podcast-to-article',
    title: '播客转文章',
    desc: '播客音频一键转为结构化文章，适合博客和 Newsletter',
  },
  {
    href: '/tools/video-to-seo-article',
    title: '视频转 SEO 文章',
    desc: '视频内容转为 SEO 优化的长文，含关键词和元描述',
  },
  {
    href: '/tools/audio-to-text',
    title: '音频转文字',
    desc: '上传音频文件，AI 自动转写为文字，支持 18+ 语言',
  },
  {
    href: '/tools/video-to-subtitle',
    title: '视频转字幕',
    desc: '自动生成 SRT 字幕文件，可直接导入视频平台使用',
  },
  {
    href: '/tools/meeting-to-notes',
    title: '会议录音转纪要',
    desc: '会议录音一键转为结构化会议纪要，含待办事项提取',
  },
  {
    href: '/tools/interview-transcript',
    title: '采访录音转文字稿',
    desc: '采访/访谈录音自动转写，AI 整理为结构化访谈稿',
  },
  {
    href: '/tools/video-content-repurposing',
    title: '视频内容复用',
    desc: '一条视频一键生成多平台内容，公众号+小红书+Twitter+LinkedIn',
  },
  {
    href: '/tools/mp4-to-text',
    title: 'MP4 转文字',
    desc: '上传 MP4 视频文件，AI 自动转写为文字',
  },
]

export const metadata: Metadata = {
  title: 'AI 内容转化工具 - 视频/音频转文字、转文章 | RePurposeFast',
  description:
    '一站式 AI 内容转化工具集。视频转文章、转推文、转小红书笔记、转字幕。让你的内容在各大平台发挥最大价值。',
  alternates: { canonical: '/tools' },
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden pb-8 pt-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="orb orb-1" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI 内容转化<span className="gradient-premium-text">工具集</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            从视频/音频到文字、文章、帖子的全流程 AI 转化工具
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <h3 className="flex items-center gap-2 font-semibold group-hover:text-primary">
                {tool.title}
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

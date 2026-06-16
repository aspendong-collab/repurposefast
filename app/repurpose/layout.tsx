import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '视频内容一键复用 - AI 转写 + 多平台发布 | RePurposeFast',
  description:
    '上传视频或粘贴链接，AI 自动转写为文字，并一键生成公众号文章、小红书笔记、Twitter 线程、LinkedIn 帖子、SEO 文章等多种内容格式。让一条视频变身为全平台内容矩阵。',
  openGraph: {
    title: '视频内容一键复用 - AI 转写 + 多平台发布',
    description:
      '上传视频或粘贴链接，AI 自动转写并生成多平台内容。支持公众号、小红书、Twitter、LinkedIn 等格式。',
  },
}

export default function RepurposeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

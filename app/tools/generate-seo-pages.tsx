// ── SEO Landing Page Generator ───────────────────────────────────────────────
// Each tool page has the same structure but unique SEO metadata.
// This file defines all tool pages for consistent generation.

import type { Metadata } from 'next'

interface ToolPageConfig {
  slug: string
  title: string
  description: string
  h1: string
  badge: string
  features: { title: string; desc: string }[]
  ogTitle: string
  ogDescription: string
}

/**
 * All tool page configurations.
 * When adding a new tool, just add an entry here and create the route.
 */
export const toolPages: ToolPageConfig[] = [
  {
    slug: 'youtube-to-blog-post',
    title: 'YouTube 视频转博客文章 - AI 一键生成 | RePurposeFast',
    description:
      '将 YouTube 视频一键转为高质量博客文章。AI 智能转写+改写，保留原意同时优化结构和可读性。支持中英文，免费试用。',
    h1: 'YouTube 视频一键转高质量博客文章',
    badge: 'YouTube → 博客文章',
    ogTitle: 'YouTube 视频转博客文章 - AI 一键生成',
    ogDescription: '将 YouTube 视频一键转为高质量博客文章。AI 智能转写+改写，支持中英文。',
    features: [
      { title: 'AI 智能改写', desc: '不只是逐字转写，而是理解内容后重新组织为适合阅读的博客结构' },
      { title: '双语支持', desc: '支持中英文输出，自动检测视频语言，可跨语言转换' },
      { title: 'SEO 优化', desc: '自动生成 SEO 友好的标题、描述和关键词' },
      { title: '极速处理', desc: '10 分钟视频 1 分钟内完成转写和文章生成' },
    ],
  },
  {
    slug: 'video-to-twitter-thread',
    title: '视频转 Twitter/X 线程 - AI 自动生成推文串 | RePurposeFast',
    description:
      '将视频内容自动转化为 Twitter/X 线程。AI 提取关键观点，生成 Hook 开头、分点论述、CTA 结尾的完整推文串。',
    h1: '视频一键转 Twitter/X 推文串',
    badge: '视频 → Twitter/X 线程',
    ogTitle: '视频转 Twitter/X 线程 - AI 自动生成',
    ogDescription: '将视频内容自动转化为 Twitter/X 线程，Hook + 观点 + CTA。',
    features: [
      { title: 'AI Hook 生成', desc: '自动生成吸引人的第一条推文' },
      { title: '观点提炼', desc: '从视频中提取6-12个关键观点，每条280字符以内' },
      { title: '自动 CTA', desc: '最后一条自动生成互动引导' },
      { title: '即时生成', desc: '粘贴链接，10秒内生成完整线程' },
    ],
  },
  {
    slug: 'video-to-xiaohongshu',
    title: '视频转小红书笔记 - AI 智能改写种草文案 | RePurposeFast',
    description:
      '视频一键转小红书笔记。AI 智能生成 emoji 种草风格的图文内容，自动配上热门话题标签。',
    h1: '视频一键转小红书种草笔记',
    badge: '视频 → 小红书笔记',
    ogTitle: '视频转小红书笔记 - AI 智能改写',
    ogDescription: '视频一键转小红书笔记，emoji 种草风格 + 热门标签。',
    features: [
      { title: '种草风格', desc: '自动生成真诚分享式的种草文案' },
      { title: 'Emoji 润色', desc: '智能添加 emoji，提升亲和力' },
      { title: '热门标签', desc: '自动匹配话题标签，提升曝光' },
      { title: '短句排版', desc: '每句一行，适合手机端阅读' },
    ],
  },
  {
    slug: 'video-to-linkedin-post',
    title: '视频转 LinkedIn 帖子 - 专业内容一键生成 | RePurposeFast',
    description:
      '将视频内容转为专业 LinkedIn 帖子。保留关键信息，增加个人观点和互动引导，提升职场影响力。',
    h1: '视频一键转 LinkedIn 专业帖子',
    badge: '视频 → LinkedIn 帖子',
    ogTitle: '视频转 LinkedIn 帖子 - 专业内容生成',
    ogDescription: '将视频内容转为 LinkedIn 专业帖子，增加职场影响力。',
    features: [
      { title: '专业风格', desc: '保持专业但不枯燥，有个人观点和态度' },
      { title: '段落优化', desc: '使用空行分隔段落，提升移动端可读性' },
      { title: '互动引导', desc: '结尾加提问，鼓励评论区讨论' },
      { title: 'Hashtag 推荐', desc: '自动添加3-5个相关行业标签' },
    ],
  },
  {
    slug: 'podcast-to-article',
    title: '播客转文章 - AI 自动转化播客内容 | RePurposeFast',
    description:
      '播客/音频一键转为结构化文章。适合 Newsletter、博客发布，让你的音频内容触达更多读者。',
    h1: '播客音频一键转为结构化文章',
    badge: '播客 → 文章',
    ogTitle: '播客转文章 - AI 自动转化',
    ogDescription: '播客/音频一键转为结构化文章，适合 Newsletter 和博客。',
    features: [
      { title: '自动分段', desc: '根据对话节奏自动分段，结构清晰' },
      { title: '提取金句', desc: '自动识别和标注关键观点和金句' },
      { title: 'Newsletter 格式', desc: '支持 Newsletter 邮件格式输出' },
      { title: '多格式导出', desc: '支持 Markdown/PDF/DOCX 多种下载格式' },
    ],
  },
  {
    slug: 'video-to-seo-article',
    title: '视频转 SEO 文章 - AI 优化搜索引擎排名 | RePurposeFast',
    description:
      '视频内容转为 SEO 优化的长文。自动生成 H2/H3 结构、关键词优化、元描述，提升搜索排名。',
    h1: '视频一键转 SEO 优化文章',
    badge: '视频 → SEO 文章',
    ogTitle: '视频转 SEO 文章 - AI 优化搜索排名',
    ogDescription: '视频内容转为 SEO 优化长文，自动生成关键词和元描述。',
    features: [
      { title: '关键词优化', desc: '自动提取和融入长尾关键词' },
      { title: '结构化内容', desc: 'H2/H3 标题层级清晰，提升可读性' },
      { title: '元数据生成', desc: '自动生成 SEO Title 和 Meta Description' },
      { title: '内链建议', desc: '提供相关内容链接建议' },
    ],
  },
  {
    slug: 'audio-to-text',
    title: '音频转文字 - AI 语音识别在线工具 | RePurposeFast',
    description:
      '免费在线音频转文字工具。上传音频文件，AI 自动转写为文字。支持 MP3/WAV/M4A 等格式，18+ 语言。',
    h1: '音频文件一键转为文字',
    badge: '音频 → 文字',
    ogTitle: '音频转文字 - AI 语音识别工具',
    ogDescription: '上传音频文件，AI 自动转写为文字，支持18+语言。',
    features: [
      { title: '多格式支持', desc: 'MP3/WAV/M4A/FLAC/OGG 等主流格式' },
      { title: '18+ 语言', desc: '中英日韩法德西葡阿拉伯等语言' },
      { title: '高准确率', desc: '基于最新 AI 模型，准确率95%+' },
      { title: '免费额度', desc: '每月免费转写 60 分钟' },
    ],
  },
  {
    slug: 'video-to-subtitle',
    title: '视频转字幕 - AI 自动生成 SRT/VTT 字幕 | RePurposeFast',
    description:
      '视频自动生成字幕文件。支持 SRT/VTT 格式导出，可直接导入 YouTube/B站/抖音等视频平台。',
    h1: '视频一键生成 SRT 字幕文件',
    badge: '视频 → 字幕',
    ogTitle: '视频转字幕 - AI 自动生成 SRT/VTT',
    ogDescription: '视频自动生成字幕文件，支持 SRT/VTT 格式，可直接导入视频平台。',
    features: [
      { title: 'SRT/VTT 格式', desc: '标准字幕格式，兼容所有主流平台' },
      { title: '时间轴精确', desc: 'AI 自动对齐时间轴，无需手动调整' },
      { title: '多语言字幕', desc: '支持生成中英日韩等多种语言字幕' },
      { title: '在线编辑', desc: '生成后可在线微调修正' },
    ],
  },
  {
    slug: 'meeting-to-notes',
    title: '会议录音转纪要 - AI 自动整理会议内容 | RePurposeFast',
    description:
      '上传会议录音，AI 自动生成结构化会议纪要。含待办事项提取、决策记录、关键讨论总结。',
    h1: '会议录音一键生成会议纪要',
    badge: '会议 → 纪要',
    ogTitle: '会议录音转纪要 - AI 自动整理',
    ogDescription: '上传会议录音，AI 自动生成结构化会议纪要。',
    features: [
      { title: '智能分段', desc: '按讨论话题自动分段整理' },
      { title: '待办提取', desc: '自动识别和提取 Action Items' },
      { title: '决策记录', desc: '标注会议中的关键决策和结论' },
      { title: '参会人识别', desc: '多人场景下区分不同发言人' },
    ],
  },
  {
    slug: 'interview-transcript',
    title: '采访录音转文字稿 - AI 结构化整理 | RePurposeFast',
    description:
      '采访/访谈录音自动转写，AI 整理为结构化访谈稿。支持 Q&A 格式输出，自动区分提问者和回答者。',
    h1: '采访录音一键转为结构化访谈稿',
    badge: '采访 → 文字稿',
    ogTitle: '采访录音转文字稿 - AI 结构化整理',
    ogDescription: '采访录音自动转写，AI 整理为结构化访谈稿。',
    features: [
      { title: 'Q&A 格式', desc: '自动识别问答结构，一问一答清晰排版' },
      { title: '说话人区分', desc: '区分主持人/记者的提问和受访者的回答' },
      { title: '金句高亮', desc: '自动标注访谈中的精彩语录' },
      { title: '摘要生成', desc: '自动生成访谈核心内容摘要' },
    ],
  },
  {
    slug: 'video-content-repurposing',
    title: '视频内容复用 - 一条视频多平台分发 | RePurposeFast',
    description:
      '视频内容一站式复用工具。一条视频同时生成公众号文章、小红书笔记、Twitter 线程、LinkedIn 帖子等。',
    h1: '一条视频，变身全平台内容矩阵',
    badge: '视频 → 全平台内容',
    ogTitle: '视频内容复用 - 多平台分发',
    ogDescription: '一条视频同时生成公众号、小红书、Twitter、LinkedIn 内容。',
    features: [
      { title: '10 种格式', desc: '公众号、小红书、Twitter、LinkedIn 等' },
      { title: '一次生成', desc: '选好格式，一次生成所有平台内容' },
      { title: '风格适配', desc: '每种格式自动适配平台独特风格' },
      { title: '效率 10x', desc: '5 分钟完成原本需要 2 小时的工作' },
    ],
  },
  {
    slug: 'mp4-to-text',
    title: 'MP4 转文字 - 在线提取视频中的文字 | RePurposeFast',
    description:
      '上传 MP4 视频文件，AI 自动提取语音并转为文字。支持高质量转写，可直接导出文本文件。',
    h1: 'MP4 视频一键提取文字',
    badge: 'MP4 → 文字',
    ogTitle: 'MP4 转文字 - 在线提取视频文字',
    ogDescription: '上传 MP4 视频文件，AI 自动提取语音并转为文字。',
    features: [
      { title: '支持大文件', desc: '最大支持 500MB MP4 文件' },
      { title: '高准确率', desc: '清晰语音准确率可达 98%' },
      { title: '快速处理', desc: '30 分钟视频 3 分钟内完成' },
      { title: '多语言', desc: '自动检测语言，支持 18+ 语言' },
    ],
  },
]

/**
 * Generate metadata for a tool page.
 */
export function generateToolMetadata(slug: string): Metadata | null {
  const page = toolPages.find((p) => p.slug === slug)
  if (!page) return null

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.ogTitle,
      description: page.ogDescription,
    },
    alternates: {
      canonical: `/tools/${slug}`,
    },
  }
}

/**
 * Get a tool page config by slug.
 */
export function getToolConfig(slug: string): ToolPageConfig | undefined {
  return toolPages.find((p) => p.slug === slug)
}

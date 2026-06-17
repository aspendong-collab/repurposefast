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

/**
 * English tool page configurations — used for PSEO multi-language routes
 * and as the canonical English version of each tool page.
 */
export const toolPagesEn: ToolPageConfig[] = [
  {
    slug: 'youtube-to-blog-post',
    title: 'YouTube to Blog Post - AI One-Click Generator | ailomo',
    description: 'Convert YouTube videos into high-quality blog posts instantly. AI transcription + rewriting, preserves original meaning while optimizing structure.',
    h1: 'Turn YouTube Videos Into Blog Posts Instantly',
    badge: 'YouTube → Blog Post',
    ogTitle: 'YouTube to Blog Post - AI One-Click Generator',
    ogDescription: 'Convert YouTube videos into SEO-optimized blog posts with AI transcription and rewriting.',
    features: [
      { title: 'AI Rewriting', desc: 'Not just transcription — AI understands content and reorganizes it for blog readability' },
      { title: 'SEO Optimized', desc: 'Auto-generates SEO-friendly titles, meta descriptions, and keyword-rich content' },
      { title: 'Multi-Language', desc: 'Detect source language and translate output to 20+ languages' },
      { title: 'Lightning Fast', desc: '10-minute video transcribed and article generated in under 1 minute' },
    ],
  },
  {
    slug: 'video-to-twitter-thread',
    title: 'Video to Twitter/X Thread - AI Auto Generator | ailomo',
    description: 'Transform video content into engaging Twitter/X threads. AI extracts key insights and creates Hook + points + CTA structure.',
    h1: 'Turn Videos Into Viral Twitter/X Threads',
    badge: 'Video → Twitter Thread',
    ogTitle: 'Video to Twitter/X Thread - AI Auto Generator',
    ogDescription: 'Transform video content into Twitter/X threads with AI — Hook + insights + CTA.',
    features: [
      { title: 'AI Hook Generator', desc: 'Auto-creates attention-grabbing first tweet' },
      { title: 'Insight Extraction', desc: 'Extracts 6-12 key points under 280 characters each' },
      { title: 'Auto CTA', desc: 'Ends with engagement-driving call-to-action' },
      { title: 'Instant Output', desc: 'Paste a link, get a complete thread in 10 seconds' },
    ],
  },
  {
    slug: 'video-to-xiaohongshu',
    title: 'Video to Xiaohongshu Note - AI Style Generator | ailomo',
    description: 'Turn videos into Xiaohongshu-style notes. AI generates emoji-rich review-style content with trending hashtags.',
    h1: 'Turn Videos Into Xiaohongshu (RED) Notes',
    badge: 'Video → Xiaohongshu Note',
    ogTitle: 'Video to Xiaohongshu Note - AI Generator',
    ogDescription: 'Turn videos into Xiaohongshu notes with emoji style + trending hashtags.',
    features: [
      { title: 'Review Style', desc: 'Auto-generates authentic review-style copy that feels personal' },
      { title: 'Emoji Polish', desc: 'Smart emoji placement for warmth and engagement' },
      { title: 'Trending Hashtags', desc: 'Auto-matches relevant topic hashtags for visibility' },
      { title: 'Mobile Format', desc: 'One line per sentence, optimized for phone reading' },
    ],
  },
  {
    slug: 'video-to-linkedin-post',
    title: 'Video to LinkedIn Post - Professional Content Generator | ailomo',
    description: 'Convert video content into professional LinkedIn posts. Maintains key insights while adding personal perspective and engagement hooks.',
    h1: 'Turn Videos Into LinkedIn Professional Posts',
    badge: 'Video → LinkedIn Post',
    ogTitle: 'Video to LinkedIn Post - Professional Generator',
    ogDescription: 'Convert videos into professional LinkedIn posts with personal insights.',
    features: [
      { title: 'Professional Tone', desc: 'Professional yet engaging, with personal perspectives' },
      { title: 'Paragraph Optimization', desc: 'Line breaks for mobile readability' },
      { title: 'Engagement Hooks', desc: 'Ends with questions to spark comments' },
      { title: 'Hashtag Recommendations', desc: 'Auto-adds 3-5 relevant industry hashtags' },
    ],
  },
  {
    slug: 'podcast-to-article',
    title: 'Podcast to Article - AI Content Converter | ailomo',
    description: 'Convert podcast/audio into structured articles. Perfect for newsletters and blog publishing.',
    h1: 'Turn Podcast Audio Into Structured Articles',
    badge: 'Podcast → Article',
    ogTitle: 'Podcast to Article - AI Converter',
    ogDescription: 'Convert podcast audio into structured articles for newsletters and blogs.',
    features: [
      { title: 'Auto Segmentation', desc: 'Segments by conversation rhythm for clear structure' },
      { title: 'Quote Extraction', desc: 'Auto-identifies and highlights golden quotes' },
      { title: 'Newsletter Format', desc: 'Outputs in newsletter-friendly format' },
      { title: 'Multi-Format Export', desc: 'Download as Markdown, PDF, or DOCX' },
    ],
  },
  {
    slug: 'video-to-seo-article',
    title: 'Video to SEO Article - AI Search Optimizer | ailomo',
    description: 'Convert video content into SEO-optimized long-form articles. Auto H2/H3 structure, keyword optimization, and meta descriptions.',
    h1: 'Turn Videos Into SEO-Optimized Articles',
    badge: 'Video → SEO Article',
    ogTitle: 'Video to SEO Article - AI Optimizer',
    ogDescription: 'Convert video content into SEO-optimized long-form articles with keyword targeting.',
    features: [
      { title: 'Keyword Optimization', desc: 'Auto-extracts and integrates long-tail keywords' },
      { title: 'Structured Content', desc: 'Clear H2/H3 hierarchy for readability' },
      { title: 'Meta Generation', desc: 'Auto-generates SEO title and meta description' },
      { title: 'Internal Link Suggestions', desc: 'Recommends relevant internal linking opportunities' },
    ],
  },
  {
    slug: 'audio-to-text',
    title: 'Audio to Text - AI Speech Recognition | ailomo',
    description: 'Free online audio transcription tool. Upload audio files and get AI-powered text conversion in 63+ languages.',
    h1: 'Convert Audio Files to Text Instantly',
    badge: 'Audio → Text',
    ogTitle: 'Audio to Text - AI Speech Recognition',
    ogDescription: 'Upload audio files for AI-powered text conversion in 63+ languages.',
    features: [
      { title: 'Wide Format Support', desc: 'MP3, WAV, M4A, FLAC, OGG, and more' },
      { title: '63+ Languages', desc: 'English, Chinese, Japanese, Korean, Spanish, French, and more' },
      { title: 'High Accuracy', desc: '95%+ accuracy with latest AI models' },
      { title: 'Free Tier', desc: '60 minutes of free transcription per month' },
    ],
  },
  {
    slug: 'video-to-subtitle',
    title: 'Video to Subtitle - AI SRT/VTT Generator | ailomo',
    description: 'Auto-generate subtitle files from video. Supports SRT/VTT export for YouTube, Bilibili, TikTok, and more.',
    h1: 'Generate SRT/VTT Subtitles From Videos',
    badge: 'Video → Subtitle',
    ogTitle: 'Video to Subtitle - AI SRT/VTT Generator',
    ogDescription: 'Auto-generate SRT/VTT subtitle files compatible with all major video platforms.',
    features: [
      { title: 'SRT & VTT Formats', desc: 'Standard subtitle formats, compatible with all platforms' },
      { title: 'Accurate Timestamps', desc: 'AI auto-aligns timestamps, no manual adjustment needed' },
      { title: 'Multi-Language Subs', desc: 'Generate subtitles in multiple languages' },
      { title: 'Online Editor', desc: 'Fine-tune subtitles in the online editor' },
    ],
  },
  {
    slug: 'meeting-to-notes',
    title: 'Meeting Recording to Notes - AI Summarizer | ailomo',
    description: 'Upload meeting recordings and get structured meeting notes. Includes action items extraction, decision tracking, and key discussion summaries.',
    h1: 'Turn Meeting Recordings Into Actionable Notes',
    badge: 'Meeting → Notes',
    ogTitle: 'Meeting Recording to Notes - AI Summarizer',
    ogDescription: 'Upload meeting recordings for structured notes with action items and decisions.',
    features: [
      { title: 'Smart Segmentation', desc: 'Auto-segments by discussion topics' },
      { title: 'Action Item Extraction', desc: 'Auto-identifies and lists action items' },
      { title: 'Decision Tracking', desc: 'Highlights key decisions and conclusions' },
      { title: 'Speaker Recognition', desc: 'Distinguishes between different speakers' },
    ],
  },
  {
    slug: 'interview-transcript',
    title: 'Interview Recording to Transcript - AI Structurer | ailomo',
    description: 'Transcribe interview recordings and get structured Q&A transcripts. Auto-distinguishes interviewer from interviewee.',
    h1: 'Turn Interview Recordings Into Structured Transcripts',
    badge: 'Interview → Transcript',
    ogTitle: 'Interview Recording to Transcript - AI',
    ogDescription: 'Transcribe interviews into structured Q&A format with speaker distinction.',
    features: [
      { title: 'Q&A Format', desc: 'Auto-detects Q&A structure for clean formatting' },
      { title: 'Speaker Distinction', desc: 'Separates host questions from guest answers' },
      { title: 'Quote Highlighting', desc: 'Auto-flags standout quotes from the interview' },
      { title: 'Summary Generation', desc: 'Auto-generates interview summary' },
    ],
  },
  {
    slug: 'video-content-repurposing',
    title: 'Video Content Repurposing - One Video, All Platforms | ailomo',
    description: 'One-stop content repurposing tool. One video generates blog posts, social media content, newsletters, and more simultaneously.',
    h1: 'One Video → Your Entire Content Matrix',
    badge: 'Video → All Platforms',
    ogTitle: 'Video Content Repurposing - Multi-Platform',
    ogDescription: 'One video generates content for blogs, Twitter, LinkedIn, Xiaohongshu, and more.',
    features: [
      { title: '10+ Formats', desc: 'Blog, Twitter, LinkedIn, Xiaohongshu, newsletters & more' },
      { title: 'One-Click Generation', desc: 'Select formats and generate all at once' },
      { title: 'Style Adaptation', desc: 'Each format auto-adapts to platform-specific style' },
      { title: '10x Efficiency', desc: '5 minutes instead of 2 hours of manual work' },
    ],
  },
  {
    slug: 'mp4-to-text',
    title: 'MP4 to Text - Extract Text From Video | ailomo',
    description: 'Upload MP4 video files and extract speech as text. High-quality transcription with text file download.',
    h1: 'Extract Text From MP4 Video Files',
    badge: 'MP4 → Text',
    ogTitle: 'MP4 to Text - Extract Video Text Online',
    ogDescription: 'Upload MP4 video files and extract speech as text automatically.',
    features: [
      { title: 'Large File Support', desc: 'Supports MP4 files up to 500MB' },
      { title: 'High Accuracy', desc: 'Up to 98% accuracy with clear audio' },
      { title: 'Fast Processing', desc: '30-minute video processed in under 3 minutes' },
      { title: 'Multi-Language', desc: 'Auto-detect language, supports 63+ languages' },
    ],
  },
]

// Lazy-load translations to avoid build-time file-not-found errors
let _translations: Record<string, Record<string, any>> | null = null
function loadTranslations() {
  if (_translations) return _translations
  try {
    _translations = require('@/content/seo/tool-translations.json') as Record<string, Record<string, any>>
  } catch {
    _translations = {}
  }
  return _translations
}

/**
 * Get tool page configs by locale.
 * Uses DeepSeek translations for non-en/non-zh, falls back to English.
 */
export function getToolPagesByLocale(lang: string): ToolPageConfig[] {
  if (lang === 'zh') return toolPages
  if (lang === 'en') return toolPagesEn

  // Try to load translated content
  try {
    const tl = loadTranslations()
    const langData = tl?.[lang]
    if (!langData) return toolPagesEn

    return toolPagesEn.map((page) => {
      const t = langData[page.slug]
      if (!t) return page
      return {
        ...page,
        title: t.title || page.title,
        description: t.description || page.description,
        h1: t.h1 || page.h1,
        badge: t.badge || page.badge,
        ogTitle: t.ogTitle || page.ogTitle,
        ogDescription: t.ogDescription || page.ogDescription,
        features: page.features.map((f, i) => ({
          title: t.features?.[i]?.title || f.title,
          desc: t.features?.[i]?.desc || f.desc,
        })),
      }
    })
  } catch {
    return toolPagesEn
  }
}

// ── Repurpose Module Types ──────────────────────────────────────────────────

/** Supported input source types */
export type InputSource = 'url' | 'file'

/** Supported platforms for URL input */
export type Platform = 'youtube' | 'bilibili' | 'tiktok' | 'xiaohongshu' | 'instagram' | 'podcast' | 'other'

/** Output content format styles */
export type OutputFormat =
  | 'blog-post'
  | 'wechat-article'
  | 'xiaohongshu'
  | 'twitter-thread'
  | 'linkedin-post'
  | 'seo-article'
  | 'newsletter'
  | 'subtitle-srt'
  | 'summary'
  | 'mindmap'

/** Job processing status */
export type JobStatus = 'pending' | 'transcribing' | 'transcribed' | 'repurposing' | 'completed' | 'failed'

/** Language code */
export type LanguageCode =
  | 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'ar' | 'hi'
  | 'id' | 'th' | 'vi' | 'ru' | 'it' | 'nl' | 'pl' | 'tr' | string

// ── Format Metadata ─────────────────────────────────────────────────────────

export interface FormatMeta {
  id: OutputFormat
  label: string
  description: string
  icon: string
  platforms: string[] // e.g., ["微信公众号", "博客"]
  estimatedTokens: number
  outputType: 'text' | 'srt' | 'json'
}

// ── Request / Response Types ─────────────────────────────────────────────────

export interface TranscribeRequest {
  source: InputSource
  url?: string
  fileKey?: string // Supabase storage key for uploaded file
  language?: LanguageCode
  platform?: Platform
}

export interface TranscribeResponse {
  jobId: string
  status: JobStatus
  transcript?: string
  detectedLanguage?: LanguageCode
  durationSeconds?: number
  segments?: TranscriptSegment[]
  error?: string
}

export interface TranscriptSegment {
  id: number
  start: number // seconds
  end: number
  text: string
  speaker?: string
}

export interface RepurposeRequest {
  jobId: string
  transcript: string
  formats: OutputFormat[]
  language?: LanguageCode
  context?: {
    title?: string
    platform?: Platform
    targetAudience?: string
    toneOfVoice?: string
    additionalInstructions?: string
  }
}

export interface ContentOutput {
  format: OutputFormat
  title: string
  content: string
  metadata?: {
    suggestedHashtags?: string[]
    keywords?: string[]
    readingTime?: number
    wordCount?: number
    seoTitle?: string
    seoDescription?: string
  }
}

export interface RepurposeResponse {
  jobId: string
  status: JobStatus
  outputs: ContentOutput[]
  error?: string
}

// ── Job Record (for storage) ─────────────────────────────────────────────────

export interface RepurposeJob {
  id: string
  created_at: string
  updated_at: string
  status: JobStatus
  source: InputSource
  source_url?: string
  source_platform?: Platform
  source_language?: LanguageCode
  transcript?: string
  transcript_segments?: TranscriptSegment[]
  duration_seconds?: number
  outputs?: ContentOutput[]
  error?: string
}

// ── Format Registry ─────────────────────────────────────────────────────────

export const OUTPUT_FORMATS: Record<OutputFormat, FormatMeta> = {
  'blog-post': {
    id: 'blog-post',
    label: '博客文章',
    description: '结构化长文，适合个人博客或 Medium',
    icon: 'FileText',
    platforms: ['个人博客', 'Medium', 'Substack'],
    estimatedTokens: 3000,
    outputType: 'text',
  },
  'wechat-article': {
    id: 'wechat-article',
    label: '公众号文章',
    description: '符合公众号阅读习惯的深度长文',
    icon: 'MessageSquare',
    platforms: ['微信公众号'],
    estimatedTokens: 3500,
    outputType: 'text',
  },
  'xiaohongshu': {
    id: 'xiaohongshu',
    label: '小红书笔记',
    description: '种草风格，emoji+短句+话题标签',
    icon: 'Heart',
    platforms: ['小红书'],
    estimatedTokens: 1500,
    outputType: 'text',
  },
  'twitter-thread': {
    id: 'twitter-thread',
    label: 'Twitter/X 线程',
    description: 'Hook 开头 + 观点拆解 + CTA 结尾',
    icon: 'Twitter',
    platforms: ['X/Twitter'],
    estimatedTokens: 2000,
    outputType: 'text',
  },
  'linkedin-post': {
    id: 'linkedin-post',
    label: 'LinkedIn 帖子',
    description: '专业风格，个人见解+行业洞察',
    icon: 'Linkedin',
    platforms: ['LinkedIn'],
    estimatedTokens: 1500,
    outputType: 'text',
  },
  'seo-article': {
    id: 'seo-article',
    label: 'SEO 优化文章',
    description: '带关键词优化、H2/H3 结构的文章',
    icon: 'Search',
    platforms: ['网站博客'],
    estimatedTokens: 4000,
    outputType: 'text',
  },
  'newsletter': {
    id: 'newsletter',
    label: 'Newsletter 邮件',
    description: '简洁有力，适合邮件订阅推送',
    icon: 'Mail',
    platforms: ['邮件订阅', 'Substack'],
    estimatedTokens: 1500,
    outputType: 'text',
  },
  'subtitle-srt': {
    id: 'subtitle-srt',
    label: '字幕文件 SRT',
    description: '标准 SRT 格式字幕文件',
    icon: 'ClosedCaptions',
    platforms: ['视频平台'],
    estimatedTokens: 1000,
    outputType: 'srt',
  },
  'summary': {
    id: 'summary',
    label: 'AI 摘要',
    description: '300-500 字精炼摘要',
    icon: 'Sparkles',
    platforms: ['通用'],
    estimatedTokens: 800,
    outputType: 'text',
  },
  'mindmap': {
    id: 'mindmap',
    label: '思维导图',
    description: 'Markdown 大纲格式，可导入 XMind',
    icon: 'GitFork',
    platforms: ['XMind', 'MindNode', 'Markmap'],
    estimatedTokens: 1000,
    outputType: 'text',
  },
}

export const LANGUAGE_LABELS: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
}

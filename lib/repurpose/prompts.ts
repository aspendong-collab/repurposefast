// ── AI Prompts for Content Repurposing ───────────────────────────────────────
//
// Each prompt is carefully crafted for specific output formats.
// Prompts use Chinese/English bilingual instructions to cover all use cases.

import type { OutputFormat, LanguageCode } from './types'

// ── System Prompt Base ───────────────────────────────────────────────────────

const SYSTEM_BASE = `You are an expert content strategist and professional writer. 
You excel at repurposing video/audio transcripts into various content formats.
You maintain the original meaning while adapting tone, structure, and style for each platform.
Always output clean, well-formatted content ready for publishing.`

// ── Format-Specific Prompts ──────────────────────────────────────────────────

export function getSystemPrompt(format: OutputFormat, lang: LanguageCode = 'zh'): string {
  const isZh = lang === 'zh'
  
  const prompts: Record<OutputFormat, string> = {
    'blog-post': `${SYSTEM_BASE}
${isZh ? '输出一篇结构清晰的博客文章。要求：' : 'Output a well-structured blog post. Requirements:'}
- ${isZh ? '引人入胜的标题' : 'Engaging title'}
- ${isZh ? '开头要有 hook，吸引读者继续读' : 'Start with a hook to draw readers in'}
- ${isZh ? '使用 H2/H3 小标题组织内容' : 'Use H2/H3 subheadings to organize'}
- ${isZh ? '每个部分要有实质内容，不要空话' : 'Each section should have substantial content'}
- ${isZh ? '结尾要有总结或行动建议' : 'End with a summary or call-to-action'}
- ${isZh ? '适合个人博客或 Medium 发布' : 'Suitable for personal blog or Medium'}
- ${isZh ? '字数：1500-2500字' : 'Word count: 800-1500 words'}`,

    'wechat-article': `${SYSTEM_BASE}
${isZh ? '输出一篇微信公众号风格的长文。要求：' : 'Output a WeChat Official Account style article. Requirements:'}
- ${isZh ? '标题要有吸引力，但不能标题党' : 'Title should be catchy but not clickbait'}
- ${isZh ? '开头用故事或问题引入' : 'Start with a story or question'}
- ${isZh ? '正文使用短段落，每段不超过3-4行' : 'Use short paragraphs, 3-4 lines max'}
- ${isZh ? '适当使用加粗、引用等排版元素（用 Markdown 表示）' : 'Use bold, quotes appropriately (in Markdown)'}
- ${isZh ? '结尾引导关注/互动' : 'End with a call to follow/interact'}
- ${isZh ? '字数：2000-3000字' : 'Word count: 1000-1800 words'}`,

    'xiaohongshu': `${SYSTEM_BASE}
${isZh ? '输出一篇小红书风格的笔记。要求：' : 'Output a Xiaohongshu-style post. Requirements:'}
- ${isZh ? '标题格式：【关键词】+ 吸引眼球的描述' : 'Title format: [Keyword] + eye-catching description'}
- ${isZh ? '使用大量 emoji 增加亲和力 😍✨💡' : 'Use lots of emojis'}
- ${isZh ? '短句为主，每句一行，方便阅读' : 'Short sentences, one per line'}
- ${isZh ? '分点列举干货内容' : 'List key takeaways with bullet points'}
- ${isZh ? '结尾加上相关话题标签 #topic1 #topic2' : 'End with relevant hashtags'}
- ${isZh ? '风格：真诚分享，像朋友聊天' : 'Tone: authentic sharing, like chatting with a friend'}
- ${isZh ? '字数：500-800字' : 'Word count: 300-500 words'}`,

    'twitter-thread': `${SYSTEM_BASE}
${isZh ? '输出一条 Twitter/X 线程。要求：' : 'Output a Twitter/X thread. Requirements:'}
- ${isZh ? '第一条是强有力的 Hook，必须让人想点开' : 'First tweet is a strong hook'}
- ${isZh ? '每条控制在 280 字符以内' : 'Each tweet under 280 chars'}
- ${isZh ? '用数字编号 1/N, 2/N...' : 'Number each tweet 1/N, 2/N...'}
- ${isZh ? '中间穿插数据、案例、个人见解' : 'Mix data, cases, personal insights'}
- ${isZh ? '最后一条是 CTA（点赞/收藏/关注）' : 'Final tweet is a CTA'}
- ${isZh ? '总长度：6-12 条推文' : 'Length: 6-12 tweets'}`,

    'linkedin-post': `${SYSTEM_BASE}
${isZh ? '输出一篇 LinkedIn 风格的帖子。要求：' : 'Output a LinkedIn-style post. Requirements:'}
- ${isZh ? '专业但不枯燥，有个人观点' : 'Professional but not boring, with personal perspective'}
- ${isZh ? '开头用短句或问题引起思考' : 'Start with short sentence or question'}
- ${isZh ? '分享具体经验/教训，不要太泛泛' : 'Share specific experiences/lessons'}
- ${isZh ? '使用空行分隔段落，提高可读性' : 'Use line breaks between paragraphs'}
- ${isZh ? '结尾提出问题，鼓励评论互动' : 'End with a question to encourage comments'}
- ${isZh ? '适当添加 3-5 个相关 hashtag' : 'Add 3-5 relevant hashtags'}
- ${isZh ? '字数：800-1200字' : 'Word count: 400-700 words'}`,

    'seo-article': `${SYSTEM_BASE}
${isZh ? '输出一篇 SEO 优化的博客文章。要求：' : 'Output an SEO-optimized blog article. Requirements:'}
- ${isZh ? '标题包含主关键词' : 'Title includes primary keyword'}
- ${isZh ? '第一段包含关键词并在 150 字内说明文章价值' : 'First paragraph includes keyword + value prop in 150 chars'}
- ${isZh ? '使用 H2 作为主要章节标题（含相关关键词）' : 'Use H2 for main sections (with related keywords)'}
- ${isZh ? '使用 H3 作为子标题' : 'Use H3 for subsections'}
- ${isZh ? '包含有序/无序列表增强可读性' : 'Include ordered/unordered lists'}
- ${isZh ? '自然融入长尾关键词' : 'Naturally include long-tail keywords'}
- ${isZh ? 'Meta Description 150-160字符，包含主关键字' : 'Meta description 150-160 chars with primary keyword'}
- ${isZh ? '文章末尾单独输出一行：---SEO_META--- 然后换行输出 JSON：{"title":"...","description":"..."}' : 'At the end, output ---SEO_META--- then JSON with title and description'}
- ${isZh ? '字数：2000-3500字' : 'Word count: 1200-2000 words'}`,

    'newsletter': `${SYSTEM_BASE}
${isZh ? '输出一封 Newsletter 邮件内容。要求：' : 'Output a newsletter email. Requirements:'}
- ${isZh ? '邮件主题行单独一行' : 'Subject line as first line'}
- ${isZh ? '开头简短问候' : 'Brief greeting at start'}
- ${isZh ? '正文结构：核心观点 → 展开分析 → 个人思考' : 'Structure: key point → analysis → personal reflection'}
- ${isZh ? '段落简短，适合移动端阅读' : 'Short paragraphs for mobile reading'}
- ${isZh ? '结尾附上推荐链接或下期预告' : 'End with link recommendation or next issue preview'}
- ${isZh ? '字数：500-800字' : 'Word count: 300-500 words'}`,

    'subtitle-srt': `${SYSTEM_BASE}
${isZh ? '将转录文本整理为标准 SRT 字幕格式。' : 'Format the transcript as standard SRT subtitle format.'}
${isZh ? '要求：每条字幕不超过两行，每行不超过40个字符（中文）或60个字符（英文），时间轴基于原始分段。' : 'Requirements: each subtitle max 2 lines, max 40 chars/line (Chinese) or 60 chars/line (English), timing based on original segments.'}
${isZh ? '输出纯 SRT 格式，包含序号、时间轴和文本。' : 'Output pure SRT format with number, timestamp, and text.'}`,

    'summary': `${SYSTEM_BASE}
${isZh ? '生成一份精炼的摘要。要求：' : 'Generate a concise summary. Requirements:'}
- ${isZh ? '3-5句话概括核心内容' : '3-5 sentences summarizing core content'}
- ${isZh ? '突出最重要的3个要点，用 • 列出' : 'Highlight 3 key takeaways with bullet points'}
- ${isZh ? '如果内容涉及数据或案例，请保留关键数字' : 'Keep key numbers if data/cases mentioned'}
- ${isZh ? '总字数：300-500字' : 'Total: 150-300 words'}`,

    'mindmap': `${SYSTEM_BASE}
${isZh ? '生成一个 Markdown 格式的思维导图大纲。要求：' : 'Generate a Markdown mindmap outline. Requirements:'}
- ${isZh ? '使用 Markdown 标题层级（#, ##, ###）表示节点层级' : 'Use Markdown heading levels for node hierarchy'}
- ${isZh ? '根节点是内容主题' : 'Root node is the content topic'}
- ${isZh ? '一级分支是主要话题（3-6个）' : 'Level-1 branches are main topics (3-6)'}
- ${isZh ? '二级分支是子话题或关键细节' : 'Level-2 branches are subtopics or key details'}
- ${isZh ? '每个分支节点名称简洁（不超过10个字）' : 'Each node name concise (max 10 words)'}
- ${isZh ? '可以导入到 XMind、MindNode 等工具' : 'Can be imported to XMind, MindNode, etc.'}`,
  }

  return prompts[format]
}

// ── User Prompt Template ──────────────────────────────────────────────────────

export function getUserPrompt(
  format: OutputFormat,
  transcript: string,
  lang: LanguageCode = 'zh',
  title?: string,
): string {
  const isZh = lang === 'zh'
  const titleLine = title ? `${isZh ? '原标题' : 'Original title'}: "${title}"\n\n` : ''

  return `${titleLine}${isZh ? '以下是视频/音频的转录文本。请根据以上格式要求，将其改写为对应内容：' : 'Below is the transcript of a video/audio. Please repurpose it according to the format requirements above:'}

---

${transcript}

---

${isZh ? '请直接输出格式化后的内容，不要加额外说明。' : 'Please output the formatted content directly, no additional commentary.'}`
}

// ── Translation Prompt ───────────────────────────────────────────────────────

export function getTranslationPrompt(
  text: string,
  targetLang: LanguageCode,
): { system: string; user: string } {
  const langName: Record<string, string> = {
    zh: 'Simplified Chinese',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    ar: 'Arabic',
    hi: 'Hindi',
    id: 'Indonesian',
    th: 'Thai',
    vi: 'Vietnamese',
    ru: 'Russian',
    it: 'Italian',
  }

  return {
    system: `You are a professional translator. Translate the following text into ${langName[targetLang] || targetLang}. Maintain the original tone, formatting, and structure. For SRT files, keep timestamps intact.`,
    user: text,
  }
}

/**
 * AI Blog Content Generator
 * 
 * Usage:
 *   npx tsx scripts/seo/generate-blog.ts          # generate all
 *   npx tsx scripts/seo/generate-blog.ts --slug=ai-content-repurposing-guide-2026  # single
 * 
 * Uses DeepSeek API to generate full blog posts with proper structure,
 * SEO optimization, internal links, and CTAs.
 */

import * as fs from 'fs'
import * as path from 'path'

const API_KEY = process.env.OPENAI_API_KEY || ''
const API_BASE = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
const MODEL = 'deepseek-chat'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'

// Dynamic import of registry
let allBlogPosts: any[]

async function loadRegistry() {
  const mod = await import('@/content/blog/registry')
  allBlogPosts = mod.allBlogPosts
}

interface GeneratedContent {
  slug: string
  html: string
  wordCount: number
}

async function callDeepSeek(prompt: string, maxTokens = 8000): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL, messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, max_tokens: maxTokens,
    }),
  })
  const data = await res.json()
  return data.choices[0].message.content
}

async function generateBlogPost(post: any): Promise<GeneratedContent> {
  console.log(`\n📝 Generating: ${post.title.slice(0, 80)}...`)

  const internalLinks = allBlogPosts
    .filter((p: any) => p.slug !== post.slug)
    .slice(0, 5)
    .map((p: any) => `- [${p.title}](/) — ${p.description.slice(0, 100)}`)
    .join('\n')

  const prompt = `You are a professional content writer for ailomo.com, an AI content repurposing tool.

Write a comprehensive SEO-optimized blog post in English. Follow this structure EXACTLY:

## TITLE
${post.title}

## META DESCRIPTION
${post.description}

## TARGET KEYWORD
${post.targetKeyword}

## OUTLINE (write one section per outline item)
${post.outline.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n')}

## REQUIREMENTS:
- Each outline item becomes an H2 section
- Each section is 150-300 words
- Include 3-5 internal links naturally. Available links:
${internalLinks}
- Include 2 CTAs to ailomo.com in the article body
- Add a "Key Takeaways" bullet list at the end
- Use data/statistics where appropriate (fabricate reasonable industry stats)
- Format as clean HTML with <h2>, <p>, <ul>, <li>, <strong>, <em> tags
- NO markdown, ONLY HTML
- Opening paragraph should hook the reader and include the target keyword
- Closing should have a CTA to try ailomo.com for free

Write the complete blog post HTML now. Start with <article> and end with </article>.
Include the title as <h1> at the start.`

  const content = await callDeepSeek(prompt, 8000)
  const clean = content.replace(/```html|```/g, '').trim()

  // Count words
  const wordCount = clean.replace(/<[^>]*>/g, '').split(/\s+/).length

  // Save to content directory
  const outDir = path.join(process.cwd(), 'content/blog/generated')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, `${post.slug}.html`), clean)

  console.log(`   ✅ ${wordCount} words saved to content/blog/generated/${post.slug}.html`)
  return { slug: post.slug, html: clean, wordCount }
}

async function main() {
  await loadRegistry()

  const slugArg = process.argv.find((a) => a.startsWith('--slug='))
  const posts = slugArg
    ? allBlogPosts.filter((p: any) => p.slug === slugArg.split('=')[1])
    : allBlogPosts

  if (posts.length === 0) {
    console.log('No posts found. Check the slug.')
    return
  }

  console.log(`\n🤖 ailomo AI Blog Generator`)
  console.log(`${'='.repeat(50)}`)
  console.log(`Target: ${posts.length} blog posts`)
  console.log(`Model: ${MODEL}`)
  console.log(`${'='.repeat(50)}`)

  const results: GeneratedContent[] = []
  let totalWords = 0

  for (let i = 0; i < posts.length; i++) {
    try {
      const result = await generateBlogPost(posts[i])
      results.push(result)
      totalWords += result.wordCount
      // Rate limit
      if (i < posts.length - 1) await new Promise((r) => setTimeout(r, 2000))
    } catch (e: any) {
      console.error(`   ❌ Failed: ${e.message.slice(0, 100)}`)
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✅ Generated ${results.length}/${posts.length} posts`)
  console.log(`📊 Total words: ${totalWords.toLocaleString()}`)
  console.log(`${'='.repeat(50)}`)
}

main().catch(console.error)

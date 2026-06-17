/**
 * SEO Cross-Link Engine
 * 
 * Compile-time cross-linking between Tool pages and Blog posts.
 * Matches by keyword overlap → generates contextual internal links.
 * 
 * Usage:
 *   import { getRelevantBlogs, getRelevantTools } from '@/lib/seo-crosslink'
 *   const blogs = getRelevantBlogs('youtube-to-blog-post') // → related blog posts
 *   const tools = getRelevantTools('ai-content-repurposing-guide-2026') // → related tools
 */

import { toolPages } from '@/app/tools/generate-seo-pages'
import { allBlogPosts } from '@/content/blog/registry'

// ── Keyword Extraction ──────────────────────────────────────────────────────

function extractKeywords(str: string): Set<string> {
  const stopWords = new Set([
    'video', 'to', 'the', 'a', 'an', 'and', 'or', 'for', 'in', 'of', 'with',
    'your', 'this', 'that', 'is', 'are', 'be', 'it', 'from', 'as', 'by', 'on',
    'AI', 'tool', 'tools', 'content', 'free', 'best', 'how', 'guide', 'using',
  ])

  return new Set(
    str
      .toLowerCase()
      .replace(/[→\-→,\.!\?\(\)\[\]{}"'&\/\\@#\$%\^\*\+=\|~`;:<>]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  )
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)))
  const union = new Set([...a, ...b])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// ── Cross-Link Scoring ──────────────────────────────────────────────────────

interface ScoredBlog {
  slug: string
  title: string
  category: string
  targetKeyword: string
  score: number
}

interface ScoredTool {
  slug: string
  badge: string
  title: string
  score: number
}

// Cache to avoid recomputation
let blogKeywordCache: Map<string, Set<string>> | null = null
let toolKeywordCache: Map<string, Set<string>> | null = null

function getBlogKeywords(slug: string): Set<string> {
  if (!blogKeywordCache) {
    blogKeywordCache = new Map()
    for (const post of allBlogPosts) {
      const text = [post.title, post.description, post.targetKeyword, ...post.secondaryKeywords, post.category, ...post.tags].join(' ')
      blogKeywordCache.set(post.slug, extractKeywords(text))
    }
  }
  return blogKeywordCache.get(slug) || new Set()
}

function getToolKeywords(slug: string): Set<string> {
  if (!toolKeywordCache) {
    toolKeywordCache = new Map()
    for (const tool of toolPages) {
      const text = [tool.title, tool.description, tool.h1, tool.badge, ...tool.features.map((f) => f.title + ' ' + f.desc)].join(' ')
      toolKeywordCache.set(tool.slug, extractKeywords(text))
    }
  }
  return toolKeywordCache.get(slug) || new Set()
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Get relevant blog posts for a given tool page slug.
 * Returns top 3-4 blogs sorted by keyword relevance.
 */
export function getRelevantBlogs(toolSlug: string): ScoredBlog[] {
  const toolKW = getToolKeywords(toolSlug)
  const scored: ScoredBlog[] = []

  for (const post of allBlogPosts) {
    const blogKW = getBlogKeywords(post.slug)
    const score = jaccardSimilarity(toolKW, blogKW)
    if (score > 0.03) {
      scored.push({
        slug: post.slug,
        title: post.title,
        category: post.category,
        targetKeyword: post.targetKeyword,
        score,
      })
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 4)
}

/**
 * Get relevant tool pages for a given blog slug.
 * Returns top 3-4 tools sorted by keyword relevance.
 */
export function getRelevantTools(blogSlug: string): ScoredTool[] {
  const blogKW = getBlogKeywords(blogSlug)
  const scored: ScoredTool[] = []

  for (const tool of toolPages) {
    const toolKW = getToolKeywords(tool.slug)
    const score = jaccardSimilarity(blogKW, toolKW)
    if (score > 0.03) {
      scored.push({
        slug: tool.slug,
        badge: tool.badge,
        title: tool.title,
        score,
      })
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 4)
}

/**
 * Get the most recent git commit date for a file or directory.
 * Returns ISO date string, or today's date as fallback.
 */
export function getGitTimestamp(filePath: string): string {
  try {
    const { execSync } = require('child_process')
    const date = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    }).trim()
    return date || new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

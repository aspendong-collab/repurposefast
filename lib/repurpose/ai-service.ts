// ── AI Service Layer ─────────────────────────────────────────────────────────
//
// Handles:
// 1. Audio/Video transcription via OpenAI Whisper API
// 2. Content repurposing via OpenAI GPT-4o
// 3. Translation support

import OpenAI from 'openai'
import { getSystemPrompt, getUserPrompt, getTranslationPrompt } from './prompts'
import type {
  OutputFormat,
  LanguageCode,
  ContentOutput,
  TranscriptSegment,
} from './types'

// ── Client Initialization ────────────────────────────────────────────────────

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    _openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    })
  }
  return _openai
}

// ── Transcription ────────────────────────────────────────────────────────────

export interface TranscribeOptions {
  fileUrl: string // Public URL of the audio/video file
  language?: LanguageCode
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
}

export interface TranscribeResult {
  text: string
  segments?: TranscriptSegment[]
  language: LanguageCode
  duration: number // seconds
}

/**
 * Transcribe audio/video file using OpenAI Whisper.
 * The file must be publicly accessible via URL or uploaded as a File object.
 */
export async function transcribeAudio(options: TranscribeOptions): Promise<TranscribeResult> {
  const openai = getOpenAI()
  const { fileUrl, language, responseFormat = 'verbose_json' } = options

  // Download file from URL
  const fileResponse = await fetch(fileUrl)
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch audio file: ${fileResponse.statusText}`)
  }
  const fileBuffer = await fileResponse.arrayBuffer()
  const file = new File([fileBuffer], 'audio.mp3', {
    type: fileResponse.headers.get('content-type') || 'audio/mpeg',
  })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: language || undefined,
    response_format: responseFormat as 'verbose_json',
    timestamp_granularities: ['segment'],
  })

  // Handle verbose_json response
  if (typeof transcription === 'string') {
    return {
      text: transcription,
      language: language || 'auto',
      duration: 0,
    }
  }

  const verbose = transcription as unknown as {
    text: string
    language: string
    duration: number
    segments?: Array<{
      id: number
      start: number
      end: number
      text: string
    }>
  }

  return {
    text: verbose.text,
    language: verbose.language as LanguageCode,
    duration: verbose.duration,
    segments: verbose.segments?.map((seg) => ({
      id: seg.id,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })),
  }
}

/**
 * Transcribe from a local file path using Node.js fs (for server-side use).
 */
export async function transcribeFromPath(
  filePath: string,
  language?: LanguageCode,
): Promise<TranscribeResult> {
  const openai = getOpenAI()
  const fs = await import('fs')

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    language: language || undefined,
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  })

  const verbose = transcription as unknown as {
    text: string
    language: string
    duration: number
    segments?: Array<{
      id: number
      start: number
      end: number
      text: string
    }>
  }

  return {
    text: verbose.text,
    language: verbose.language as LanguageCode,
    duration: verbose.duration,
    segments: verbose.segments?.map((seg) => ({
      id: seg.id,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })),
  }
}

// ── Content Repurposing ──────────────────────────────────────────────────────

export interface RepurposeOptions {
  transcript: string
  formats: OutputFormat[]
  language?: LanguageCode
  title?: string
  model?: string
}

/**
 * Repurpose a transcript into multiple content formats using GPT-4o.
 * Processes formats in parallel for efficiency.
 */
export async function repurposeContent(
  options: RepurposeOptions,
): Promise<ContentOutput[]> {
  const openai = getOpenAI()
  const {
    transcript,
    formats,
    language = 'zh',
    title,
    model = 'gpt-4o',
  } = options

  // Process each format in parallel
  const results = await Promise.allSettled(
    formats.map(async (format): Promise<ContentOutput> => {
      const systemPrompt = getSystemPrompt(format, language)
      const userPrompt = getUserPrompt(format, transcript, language, title)

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })

      const content = response.choices[0]?.message?.content?.trim() || ''

      // Parse SEO meta if present
      let metadata: ContentOutput['metadata'] | undefined
      if (format === 'seo-article' && content.includes('---SEO_META---')) {
        const parts = content.split('---SEO_META---')
        const bodyContent = parts[0]?.trim() || ''
        const metaStr = parts[1]?.trim() || '{}'
        try {
          const meta = JSON.parse(metaStr)
          metadata = {
            seoTitle: meta.title,
            seoDescription: meta.description,
            keywords: meta.keywords || [],
          }
        } catch {
          // Ignore parse errors for meta
        }
        return {
          format,
          title: metadata?.seoTitle || title || 'Untitled',
          content: bodyContent,
          metadata,
        }
      }

      // Extract title from first line for certain formats
      let outputTitle = title || 'Untitled'
      let outputContent = content

      if (['blog-post', 'wechat-article', 'seo-article'].includes(format)) {
        const firstLine = content.split('\n')[0]
        if (firstLine.startsWith('# ')) {
          outputTitle = firstLine.replace('# ', '')
          outputContent = content.split('\n').slice(1).join('\n').trim()
        }
      }

      // Estimate reading time and word count
      const wordCount = outputContent.length
      const readingTime = Math.ceil(wordCount / 300) // 300 chars/min for Chinese

      return {
        format,
        title: outputTitle,
        content: outputContent,
        metadata: {
          ...metadata,
          wordCount,
          readingTime,
        },
      }
    }),
  )

  // Collect successful results, log failures
  const outputs: ContentOutput[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      outputs.push(result.value)
    } else {
      console.error(`Repurpose failed for format:`, result.reason)
    }
  }

  return outputs
}

// ── Translation ──────────────────────────────────────────────────────────────

export async function translateContent(
  text: string,
  targetLang: LanguageCode,
): Promise<string> {
  const openai = getOpenAI()
  const { system, user } = getTranslationPrompt(text, targetLang)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content?.trim() || text
}

// ── Utility ──────────────────────────────────────────────────────────────────

/**
 * Check if the OpenAI API key is configured.
 */
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Estimate transcription cost (Whisper: $0.006/minute).
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  return Math.ceil(durationSeconds / 60) * 0.006
}

/**
 * Estimate repurposing cost (GPT-4o: ~$2.50/1M input tokens, $10/1M output).
 */
export function estimateRepurposeCost(
  transcriptLength: number,
  formatCount: number,
): number {
  const avgTokensIn = transcriptLength * 0.5 // rough estimate
  const avgTokensOut = 2000 * formatCount
  const costIn = (avgTokensIn / 1_000_000) * 2.5
  const costOut = (avgTokensOut / 1_000_000) * 10
  return costIn + costOut
}

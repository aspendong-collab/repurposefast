// ── POST /api/repurpose/transcribe ──────────────────────────────────────────
//
// YouTube URLs: fast transcript API (free, instant)
// Other URLs: download audio → HuggingFace Whisper
// File upload: direct Whisper API

import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/repurpose/ai-service'
import type { TranscribeResponse, JobStatus } from '@/lib/repurpose/types'
import { randomUUID } from 'crypto'
import { getJob, setJob } from '@/lib/kv'

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)/i.test(url)
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

/**
 * Fallback: raw YouTube timedtext API.
 * Uses a different endpoint + User-Agent to dodge rate limits.
 */
async function fetchTimedText(videoId: string): Promise<{ text: string; language: string }> {
  const langs = ['en', 'en-US', 'zh-Hans', 'ja', 'ko', 'es', 'fr', 'de', 'pt']
  
  for (const lang of langs) {
    try {
      const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv3`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ailomo-bot/1.0)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      
      const xml = await res.text()
      const texts = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
      if (!texts || texts.length === 0) continue
      
      const fullText = texts
        .map((t: string) => t.replace(/<[^>]*>/g, '').trim())
        .filter(Boolean)
        .join(' ')
      
      if (fullText.length < 20) continue
      
      const langCode = lang.includes('zh') ? 'zh' : lang.includes('ja') ? 'ja' : lang.includes('ko') ? 'ko' : 'en'
      console.log(`✅ TimedText fallback OK: ${texts.length} segments, ${fullText.length} chars`)
      return { text: fullText, language: langCode }
    } catch (_fetchError) {
      continue
    }
  }
  throw new Error('No captions found via timedtext API')
}

/**
 * Call HF Space Whisper via Gradio API.
 * Gradio endpoint: POST /gradio_api/call/transcribe_fn → event_id → poll for result
 */
async function callHFWhisper(videoUrl: string, language?: string) {
  const baseUrl = process.env.WHISPER_SERVICE_URL
  if (!baseUrl) throw new Error('WHISPER_SERVICE_URL not configured')

  // Step 1: Submit job
  const submitRes = await fetch(`${baseUrl}/gradio_api/call/transcribe_fn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [videoUrl, language || 'en'] }),
    signal: AbortSignal.timeout(15000),
  })
  if (!submitRes.ok) throw new Error(`Gradio submit failed: ${submitRes.status}`)
  const { event_id } = await submitRes.json()
  if (!event_id) throw new Error('No event_id from Gradio')

  // Step 2: Poll for result (up to 180 seconds for first cold-start request)
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const pollRes = await fetch(`${baseUrl}/gradio_api/call/transcribe_fn/${event_id}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!pollRes.ok) continue

    const text = await pollRes.text()
    // Gradio returns result as event-stream with "event: complete" line + "data: [...]"
    if (text.includes('event: complete')) {
      const dataLine = text.split('\n').find((l) => l.startsWith('data: '))
      if (dataLine) {
        const result = JSON.parse(dataLine.slice(6))
        return {
          text: result[0] || '',
          language: result[1] || language || 'en',
          duration: result[2] || 0,
          segments: [],
        }
      }
    }
  }
  throw new Error('Transcription timed out after 180s')
}

async function getYouTubeTranscript(videoId: string): Promise<{ text: string; language: string }> {
  const { YoutubeTranscript } = await import('youtube-transcript')

  // Exponential backoff: 2s, 6s, 14s
  const delays = [2000, 6000, 14000]
  let lastError: Error | null = null

  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      console.log(`YT transcript attempt ${attempt + 1}/${delays.length} for ${videoId}`)
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en', // prefer English, but auto-fallback
      })

      if (!transcript || transcript.length === 0) {
        throw new Error('No transcript available for this video')
      }

      const fullText = transcript.map((s: { text: string }) => s.text).join(' ')
      const firstText = transcript[0]?.text || ''
      const lang = /[\u4e00-\u9fff]/.test(firstText) ? 'zh'
        : /[\u3040-\u309f\u30a0-\u30ff]/.test(firstText) ? 'ja'
        : /[\uac00-\ud7af]/.test(firstText) ? 'ko'
        : 'en'

      console.log(`✅ YouTube transcript OK: ${transcript.length} segments, ${fullText.length} chars`)
      return { text: fullText, language: lang }
    } catch (e: any) {
      lastError = e
      const msg = e.message || ''

      // Captions disabled → stop retrying immediately, fall through to audio download
      if (msg.includes('disabled') || msg.includes('not available')) {
        console.log(`Captions disabled for ${videoId}, will try audio download`)
        break
      }

      // Retry for rate-limit / transient errors
      if (attempt < delays.length - 1) {
        console.log(`⚠️  Retry in ${delays[attempt] / 1000}s... (${msg.slice(0, 80)})`)
        await new Promise((r) => setTimeout(r, delays[attempt]))
        continue
      }
    }
  }

  // ── All youtube-transcript retries failed → try raw timedtext API ──
  console.log(`⚠️  youtube-transcript exhausted → trying timedtext fallback for ${videoId}`)
  try {
    return await fetchTimedText(videoId)
  } catch (_timedTextError) {
    // all methods exhausted, throw final error below
  }

  throw new Error([
    'YouTube is rate-limiting our server. Please try one of these:',
    '1. Wait 30 seconds and try again',
    '2. Switch to "Paste Text" tab and paste the video transcript manually',
    '3. Download the video audio and upload it via "Upload File" tab',
  ].join('\n'))
}

export async function POST(request: NextRequest) {
  try {
    // Check content type — handle both JSON and FormData
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // ── Direct File Upload ──
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'File required' }, { status: 400 })

      const jobId = randomUUID()
      setJob(jobId, { status: 'transcribing' })

      const language = formData.get('language') as string | null

      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const tmpDir = '/tmp'
        const tmpPath = `${tmpDir}/${jobId}-${file.name}`
        const fs = await import('fs')
        await fs.promises.mkdir(tmpDir, { recursive: true })
        await fs.promises.writeFile(tmpPath, fileBuffer)

        const { transcribeFromPath } = await import('@/lib/repurpose/ai-service')
        const result = await transcribeFromPath(tmpPath, language || undefined)
        await fs.promises.unlink(tmpPath).catch(() => {})

        const resp: TranscribeResponse = {
          jobId, status: 'transcribed',
          transcript: result.text,
          detectedLanguage: result.language,
          durationSeconds: result.duration,
          segments: result.segments,
        }
        setJob(jobId, { status: 'transcribed', result: resp })
        return NextResponse.json(resp)
      } catch (e: any) {
        const msg = e.message || 'Transcription failed'
        setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
        return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 500 })
      }
    }

    // ── JSON Body (URL mode) ──
    const body = await request.json()
    const { source, url, language } = body

    if (!url || !source) {
      return NextResponse.json({ error: 'source and url are required' }, { status: 400 })
    }

    const jobId = randomUUID()
    setJob(jobId, { status: 'transcribing' })

    // 🎯 YouTube: fast transcript API
    if (isYouTubeUrl(url)) {
      const videoId = extractYoutubeId(url)
      console.log(`YouTube detected: ${videoId}`)

      if (!videoId) {
        return NextResponse.json({ jobId, status: 'failed', error: 'Invalid YouTube URL' }, { status: 400 })
      }

      try {
        const { text, language: detectedLang } = await getYouTubeTranscript(videoId)

        const resp: TranscribeResponse = {
          jobId, status: 'transcribed',
          transcript: text,
          detectedLanguage: (language || detectedLang) as any,
          durationSeconds: 0,
          segments: [],
        }
        setJob(jobId, { status: 'transcribed', result: resp })
        return NextResponse.json(resp)
      } catch (transcriptError: any) {
        console.log(`No captions for ${videoId}, downloading audio...`)

        // ── Download audio + Groq Whisper ──
        try {
          const ytdlRes = await fetch(`${request.nextUrl.origin}/api/repurpose/ytdl`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(60000),
          })
          if (!ytdlRes.ok) throw new Error((await ytdlRes.json()).error || 'Download failed')
          const ytdlData = await ytdlRes.json()

          if (!ytdlData.transcript) throw new Error('No transcript from Groq')
          
          const resp: TranscribeResponse = {
            jobId, status: 'transcribed',
            transcript: ytdlData.transcript,
            detectedLanguage: ytdlData.language || language || 'en',
            durationSeconds: ytdlData.duration || 0,
            segments: ytdlData.segments || [],
          }
          setJob(jobId, { status: 'transcribed', result: resp })
          return NextResponse.json(resp)
        } catch (ytdlError: any) {
          const msg = `Download failed: ${ytdlError.message?.slice(0, 100)}. Try Paste Text instead.`
          setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
          return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 500 })
        }
      }
    }

    // 🌐 Other URLs: download audio → Whisper
    try {
      const result = await transcribeAudio({
        fileUrl: url,
        language: language || undefined,
      })

      const resp: TranscribeResponse = {
        jobId, status: 'transcribed',
        transcript: result.text,
        detectedLanguage: result.language,
        durationSeconds: result.duration,
        segments: result.segments,
      }
      setJob(jobId, { status: 'transcribed', result: resp })
      return NextResponse.json(resp)
    } catch (e: any) {
      const msg = e.message || 'Transcription failed'
      setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
      return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 500 })
    }
  } catch (error) {
    console.error('Transcribe API error:', error)
    const msg = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  return NextResponse.json(job.result || { jobId, status: job.status })
}

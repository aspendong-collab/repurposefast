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

async function getYouTubeTranscript(videoId: string): Promise<{ text: string; language: string }> {
  const { YoutubeTranscript } = await import('youtube-transcript')
  const delays = [2000, 6000, 14000]

  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
      if (!transcript || transcript.length === 0) throw new Error('No transcript')
      
      const fullText = transcript.map((s: { text: string }) => s.text).join(' ')
      const firstText = transcript[0]?.text || ''
      const lang = /[\u4e00-\u9fff]/.test(firstText) ? 'zh'
        : /[\u3040-\u309f\u30a0-\u30ff]/.test(firstText) ? 'ja'
        : /[\uac00-\ud7af]/.test(firstText) ? 'ko'
        : 'en'

      return { text: fullText, language: lang }
    } catch (e: any) {
      const msg = e.message || ''
      if (msg.includes('disabled') || msg.includes('not available')) {
        throw new Error('This YouTube video has captions disabled.')
      }
      if (attempt < delays.length - 1) {
        await new Promise((r) => setTimeout(r, delays[attempt]))
        continue
      }
      throw e
    }
  }
  throw new Error('Failed to fetch YouTube transcript')
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
        const msg = transcriptError.message?.includes('disabled')
          ? 'This YouTube video has captions disabled. Click "Paste Text" tab above, then open the YouTube video → click ...→ Show transcript → copy text here.'
          : `Transcription failed: ${transcriptError.message?.slice(0, 80)}. Try Paste Text or upload audio.`
        setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
        return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 400 })
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

// ── POST /api/repurpose/transcribe ──────────────────────────────────────────
// YouTube: Official Data API v3 → youtube-transcript → timedtext (3-layer)
// Other URLs: download audio → HuggingFace Whisper
// File upload: direct Whisper API

import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/repurpose/ai-service'
import type { TranscribeResponse } from '@/lib/repurpose/types'
import { randomUUID } from 'crypto'
import { getJob, setJob } from '@/lib/kv'

const YT_API_KEY = process.env.YOUTUBE_API_KEY || ''

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

// ── Layer 1: YouTube Data API v3 (official, never rate-limited) ────────────
async function tryYouTubeDataAPI(videoId: string): Promise<{ text: string; language: string } | null> {
  if (!YT_API_KEY) return null
  try {
    // Step 1: List available caption tracks
    const listRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YT_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!listRes.ok) return null
    const listData = await listRes.json() as { items?: Array<{ id: string; snippet: { language: string; trackKind: string; name: string } }> }
    if (!listData.items?.length) return null

    // Pick best track: prefer English manual > English auto > first available
    const tracks = listData.items
    const enManual = tracks.find((t) => t.snippet.language === 'en' && t.snippet.trackKind === 'standard')
    const enAuto = tracks.find((t) => t.snippet.language === 'en')
    const first = tracks[0]
    const best = enManual || enAuto || first
    if (!best) return null

    // Step 2: Download caption text (uses ttml format to avoid OAuth)
    const dlRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${best.id}?tfmt=ttml&key=${YT_API_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!dlRes.ok) return null
    const xml = await dlRes.text()

    // Parse TTML: <p begin="..." end="...">text</p>
    const texts = xml.match(/<p[^>]*>([^<]*)<\/p>/g)
    if (!texts || texts.length === 0) return null

    const fullText = texts
      .map((t) => t.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim())
      .filter(Boolean)
      .join(' ')

    if (fullText.length < 20) return null

    const lang = best.snippet.language === 'zh' || best.snippet.language === 'zh-Hans' || best.snippet.language === 'zh-Hant' ? 'zh'
      : best.snippet.language === 'ja' ? 'ja'
      : best.snippet.language === 'ko' ? 'ko'
      : 'en'

    console.log(`✅ YouTube API: ${texts.length} segments, ${fullText.length} chars, ${lang}`)
    return { text: fullText, language: lang }
  } catch {
    return null
  }
}

// ── Layer 2: youtube-transcript + Innertube direct fallback ────────────────
async function tryYoutubeTranscript(videoId: string): Promise<{ text: string; language: string } | null> {
  const { YoutubeTranscript } = await import('youtube-transcript')
  
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000))
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
      if (!transcript || transcript.length === 0) return null

      const fullText = transcript.map((s: { text: string }) => s.text).join(' ')
      const firstText = transcript[0]?.text || ''
      const lang = /[\u4e00-\u9fff]/.test(firstText) ? 'zh'
        : /[\u3040-\u309f\u30a0-\u30ff]/.test(firstText) ? 'ja'
        : /[\uac00-\ud7af]/.test(firstText) ? 'ko'
        : 'en'

      console.log(`✅ youtube-transcript: ${transcript.length} segments, ${fullText.length} chars`)
      return { text: fullText, language: lang }
    } catch (e: any) {
      const msg = e.message || ''
      if (msg.includes('disabled') || msg.includes('not available')) return null
    }
  }

  // Fallback: direct Innertube API with EMBEDDED_PLAYER context (less rate-limited)
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB_EMBEDDED_PLAYER', clientVersion: '2.20231010', hl: 'en', gl: 'US' } },
        videoId,
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json() as any
    const captions = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!captions?.length) return null

    // Pick English track
    const enTrack = captions.find((t: any) => t.languageCode === 'en') || captions[0]
    if (!enTrack?.baseUrl) return null

    const trackRes = await fetch(enTrack.baseUrl, { signal: AbortSignal.timeout(8000) })
    if (!trackRes.ok) return null
    const xml = await trackRes.text()

    const texts = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
    if (!texts || texts.length === 0) return null

    const fullText = texts
      .map((t) => t.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim())
      .filter(Boolean)
      .join(' ')

    if (fullText.length < 20) return null

    const lang = enTrack.languageCode === 'zh' || enTrack.languageCode === 'zh-Hans' ? 'zh'
      : enTrack.languageCode === 'ja' ? 'ja'
      : enTrack.languageCode === 'ko' ? 'ko'
      : 'en'

    console.log(`✅ Innertube embed: ${texts.length} segments, ${fullText.length} chars`)
    return { text: fullText, language: lang }
  } catch {
    return null
  }
}

// ── Layer 3: Raw timedtext API ─────────────────────────────────────────────
async function tryTimedText(videoId: string): Promise<{ text: string; language: string } | null> {
  const langs = ['en', 'zh-Hans', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'auto']
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ]

  for (const lang of langs) {
    for (const ua of agents) {
      try {
        const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv3`
        const res = await fetch(url, {
          headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) continue

        const xml = await res.text()
        if (xml.length < 50) continue

        const texts = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
        if (!texts || texts.length === 0) continue

        const fullText = texts
          .map((t) => t.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim())
          .filter(Boolean)
          .join(' ')

        if (fullText.length < 20) continue

        const langCode = lang.includes('zh') ? 'zh' : lang.includes('ja') ? 'ja' : lang.includes('ko') ? 'ko' : 'en'
        console.log(`✅ TimedText: ${texts.length} segments, ${fullText.length} chars`)
        return { text: fullText, language: langCode }
      } catch { /* try next */ }
    }
  }
  return null
}

// ── Main handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    // ── File Upload ──
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'File required' }, { status: 400 })

      const jobId = randomUUID()
      setJob(jobId, { status: 'transcribing' })

      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const tmpPath = `/tmp/${jobId}-${file.name}`
        const fs = await import('fs')
        await fs.promises.mkdir('/tmp', { recursive: true })
        await fs.promises.writeFile(tmpPath, fileBuffer)

        const { transcribeFromPath } = await import('@/lib/repurpose/ai-service')
        const result = await transcribeFromPath(tmpPath, (formData.get('language') as string) || undefined)
        await fs.promises.unlink(tmpPath).catch(() => {})

        const resp: TranscribeResponse = {
          jobId, status: 'transcribed', transcript: result.text,
          detectedLanguage: result.language, durationSeconds: result.duration, segments: result.segments,
        }
        setJob(jobId, { status: 'transcribed', result: resp })
        return NextResponse.json(resp)
      } catch (e: any) {
        const msg = e.message || 'Transcription failed'
        setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
        return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 500 })
      }
    }

    // ── URL Mode ──
    const body = await request.json()
    const { source, url, language } = body
    if (!url || !source) {
      return NextResponse.json({ error: 'source and url required' }, { status: 400 })
    }

    const jobId = randomUUID()
    setJob(jobId, { status: 'transcribing' })

    if (isYouTubeUrl(url)) {
      const videoId = extractYoutubeId(url)
      if (!videoId) return NextResponse.json({ jobId, status: 'failed', error: 'Invalid YouTube URL' }, { status: 400 })

      // 3-layer fallback: Official API → youtube-transcript → timedtext
      let result = await tryYouTubeDataAPI(videoId)
      if (!result) result = await tryYoutubeTranscript(videoId)
      if (!result) result = await tryTimedText(videoId)

      if (result) {
        const resp: TranscribeResponse = {
          jobId, status: 'transcribed',
          transcript: result.text, detectedLanguage: (language || result.language) as any,
          durationSeconds: 0, segments: [],
        }
        setJob(jobId, { status: 'transcribed', result: resp })
        return NextResponse.json(resp)
      }

      const msg = 'No transcript available. Try Paste Text tab — open the YouTube video → ... → Show transcript → copy text here. Or upload the audio file directly.'
      setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
      return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 400 })
    }

    // ── Other URLs: Whisper ──
    try {
      const result = await transcribeAudio({ fileUrl: url, language: language || undefined })
      const resp: TranscribeResponse = { jobId, status: 'transcribed', transcript: result.text, detectedLanguage: result.language, durationSeconds: result.duration, segments: result.segments }
      setJob(jobId, { status: 'transcribed', result: resp })
      return NextResponse.json(resp)
    } catch (e: any) {
      const msg = e.message || 'Transcription failed'
      setJob(jobId, { status: 'failed', result: { jobId, status: 'failed', error: msg } })
      return NextResponse.json({ jobId, status: 'failed', error: msg }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 })
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

// ── POST /api/repurpose/ytdl ────────────────────────────────────────────────
// Download YouTube audio via ytdl-core → transcribe via Groq Whisper (free)
// Groq is 10x faster than HF Space. Total <10s for short videos.
// Requires: GROQ_API_KEY in env vars

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

    const groqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
    if (!groqKey) return NextResponse.json({ error: 'No API key configured' }, { status: 500 })

    // 1. Download audio via ytdl-core
    const ytdl = await import('@distube/ytdl-core')
    const videoId = ytdl.getVideoID(url)
    const info = await ytdl.getInfo(videoId)

    const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' })
    if (!audioFormat) throw new Error('No audio format found')

    const stream = ytdl.downloadFromInfo(info, { format: audioFormat })
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    // 2. Transcribe via Groq Whisper
    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: 'audio/mp4' }), 'audio.m4a')
    formData.append('model', 'whisper-large-v3')
    formData.append('response_format', 'verbose_json')

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: formData,
      signal: AbortSignal.timeout(15000),
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      throw new Error(`Groq error ${groqRes.status}: ${err.slice(0, 200)}`)
    }

    const result = await groqRes.json()
    return NextResponse.json({
      transcript: result.text,
      language: result.language || 'en',
      duration: result.duration || 0,
      segments: result.segments || [],
    })
  } catch (e: any) {
    console.error('ytdl error:', e.message)
    return NextResponse.json({ error: e.message || 'Download failed' }, { status: 500 })
  }
}

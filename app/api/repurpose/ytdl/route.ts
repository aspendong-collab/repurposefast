// ── POST /api/repurpose/ytdl ────────────────────────────────────────────────
// Downloads YouTube audio via ytdl-core → transcribes via HF Whisper (free)

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

    // 1. Download audio via ytdl-core (pure JS, no binaries)
    const ytdl = await import('@distube/ytdl-core')
    const videoId = ytdl.getVideoID(url)
    const info = await ytdl.getInfo(videoId)

    const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' })
    if (!audioFormat) throw new Error('No audio format found')

    const stream = ytdl.downloadFromInfo(info, { format: audioFormat })
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    // 2. Transcribe via multiple backends
    let result = await tryHFWhisper(buffer)
    if (!result) result = await tryGroq(buffer)
    if (!result) throw new Error('All transcription backends failed')

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Download failed' }, { status: 500 })
  }
}

async function tryHFWhisper(buffer: Buffer) {
  const hfToken = process.env.HF_TOKEN
  if (!hfToken) return null
  
  try {
    const form = new FormData()
    form.append('file', new Blob([buffer], { type: 'audio/mp4' }), 'audio.m4a')
    
    const res = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
      method: 'POST', headers: { Authorization: `Bearer ${hfToken}` }, body: form,
      signal: AbortSignal.timeout(30000),
    })
    const data = await res.json()
    if (data.text) return { transcript: data.text, language: data.language || 'en', duration: 0, segments: [] }
    if (data.error) console.log('HF error:', data.error)
  } catch (e: any) { console.log('HF failed:', e.message) }
  return null
}

async function tryGroq(buffer: Buffer) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return null

  try {
    const form = new FormData()
    form.append('file', new Blob([buffer], { type: 'audio/mp4' }), 'audio.m4a')
    form.append('model', 'whisper-large-v3')
    form.append('response_format', 'verbose_json')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${groqKey}` }, body: form,
      signal: AbortSignal.timeout(15000),
    })
    const data = await res.json()
    if (data.text) return { transcript: data.text, language: data.language || 'en', duration: data.duration || 0, segments: data.segments || [] }
  } catch (e: any) { console.log('Groq failed:', e.message) }
  return null
}

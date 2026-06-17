import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 })
    if (!HF_TOKEN) return NextResponse.json({ error: 'HF_TOKEN not configured' }, { status: 500 })

    // 1. Download audio via ytdl-core (works on Render, blocked on Vercel)
    const ytdl = await import('@distube/ytdl-core')
    const stream = (ytdl as any)(url, { quality: 'lowestaudio', filter: 'audioonly' })

    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      if (chunks.length > 500) break // ~25MB limit
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    console.log(`Downloaded audio: ${(buffer.length / 1024 / 1024).toFixed(1)}MB`)

    // 2. Transcribe via HF Whisper API
    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: 'audio/mp4' }), 'audio.mp4')

    const whisperRes = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        body: formData,
        signal: AbortSignal.timeout(60000),
      }
    )
    if (!whisperRes.ok) {
      const errText = await whisperRes.text()
      throw new Error(`Whisper API ${whisperRes.status}: ${errText.slice(0, 200)}`)
    }

    const result = await whisperRes.json() as { text: string }
    const text = result.text?.trim()

    if (!text || text.length < 10) throw new Error('Whisper returned empty transcript')

    // Detect language
    const lang = /[\u4e00-\u9fff]/.test(text) ? 'zh'
      : /[\u3040-\u309f\u30a0-\u30ff]/.test(text) ? 'ja'
      : /[\uac00-\ud7af]/.test(text) ? 'ko'
      : 'en'

    console.log(`Transcribed: ${text.length} chars, lang=${lang}`)
    return NextResponse.json({ text, language: lang, duration: 0 })

  } catch (e: any) {
    console.error('ytdl error:', e.message)
    return NextResponse.json({ error: e.message || 'Download + transcription failed' }, { status: 500 })
  }
}

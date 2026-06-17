import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 })
    if (!HF_TOKEN) return NextResponse.json({ error: 'HF_TOKEN not configured' }, { status: 500 })

    // 1. Download audio via ytdl-core (works on Render, blocked on Vercel)
    const ytdl = await import('@distube/ytdl-core')
    
    const info = await ytdl.getInfo(url)
    const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' })
    if (!audioFormat) throw new Error('No audio format found for this YouTube video')
    
    console.log(`Downloading audio: ${audioFormat.container} ${audioFormat.audioBitrate}bps`)

    const chunks: Uint8Array[] = []
    await new Promise<void>((resolve, reject) => {
      const stream = ytdl.default(url, { format: audioFormat })
      stream.on('data', (chunk: Uint8Array) => {
        if (chunks.length < 800) chunks.push(chunk)
      })
      stream.on('end', resolve)
      stream.on('error', reject)
    })
    const buffer = Buffer.concat(chunks)
    const sizeMB = buffer.length / 1024 / 1024
    console.log(`Downloaded: ${sizeMB.toFixed(1)}MB`)

    if (sizeMB > 25) throw new Error(`Audio too large (${sizeMB.toFixed(0)}MB > 25MB limit)`)

    // 2. Transcribe via HF Whisper API
    const formData = new FormData()
    const blob = new Blob([buffer], { type: 'audio/mp4' })
    formData.append('audio', blob, 'audio.mp4')

    const whisperRes = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        body: formData,
        signal: AbortSignal.timeout(120000),
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

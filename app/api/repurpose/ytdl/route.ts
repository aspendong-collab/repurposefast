import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN || ''

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 })
    if (!HF_TOKEN) return NextResponse.json({ error: 'HF_TOKEN not configured' }, { status: 500 })

    // 1. Download audio
    const ytdl = await import('ytdl-core')
    const stream = ytdl.default(url, { quality: 'lowestaudio', filter: 'audioonly' })

    const chunks: Buffer[] = []
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => { if (chunks.length < 800) chunks.push(chunk) })
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })
    
    const sizeMB = audioBuffer.length / 1024 / 1024
    if (sizeMB > 25) throw new Error(`Audio too large: ${sizeMB.toFixed(0)}MB`)
    console.log(`Downloaded: ${sizeMB.toFixed(1)}MB`)

    // 2. Transcribe
    const formData = new FormData()
    formData.append('audio', new Blob([audioBuffer], { type: 'audio/mp4' }), 'audio.mp4')
    
    const whisperRes = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo',
      { method: 'POST', headers: { Authorization: `Bearer ${HF_TOKEN}` },
        body: formData, signal: AbortSignal.timeout(120000) }
    )
    if (!whisperRes.ok) throw new Error(`Whisper ${whisperRes.status}`)
    
    const result = await whisperRes.json() as { text: string }
    const text = result.text?.trim()
    if (!text || text.length < 10) throw new Error('Empty transcript')

    const lang = /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'
    return NextResponse.json({ text, language: lang, duration: 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message?.slice(0, 200) || 'Failed' }, { status: 500 })
  }
}

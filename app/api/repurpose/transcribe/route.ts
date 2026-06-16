// ── POST /api/repurpose/transcribe ──────────────────────────────────────────
//
// Accepts: URL (YouTube etc.) or uploaded file
// Returns: transcript text + job ID

import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/repurpose/ai-service'
import type { TranscribeRequest, TranscribeResponse, JobStatus } from '@/lib/repurpose/types'
import { randomUUID } from 'crypto'

// In-memory job store (replace with Supabase in production)
const jobStore = new Map<string, { status: JobStatus; result?: TranscribeResponse }>()

export async function POST(request: NextRequest) {
  try {
    const body: TranscribeRequest = await request.json()
    const { source, url, language, fileKey } = body

    if (!source) {
      return NextResponse.json({ error: 'source is required' }, { status: 400 })
    }

    const jobId = randomUUID()

    if (source === 'url' && url) {
      // ── URL mode: download and transcribe ──
      jobStore.set(jobId, { status: 'transcribing' })

      try {
        const result = await transcribeAudio({
          fileUrl: url,
          language: language || undefined,
        })

        const response: TranscribeResponse = {
          jobId,
          status: 'transcribed',
          transcript: result.text,
          detectedLanguage: result.language,
          durationSeconds: result.duration,
          segments: result.segments,
        }

        jobStore.set(jobId, { status: 'transcribed', result: response })
        return NextResponse.json(response)
      } catch (transcribeError) {
        const message = transcribeError instanceof Error ? transcribeError.message : 'Transcription failed'
        jobStore.set(jobId, { status: 'failed', result: { jobId, status: 'failed', error: message } })
        return NextResponse.json(
          { jobId, status: 'failed', error: message },
          { status: 500 },
        )
      }
    } else if (source === 'file' && fileKey) {
      // ── File mode: file already uploaded to Supabase Storage ──
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/repurpose-uploads/${fileKey}`

      jobStore.set(jobId, { status: 'transcribing' })

      try {
        const result = await transcribeAudio({
          fileUrl,
          language: language || undefined,
        })

        const response: TranscribeResponse = {
          jobId,
          status: 'transcribed',
          transcript: result.text,
          detectedLanguage: result.language,
          durationSeconds: result.duration,
          segments: result.segments,
        }

        jobStore.set(jobId, { status: 'transcribed', result: response })
        return NextResponse.json(response)
      } catch (transcribeError) {
        const message = transcribeError instanceof Error ? transcribeError.message : 'Transcription failed'
        jobStore.set(jobId, { status: 'failed', result: { jobId, status: 'failed', error: message } })
        return NextResponse.json(
          { jobId, status: 'failed', error: message },
          { status: 500 },
        )
      }
    } else if (source === 'file' && !fileKey) {
      // ── Direct file upload via FormData ──
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json(
          { error: 'file is required for file source' },
          { status: 400 },
        )
      }

      jobStore.set(jobId, { status: 'transcribing' })

      try {
        // Save file temporarily and get its URL
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const { transcribeFromPath } = await import('@/lib/repurpose/ai-service')
        
        // Write temp file
        const tmpDir = '/tmp'
        const tmpPath = `${tmpDir}/${jobId}-${file.name}`
        const fs = await import('fs')
        await fs.promises.mkdir(tmpDir, { recursive: true })
        await fs.promises.writeFile(tmpPath, fileBuffer)

        const result = await transcribeFromPath(tmpPath, language || undefined)

        // Cleanup temp file
        await fs.promises.unlink(tmpPath).catch(() => {})

        const response: TranscribeResponse = {
          jobId,
          status: 'transcribed',
          transcript: result.text,
          detectedLanguage: result.language,
          durationSeconds: result.duration,
          segments: result.segments,
        }

        jobStore.set(jobId, { status: 'transcribed', result: response })
        return NextResponse.json(response)
      } catch (transcribeError) {
        const message = transcribeError instanceof Error ? transcribeError.message : 'Transcription failed'
        jobStore.set(jobId, { status: 'failed', result: { jobId, status: 'failed', error: message } })
        return NextResponse.json(
          { jobId, status: 'failed', error: message },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid source configuration' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Transcribe API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/repurpose/transcribe?jobId=xxx
 * Check transcription job status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }

  const job = jobStore.get(jobId)
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(
    job.result || { jobId, status: job.status },
  )
}

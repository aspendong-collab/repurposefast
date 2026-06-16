// ── POST /api/repurpose/repurpose ────────────────────────────────────────────
//
// Accepts transcript + format selection → returns AI-repurposed content

import { NextRequest, NextResponse } from 'next/server'
import { repurposeContent } from '@/lib/repurpose/ai-service'
import type { RepurposeRequest, RepurposeResponse } from '@/lib/repurpose/types'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'

export const maxDuration = 60 // Allow up to 60s for multiple format generation

export async function POST(request: NextRequest) {
  try {
    const body: RepurposeRequest = await request.json()
    const { jobId, transcript, formats, language, context } = body

    // Validation
    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json(
        { error: 'Transcript is too short (min 10 characters)' },
        { status: 400 },
      )
    }

    if (!formats || formats.length === 0) {
      return NextResponse.json(
        { error: 'At least one output format is required' },
        { status: 400 },
      )
    }

    // Validate formats
    const invalidFormats = formats.filter((f) => !OUTPUT_FORMATS[f])
    if (invalidFormats.length > 0) {
      return NextResponse.json(
        { error: `Invalid formats: ${invalidFormats.join(', ')}` },
        { status: 400 },
      )
    }

    // Repurpose content
    const outputs = await repurposeContent({
      transcript,
      formats,
      language: language || 'zh',
      title: context?.title,
    })

    const response: RepurposeResponse = {
      jobId: jobId || 'unknown',
      status: 'completed',
      outputs,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Repurpose API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { jobId: 'unknown', status: 'failed', error: message },
      { status: 500 },
    )
  }
}

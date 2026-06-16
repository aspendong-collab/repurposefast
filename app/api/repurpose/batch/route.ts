// ── POST /api/repurpose/batch ───────────────────────────────────────────────
// Batch transcribe multiple URLs in parallel.

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const jobStore = new Map<string, { status: string; results: any[] }>()

async function transcribeSingle(url: string): Promise<any> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/repurpose/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'url', url }),
  })
  return res.json()
}

export async function POST(request: NextRequest) {
  const { urls } = await request.json().catch(() => ({ urls: [] }))

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls array is required (max 50)' }, { status: 400 })
  }

  if (urls.length > 50) {
    return NextResponse.json({ error: 'Maximum 50 URLs per batch' }, { status: 400 })
  }

  const batchId = randomUUID()
  jobStore.set(batchId, { status: 'processing', results: [] })

  // Process in parallel with concurrency limit of 5
  const CONCURRENCY = 5
  const results: any[] = []

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const chunk = urls.slice(i, i + CONCURRENCY)
    const chunkResults = await Promise.allSettled(
      chunk.map(async (url, idx) => {
        try {
          const result = await transcribeSingle(url)
          return { index: i + idx, url, status: 'success', ...result }
        } catch (e: any) {
          return { index: i + idx, url, status: 'failed', error: e.message }
        }
      })
    )
    results.push(...chunkResults.map((r) => (r.status === 'fulfilled' ? r.value : r.reason)))
    jobStore.set(batchId, { status: 'processing', results: [...results] })
  }

  const succeeded = results.filter((r) => r.status === 'success').length
  jobStore.set(batchId, { status: 'completed', results })

  return NextResponse.json({
    batchId,
    total: urls.length,
    succeeded,
    failed: urls.length - succeeded,
    results,
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })

  const job = jobStore.get(batchId)
  if (!job) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })

  return NextResponse.json({ batchId, ...job })
}

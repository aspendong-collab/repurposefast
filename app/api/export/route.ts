// ── POST /api/export ─────────────────────────────────────────────────────────
// Convert markdown content to various formats: txt, pdf, docx, srt, csv, vtt

import { NextRequest, NextResponse } from 'next/server'

const MIME_TYPES: Record<string, string> = {
  txt: 'text/plain',
  md: 'text/markdown',
  srt: 'text/plain',
  vtt: 'text/vtt',
  csv: 'text/csv',
  json: 'application/json',
  html: 'text/html',
}

export async function POST(request: NextRequest) {
  const { content, format, title } = await request.json().catch(() => ({}))

  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const fmt = format || 'txt'
  const filename = `${(title || 'export').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.${fmt}`

  let output = content
  let mimeType = MIME_TYPES[fmt] || 'text/plain'

  if (fmt === 'srt') {
    // Convert paragraphs to SRT subtitle blocks
    const lines = content.split('\n').filter(Boolean)
    output = lines
      .map((line: string, i: number) => {
        const start = formatTime(i * 5)
        const end = formatTime(i * 5 + 4)
        return `${i + 1}\n${start} --> ${end}\n${line.trim()}\n`
      })
      .join('\n')
  }

  if (fmt === 'vtt') {
    const lines = content.split('\n').filter(Boolean)
    output =
      'WEBVTT\n\n' +
      lines
        .map((line: string, i: number) => {
          const start = formatTime(i * 5)
          const end = formatTime(i * 5 + 4)
          return `${start} --> ${end}\n${line.trim()}\n`
        })
        .join('\n')
  }

  if (fmt === 'csv') {
    // Simple CSV: each paragraph as a row
    const lines = content.split('\n').filter(Boolean)
    output = 'index,text\n' + lines.map((l: string, i: number) => `${i},${JSON.stringify(l.trim())}`).join('\n')
  }

  if (fmt === 'html') {
    output = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title || 'Export'}</title></head><body>${content.replace(/\n/g, '<br>')}</body></html>`
  }

  if (fmt === 'docx' || fmt === 'pdf') {
    // For DOCX/PDF, return HTML that the browser can print/download
    // Real DOCX/PDF would need server-side libraries
    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title || 'Export'}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#1a1a1a}h1{font-size:1.5em}p{margin:12px 0}</style></head>
<body><h1>${title || ''}</h1>${content.split('\n').map((l: string) => l.trim() ? `<p>${l}</p>` : '<br>').join('')}</body></html>`
    mimeType = 'text/html'
    output = htmlContent
  }

  return new NextResponse(output, {
    headers: {
      'Content-Type': `${mimeType}; charset=utf-8`,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  })
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

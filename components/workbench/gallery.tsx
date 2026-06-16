'use client'

import { useState } from 'react'
import { FormatCard } from './format-card'
import type { OutputFormat } from '@/lib/repurpose/types'
import type { FormatResult } from '@/hooks/use-workbench'

interface GalleryProps {
  formats: FormatResult[]
  onCopy: (format: OutputFormat, content: string) => void
  onDownload: (format: OutputFormat, content: string, title: string) => void
  onRefine: (format: OutputFormat) => void
}

export function Gallery({ formats, onCopy, onDownload, onRefine }: GalleryProps) {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})

  const handleCopy = async (format: OutputFormat, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopiedMap((m) => ({ ...m, [format]: true }))
    setTimeout(() => setCopiedMap((m) => ({ ...m, [format]: false })), 2000)
    onCopy(format, content)
  }

  const handleDownload = (format: OutputFormat, content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.slice(0, 30)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onDownload(format, content, title)
  }

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {formats.map((f) => (
          <FormatCard
            key={f.format}
            format={f.format}
            status={f.status}
            content={f.content}
            title={f.title}
            metadata={f.metadata}
            error={f.error}
            isCopied={!!copiedMap[f.format]}
            onCopy={() => handleCopy(f.format, f.content)}
            onDownload={() => handleDownload(f.format, f.content, f.title)}
            onRefine={() => onRefine(f.format)}
          />
        ))}
      </div>

      {/* Completion banner */}
      {formats.every((f) => f.status === 'completed') && (
        <div className="text-center mt-8 animate-in fade-in duration-1000">
          <p className="text-sm text-muted-foreground">
            ✅ 全部生成完成 · 点击「对话精调」可继续修改任何内容
          </p>
        </div>
      )}
    </div>
  )
}

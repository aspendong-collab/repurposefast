'use client'

import { useState } from 'react'
import { Copy, Download, MessageSquare, Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'
import type { OutputFormat, ContentOutput } from '@/lib/repurpose/types'

interface FormatCardProps {
  format: OutputFormat
  status: 'pending' | 'streaming' | 'completed' | 'error'
  content: string
  title: string
  metadata?: ContentOutput['metadata']
  error?: string
  onCopy: () => void
  onDownload: () => void
  onRefine: () => void
  isCopied: boolean
}

export function FormatCard({
  format,
  status,
  content,
  title,
  metadata,
  error,
  onCopy,
  onDownload,
  onRefine,
  isCopied,
}: FormatCardProps) {
  const meta = OUTPUT_FORMATS[format]
  const isStreaming = status === 'streaming'
  const isPending = status === 'pending'
  const isError = status === 'error'
  const isDone = status === 'completed'

  // Color accent per format
  const accentColors: Record<string, string> = {
    'wechat-article': 'from-green-500/20 to-green-500/5 border-green-500/20',
    'xiaohongshu': 'from-rose-500/20 to-rose-500/5 border-rose-500/20',
    'twitter-thread': 'from-sky-500/20 to-sky-500/5 border-sky-500/20',
    'linkedin-post': 'from-blue-600/20 to-blue-600/5 border-blue-600/20',
    'blog-post': 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    'seo-article': 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    'newsletter': 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
    'subtitle-srt': 'from-gray-500/20 to-gray-500/5 border-gray-500/20',
    'summary': 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
    'mindmap': 'from-teal-500/20 to-teal-500/5 border-teal-500/20',
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-gradient-to-b p-5 transition-all duration-300',
        isDone
          ? `${accentColors[format] || 'border-border'} hover:shadow-lg hover:-translate-y-0.5`
          : isPending
            ? 'border-dashed border-muted-foreground/20 bg-muted/10'
            : isError
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-primary/30 bg-primary/[0.02]',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            isDone ? 'bg-background' : 'bg-muted/30',
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : isError ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : isStreaming ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <span className="text-lg">{meta.icon === 'Heart' ? '❤️' : meta.icon === 'Twitter' ? '🐦' : meta.icon === 'MessageSquare' ? '📝' : meta.icon === 'Linkedin' ? '💼' : meta.icon === 'Mail' ? '📧' : meta.icon === 'Search' ? '🔍' : meta.icon === 'Sparkles' ? '✨' : meta.icon === 'GitFork' ? '🧠' : meta.icon === 'FileText' ? '📄' : meta.icon === 'ClosedCaptions' ? '📺' : '📄'}</span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {metadata && isDone && (
            <p className="text-xs text-muted-foreground">
              {metadata.wordCount} 字 · 约 {metadata.readingTime} 分钟
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {isPending ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">{error || '生成失败'}</p>
      ) : (
        <div className="relative">
          <div
            className={cn(
              'text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-hidden',
              !isDone && 'opacity-70',
            )}
          >
            {content || '...'}
            {isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
          </div>
          {isDone && content.length > 300 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>
      )}

      {/* Actions */}
      {isDone && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted active:scale-95"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {isCopied ? '已复制' : '复制'}
          </button>
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            下载
          </button>
          <button
            onClick={onRefine}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 active:scale-95"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            对话精调
          </button>
        </div>
      )}
    </div>
  )
}

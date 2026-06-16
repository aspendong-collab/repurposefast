'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, Link, Sparkles, Copy, Download, FileText, Loader2, Check, X, ArrowRight, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'
import type { OutputFormat, ContentOutput, TranscribeResponse, RepurposeResponse } from '@/lib/repurpose/types'

// ── Constants ────────────────────────────────────────────────────────────────

const POPULAR_FORMATS: OutputFormat[] = [
  'wechat-article',
  'xiaohongshu',
  'twitter-thread',
  'linkedin-post',
  'blog-post',
  'summary',
]

export default function RepurposePage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState<'url' | 'file'>('url')
  const [url, setUrl] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<Set<OutputFormat>>(
    new Set(['wechat-article', 'xiaohongshu']),
  )
  const [language, setLanguage] = useState('zh')

  // Job state
  const [transcript, setTranscript] = useState('')
  const [outputs, setOutputs] = useState<ContentOutput[]>([])
  const [activeTab, setActiveTab] = useState<OutputFormat>('wechat-article')

  // UI state
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isRepurposing, setIsRepurposing] = useState(false)
  const [error, setError] = useState('')
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Toggle Format ──────────────────────────────────────────────────────────

  const toggleFormat = useCallback((format: OutputFormat) => {
    setSelectedFormats((prev) => {
      const next = new Set(prev)
      if (next.has(format)) {
        next.delete(format)
      } else {
        next.add(format)
      }
      return next
    })
  }, [])

  // ── Handle Transcription ───────────────────────────────────────────────────

  const handleTranscribe = useCallback(async () => {
    if (inputMode === 'url' && !url.trim()) {
      setError('请输入视频链接')
      return
    }

    setError('')
    setIsTranscribing(true)
    setTranscript('')
    setOutputs([])

    try {
      const response = await fetch('/api/repurpose/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: inputMode === 'url' ? 'url' : 'file',
          url: url.trim() || undefined,
          language: language || undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || '转录失败')
      }

      const data: TranscribeResponse = await response.json()

      if (data.transcript) {
        setTranscript(data.transcript)
        // Auto-repurpose after transcription
        await handleRepurpose(data.transcript, data.jobId)
      } else {
        throw new Error('未获取到转录文本')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '转录过程出错')
    } finally {
      setIsTranscribing(false)
    }
  }, [inputMode, url, language])

  // ── Handle File Upload ─────────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setIsTranscribing(true)
    setTranscript('')
    setOutputs([])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/repurpose/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || '转录失败')
      }

      const data: TranscribeResponse = await response.json()

      if (data.transcript) {
        setTranscript(data.transcript)
        await handleRepurpose(data.transcript, data.jobId)
      } else {
        throw new Error('未获取到转录文本')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理出错')
    } finally {
      setIsTranscribing(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  // ── Handle Repurpose ───────────────────────────────────────────────────────

  const handleRepurpose = useCallback(async (transcriptText: string, jobId?: string) => {
    if (selectedFormats.size === 0) {
      setError('请至少选择一种输出格式')
      return
    }

    setIsRepurposing(true)
    setError('')

    try {
      const response = await fetch('/api/repurpose/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: jobId || crypto.randomUUID(),
          transcript: transcriptText,
          formats: Array.from(selectedFormats),
          language: language || undefined,
          context: {
            title: url || undefined,
          },
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || '内容生成失败')
      }

      const data: RepurposeResponse = await response.json()
      setOutputs(data.outputs)

      // Set active tab to first output
      if (data.outputs.length > 0) {
        setActiveTab(data.outputs[0].format)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '内容生成出错')
    } finally {
      setIsRepurposing(false)
    }
  }, [selectedFormats, language, url])

  // ── Copy to Clipboard ──────────────────────────────────────────────────────

  const handleCopy = useCallback(async (format: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
    }
  }, [])

  // ── Download as file ───────────────────────────────────────────────────────

  const handleDownload = useCallback((format: string, content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.slice(0, 30)}-${format}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // ── Get active output ──────────────────────────────────────────────────────

  const activeOutput = outputs.find((o) => o.format === activeTab)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* —— Hero Section —— */}
      <section className="relative overflow-hidden pb-8 pt-12 lg:pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Content Repurposing
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            一条视频，
            <span className="gradient-premium-text">变身全平台内容矩阵</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            粘贴视频链接或上传文件，AI 自动转写并一键生成公众号文章、小红书笔记、
            Twitter 线程、LinkedIn 帖子等最多 10 种内容格式。让你的内容创作效率提升 10 倍。
          </p>
        </div>
      </section>

      {/* —— Input Section —— */}
      <section className="mx-auto max-w-4xl px-4 pb-8">
        <div className="rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
          {/* Input mode tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setInputMode('url')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                inputMode === 'url'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              <Link className="h-4 w-4" />
              粘贴链接
            </button>
            <button
              onClick={() => setInputMode('file')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                inputMode === 'file'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              <Upload className="h-4 w-4" />
              上传文件
            </button>

            {/* Language selector */}
            <div className="ml-auto">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                disabled={isTranscribing || isRepurposing}
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="auto">自动检测</option>
              </select>
            </div>
          </div>

          {/* URL Input */}
          {inputMode === 'url' && (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Link className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="粘贴 YouTube、B站、播客等视频链接..."
                  className="input-glow-premium w-full rounded-xl border bg-background py-3.5 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none"
                  disabled={isTranscribing || isRepurposing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTranscribe()
                  }}
                />
              </div>
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing || isRepurposing || !url.trim()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all',
                  isTranscribing || isRepurposing || !url.trim()
                    ? 'cursor-not-allowed bg-muted text-muted-foreground'
                    : 'btn-shimmer bg-primary text-primary-foreground hover:opacity-90',
                )}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    转写中...
                  </>
                ) : (
                  <>
                    开始转写
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* File Upload */}
          {inputMode === 'file' && (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors hover:border-primary/50 hover:bg-muted/50',
                  isTranscribing && 'pointer-events-none opacity-50',
                )}
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">点击或拖拽上传音视频文件</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    支持 MP3, WAV, MP4, MOV, MKV 等格式，最大 500MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isTranscribing || isRepurposing}
              />
              {isTranscribing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在转写文件...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            <X className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </section>

      {/* —— Format Selection —— */}
      {transcript && (
        <section className="mx-auto max-w-4xl px-4 pb-8">
          <h2 className="mb-4 text-lg font-semibold">
            选择输出格式
            {isRepurposing && (
              <span className="ml-2 inline-flex items-center gap-1 text-sm font-normal text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                正在生成内容...
              </span>
            )}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR_FORMATS.map((format) => {
              const meta = OUTPUT_FORMATS[format]
              const isSelected = selectedFormats.has(format)
              return (
                <button
                  key={format}
                  onClick={() => toggleFormat(format)}
                  disabled={isRepurposing}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50',
                    isRepurposing && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <meta.icon className="h-6 w-6" />
                  <span className="text-xs font-medium leading-tight">{meta.label}</span>
                </button>
              )
            })}
          </div>
          {selectedFormats.size > 0 && !isRepurposing && outputs.length === 0 && (
            <button
              onClick={() => handleRepurpose(transcript)}
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
                'btn-shimmer bg-primary text-primary-foreground hover:opacity-90',
              )}
            >
              <Sparkles className="h-4 w-4" />
              生成 {selectedFormats.size} 种格式内容
            </button>
          )}
        </section>
      )}

      {/* —— Results Section —— */}
      {outputs.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-20">
          {/* Format tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {outputs.map((output) => {
              const meta = OUTPUT_FORMATS[output.format]
              return (
                <button
                  key={output.format}
                  onClick={() => setActiveTab(output.format)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === output.format
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  <meta.icon className="h-4 w-4" />
                  {meta.label}
                </button>
              )
            })}
          </div>

          {/* Active content */}
          {activeOutput && (
            <div className="rounded-2xl border bg-card shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4 sm:p-6">
                <div>
                  <h3 className="text-lg font-semibold">{activeOutput.title}</h3>
                  {activeOutput.metadata && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeOutput.metadata.wordCount != null && (
                        <span>{activeOutput.metadata.wordCount} 字符</span>
                      )}
                      {activeOutput.metadata.readingTime != null && (
                        <span> · 约 {activeOutput.metadata.readingTime} 分钟阅读</span>
                      )}
                      {activeOutput.metadata.suggestedHashtags && (
                        <span className="ml-2">
                          {activeOutput.metadata.suggestedHashtags.map((tag) => (
                            <span key={tag} className="mr-1 text-primary">
                              #{tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(activeOutput.format, activeOutput.content)}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    {copiedFormat === activeOutput.format ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        复制
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(activeOutput.format, activeOutput.content, activeOutput.title)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                    下载
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed">
                  {activeOutput.content}
                </div>
              </div>
            </div>
          )}

          {/* All outputs summary */}
          <div className="mt-8 rounded-xl border bg-muted/30 p-4 sm:p-6">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              已生成内容列表
            </h3>
            <div className="space-y-2">
              {outputs.map((output) => {
                const meta = OUTPUT_FORMATS[output.format]
                return (
                  <div
                    key={output.format}
                    className="flex items-center justify-between rounded-lg bg-card p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <meta.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{output.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {meta.label} · {output.metadata?.wordCount || 0} 字符
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(output.format, output.content)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(output.format, output.content, output.title)
                        }
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* —— Features Section —— */}
      {!transcript && (
        <section className="mx-auto max-w-4xl px-4 pb-20">
          <h2 className="mb-8 text-center text-2xl font-bold">为什么选择我们？</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'AI 智能改写',
                desc: '不只是转文字，而是根据每个平台的风格特点智能改写内容',
              },
              {
                icon: FileText,
                title: '10 种输出格式',
                desc: '公众号、小红书、Twitter、LinkedIn、博客、SEO 文章等全覆盖',
              },
              {
                icon: Languages,
                title: '多语言支持',
                desc: '支持中文、英文、日文、韩文等 18+ 语言的转写和输出',
              },
              {
                icon: Copy,
                title: '一键复制发布',
                desc: '生成内容直接复制到剪贴板，或下载 Markdown 文件',
              },
              {
                icon: Upload,
                title: '多种输入方式',
                desc: '粘贴链接或上传本地文件，支持 MP3/MP4/MKV 等主流格式',
              },
              {
                icon: ArrowRight,
                title: '10x 效率提升',
                desc: '一条视频 5 分钟内生成 5+ 平台内容，内容矩阵一键搞定',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-all hover:shadow-md"
              >
                <feature.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* —— CTA Section —— */}
      {!transcript && (
        <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:p-12">
            <h2 className="text-2xl font-bold">准备好提升你的内容效率了吗？</h2>
            <p className="mt-3 text-muted-foreground">
              粘贴你的第一条视频链接，体验 10 倍内容创作效率
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              立即开始
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

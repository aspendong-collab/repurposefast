'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { OutputFormat, ContentOutput, TranscriptSegment } from '@/lib/repurpose/types'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'

type Phase = 'idle' | 'transcribing' | 'generating' | 'completed' | 'error'

interface ProgressInfo {
  phase: string
  message: string
  detail?: string
  percent: number       // 0-100
  elapsed: number       // seconds
}

interface FormatResult {
  format: OutputFormat
  status: 'pending' | 'streaming' | 'completed' | 'error'
  title: string
  content: string
  metadata?: ContentOutput['metadata']
  error?: string
}

interface RefineMessage {
  role: 'user' | 'assistant'
  content: string
  diff?: { before: string; after: string }
}

interface AppState {
  inputMode: 'url' | 'file' | 'text'
  inputValue: string
  detectedLanguage: string | null
  detectedPlatform: string | null
  phase: Phase
  progress: ProgressInfo | null
  jobId: string | null
  transcript: string
  segments: TranscriptSegment[]
  formats: FormatResult[]
  activeCard: OutputFormat | null
  refineTarget: OutputFormat | null
  refineMessages: RefineMessage[]
  error: string | null
}

const SMART_SUGGESTIONS: Record<string, OutputFormat[]> = {
  youtube: ['wechat-article', 'twitter-thread', 'xiaohongshu', 'blog-post'],
  bilibili: ['wechat-article', 'xiaohongshu', 'blog-post'],
  podcast: ['blog-post', 'newsletter', 'summary'],
  meeting: ['summary', 'blog-post'],
  tiktok: ['xiaohongshu', 'twitter-thread'],
  default: ['wechat-article', 'xiaohongshu', 'twitter-thread'],
}

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('bilibili.com')) return 'bilibili'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('open.spotify.com') || url.includes('apple.com/podcast')) return 'podcast'
  return 'default'
}

// Estimated transcription time: ~3s per minute of audio
function estimateTranscribeTime(fileSizeHint?: number): number {
  return 15 // Conservative: assume ~5min video
}

export function useWorkbench() {
  const [state, setState] = useState<AppState>({
    inputMode: 'url', inputValue: '', detectedLanguage: null, detectedPlatform: null,
    phase: 'idle', progress: null, jobId: null,
    transcript: '', segments: [], formats: [], activeCard: null,
    refineTarget: null, refineMessages: [], error: null,
  })

  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // ── Progress timer ──────────────────────────────────────────────────────

  const startProgressTimer = useCallback((phase: string, estimatedSeconds: number, initialMessage: string) => {
    const startTime = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const percent = Math.min(Math.round((elapsed / estimatedSeconds) * 100), 95)
      setState((s) => ({
        ...s,
        progress: {
          phase,
          message: initialMessage,
          detail: `已用时 ${Math.floor(elapsed)}秒${estimatedSeconds > 0 ? ` · 预计 ${estimatedSeconds}秒` : ''}`,
          percent,
          elapsed,
        },
      }))
    }, 500)
  }, [])

  const stopProgressTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  // ── Setters ─────────────────────────────────────────────────────────────

  const setInputValue = useCallback((v: string) => setState((s) => ({ ...s, inputValue: v, error: null })), [])
  const setInputMode = useCallback((m: 'url' | 'file' | 'text') => setState((s) => ({ ...s, inputMode: m })), [])
  const setActiveCard = useCallback((f: OutputFormat | null) => setState((s) => ({ ...s, activeCard: f })), [])

  const openRefine = useCallback((format: OutputFormat) => {
    setState((s) => ({
      ...s, refineTarget: format,
      refineMessages: [{ role: 'assistant', content: `我已生成${OUTPUT_FORMATS[format].label}。你可以说"更口语化"、"缩短到500字"、"加上emoji"等来调整。` }],
    }))
  }, [])

  const closeRefine = useCallback(() => setState((s) => ({ ...s, refineTarget: null, refineMessages: [] })), [])

  // ── Core: Start Processing ──────────────────────────────────────────────

  const startProcessing = useCallback(async () => {
    const { inputValue, inputMode } = state
    if (!inputValue) return

    stopProgressTimer()
    setState((s) => ({ ...s, error: null, phase: inputMode === 'text' ? 'generating' : 'transcribing' }))

    const platform = inputMode === 'url' ? detectPlatform(inputValue) : 'default'
    const suggestedFormats = SMART_SUGGESTIONS[platform] || SMART_SUGGESTIONS.default
    const jobId = crypto.randomUUID()

    const initialFormats: FormatResult[] = suggestedFormats.map((f) => ({ format: f, status: 'pending' as const, title: OUTPUT_FORMATS[f].label, content: '' }))

    setState((s) => ({ ...s, detectedPlatform: platform, phase: inputMode === 'text' ? 'generating' : 'transcribing', formats: initialFormats, jobId }))

    // ── Shared streaming function ──
    const doStream = async (transcriptText: string, formats: OutputFormat[], lang: string, plat: string) => {
      abortRef.current = new AbortController()
      const completedSet = new Set<string>()
      const total = formats.length

      const streamRes = await fetch('/api/repurpose/stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, formats, language: lang, platform: plat }),
        signal: abortRef.current.signal,
      })

      if (!streamRes.ok) {
        const errData = await streamRes.json().catch(() => ({}))
        throw new Error(errData.error || `生成失败 (${streamRes.status})`)
      }

      const reader = streamRes.body?.getReader()
      if (!reader) throw new Error('无法读取生成流')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'chunk') {
              setState((s) => ({
                ...s,
                progress: { phase: 'generating', message: `生成 ${OUTPUT_FORMATS[event.format]?.label || event.format}...`, detail: `${completedSet.size}/${total} 种格式完成`, percent: Math.round((completedSet.size / total) * 100), elapsed: 0 },
                formats: s.formats.map((f) => (f.format === event.format ? { ...f, status: 'streaming' as const, content: (f.content || '') + event.text } : f)),
              }))
            }
            if (event.type === 'complete') {
              completedSet.add(event.format)
              setState((s) => ({
                ...s, progress: { phase: 'generating', message: `${OUTPUT_FORMATS[event.format]?.label || event.format} 完成`, detail: `${completedSet.size}/${total} 种格式`, percent: Math.round((completedSet.size / total) * 100), elapsed: 0 },
                formats: s.formats.map((f) => (f.format === event.format ? { ...f, status: 'completed' as const, title: event.title || f.title, metadata: event.metadata } : f)),
              }))
            }
            if (event.type === 'done') {
              stopProgressTimer()
              setState((s) => ({ ...s, phase: 'completed', progress: { phase: 'completed', message: `✅ 完成！${completedSet.size} 种格式`, percent: 100, elapsed: 0 } }))
            }
            if (event.type === 'error') {
              setState((s) => ({ ...s, formats: s.formats.map((f) => (f.format === event.format ? { ...f, status: 'error' as const, error: event.message } : f)) }))
            }
          } catch { /* skip */ }
        }
      }
      setState((s) => ({ ...s, phase: 'completed', progress: { phase: 'completed', message: `✅ 完成！${completedSet.size} 种格式`, percent: 100, elapsed: 0 } }))
    }

    // ── Text mode: skip transcription ──
    if (inputMode === 'text') {
      setState((s) => ({
        ...s, phase: 'generating', transcript: inputValue,
        progress: { phase: 'generating', message: '正在生成多平台内容...', detail: `${inputValue.length} 字符`, percent: 0, elapsed: 0 },
      }))
      try {
        await doStream(inputValue, suggestedFormats, 'zh', platform)
      } catch (error: any) {
        stopProgressTimer()
        setState((s) => ({ ...s, phase: 'error', error: error?.message || '生成失败', progress: null }))
      }
      return
    }

    // Start progress timer (estimated 20s for transcription)
    startProgressTimer('transcribing', 20, '正在下载并转写音频...')

    try {
      const transcribeRes = await fetch('/api/repurpose/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: inputMode, url: inputValue || undefined, language: 'auto' }),
        signal: AbortSignal.timeout(120000),
      })

      if (!transcribeRes.ok) {
        const errData = await transcribeRes.json().catch(() => ({}))
        throw new Error(errData.error || `转录请求失败 (${transcribeRes.status})`)
      }

      const transcribeData = await transcribeRes.json()
      if (!transcribeData.transcript) throw new Error('未获取到转录文本，请检查音频是否有效')

      stopProgressTimer()
      setState((s) => ({
        ...s, phase: 'generating',
        transcript: transcribeData.transcript, segments: transcribeData.segments || [],
        detectedLanguage: transcribeData.detectedLanguage || 'zh',
        progress: { phase: 'generating', message: '转写完成！正在生成多平台内容...', detail: `识别语言: ${transcribeData.detectedLanguage || '自动'} · 共 ${transcribeData.transcript.length} 字符`, percent: 100, elapsed: 0 },
      }))

      // ── Stream repurpose ──
      await doStream(transcribeData.transcript, suggestedFormats, transcribeData.detectedLanguage || 'zh', platform)
    } catch (error: any) {
      stopProgressTimer()
      if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
        setState((s) => ({ ...s, phase: 'error', error: '处理超时，请检查网络或尝试更短的音频', progress: null }))
      } else {
        const msg = error?.message || '处理失败'
        setState((s) => ({ ...s, phase: 'error', error: msg, progress: null }))
      }
    }
  }, [state.inputValue, state.inputMode, startProgressTimer, stopProgressTimer])

  const cancelProcessing = useCallback(() => {
    stopProgressTimer()
    abortRef.current?.abort()
    setState((s) => ({ ...s, phase: 'idle', progress: null, jobId: null, error: null }))
  }, [stopProgressTimer])

  // ── Refine Chat ─────────────────────────────────────────────────────────

  const sendRefineMessage = useCallback(async (message: string) => {
    const { refineTarget, formats } = state
    if (!refineTarget) return

    const targetFormat = formats.find((f) => f.format === refineTarget)
    if (!targetFormat) return

    setState((s) => ({ ...s, refineMessages: [...s.refineMessages, { role: 'user' as const, content: message }] }))

    try {
      const res = await fetch('/api/repurpose/refine', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: refineTarget, originalContent: targetFormat.content, instruction: message }),
      })
      if (!res.ok) throw new Error('精调失败')
      const data = await res.json()

      setState((s) => ({ ...s, refineMessages: [...s.refineMessages, { role: 'assistant' as const, content: data.content, diff: data.diff }], formats: s.formats.map((f) => (f.format === refineTarget ? { ...f, content: data.refined || f.content, title: data.title || f.title } : f)) }))
    } catch (error: any) {
      setState((s) => ({ ...s, refineMessages: [...s.refineMessages, { role: 'assistant' as const, content: `精调出错：${error.message}` }] }))
    }
  }, [state.refineTarget, state.formats])

  const reset = useCallback(() => {
    stopProgressTimer()
    setState({ inputMode: 'url', inputValue: '', detectedLanguage: null, detectedPlatform: null, phase: 'idle', progress: null, jobId: null, transcript: '', segments: [], formats: [], activeCard: null, refineTarget: null, refineMessages: [], error: null })
  }, [stopProgressTimer])

  return { state, setInputValue, setInputMode, startProcessing, cancelProcessing, setActiveCard, openRefine, closeRefine, sendRefineMessage, reset }
}

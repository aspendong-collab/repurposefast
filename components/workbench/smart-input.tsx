'use client'

import { useState } from 'react'
import { Link, Upload, ArrowRight, Sparkles, FileVideo, Mic, FileText, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartInputProps {
  mode: 'url' | 'file' | 'text'
  value: string
  onModeChange: (m: 'url' | 'file' | 'text') => void
  onValueChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function SmartInput({ mode, value, onModeChange, onValueChange, onSubmit, disabled }: SmartInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode toggle */}
      <div className="flex justify-center gap-1 mb-4">
        {[
          { id: 'url' as const, icon: Link, label: '粘贴链接' },
          { id: 'file' as const, icon: Upload, label: '上传文件' },
          { id: 'text' as const, icon: FileText, label: '粘贴文本' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              mode === id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Main input area */}
      <div
        className={cn(
          'relative rounded-2xl border-2 transition-all duration-300',
          isFocused
            ? 'border-primary shadow-[0_0_30px_rgba(124,58,237,0.15)] bg-card'
            : 'border-border/50 bg-card/50 hover:border-border',
        )}
      >
        {mode === 'url' ? (
          <>
            <div className="flex items-center gap-3 p-5">
              <Link
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isFocused ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <input
                type="url"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && value.trim()) onSubmit()
                }}
                placeholder="粘贴 YouTube、B站、播客链接..."
                disabled={disabled}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
              />
              {value.trim() && (
                <button
                  onClick={onSubmit}
                  disabled={disabled}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                    disabled
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95',
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  开始
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Smart hints */}
            <div className="px-5 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
              {[
                { icon: FileVideo, text: 'YouTube → 公众号', url: 'https://youtube.com/' },
                { icon: Mic, text: '播客 → 文章', url: 'https://open.spotify.com/' },
                { icon: FileVideo, text: 'B站 → 小红书', url: 'https://bilibili.com/' },
              ].map((hint) => (
                <button
                  key={hint.text}
                  onClick={() => {
                    onValueChange(hint.url)
                    setTimeout(onSubmit, 100)
                  }}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <hint.icon className="h-3 w-3" />
                  {hint.text}
                </button>
              ))}
            </div>
          </>
        ) : mode === 'file' ? (
          <div
            onClick={() => {
              const input = document.getElementById('file-upload') as HTMLInputElement
              input?.click()
            }}
            className="flex cursor-pointer flex-col items-center gap-3 p-8 transition-colors hover:bg-muted/30 rounded-2xl"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">点击或拖拽上传文件</p>
              <p className="text-sm text-muted-foreground mt-1">MP3, WAV, MP4, MOV — 最大 500MB</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const formData = new FormData()
                formData.append('file', file)
                onValueChange(file.name)
                try {
                  const res = await fetch('/api/repurpose/transcribe', {
                    method: 'POST',
                    body: formData,
                  })
                  if (res.ok) onSubmit()
                } catch {}
              }}
            />
          </div>
        ) : (
          <>
            <textarea
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey && value.trim()) onSubmit()
              }}
              placeholder="直接粘贴视频/音频的文字稿，AI 将帮你改写成多平台内容..."
              disabled={disabled}
              rows={6}
              className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/50 p-5"
            />
            <div className="flex items-center justify-between px-5 pb-4">
              <p className="text-xs text-muted-foreground">
                ⌘+Enter 直接生成
              </p>
              {value.trim() && (
                <button
                  onClick={onSubmit}
                  disabled={disabled}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  生成内容
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {mode === 'url' && value && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          按 Enter 或点击「开始」→ AI 自动转写并生成多平台内容
        </p>
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'
import type { OutputFormat } from '@/lib/repurpose/types'

interface RefineMessage {
  role: 'user' | 'assistant'
  content: string
  diff?: { before: string; after: string }
}

interface RefineChatProps {
  format: OutputFormat
  messages: RefineMessage[]
  onSend: (message: string) => void
  onClose: () => void
}

export function RefineChat({ format, messages, onSend, onClose }: RefineChatProps) {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const meta = OUTPUT_FORMATS[format]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    setIsSending(true)
    await onSend(input.trim())
    setInput('')
    setIsSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">对话精调 - {meta.label}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[50vh]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300',
                msg.role === 'user' ? 'justify-end' : '',
              )}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50',
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.diff && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      查看改动对比
                    </summary>
                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-muted-foreground">原文开头:</p>
                      <p className="bg-background rounded p-2 line-through text-muted-foreground/60">
                        {msg.diff.before.slice(0, 200)}...
                      </p>
                      <p className="text-muted-foreground">修改后:</p>
                      <p className="bg-background rounded p-2">{msg.diff.after.slice(0, 200)}...</p>
                    </div>
                  </details>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick hints */}
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          {['更口语化', '缩短一半', '加上案例', '加 emoji', '更正式'].map((hint) => (
            <button
              key={hint}
              onClick={() => {
                setInput(hint)
                setTimeout(() => document.getElementById('refine-input')?.focus(), 50)
              }}
              className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              id="refine-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="告诉 AI 你想怎么调整这段内容..."
              disabled={isSending}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2.5 transition-all',
                input.trim() && !isSending
                  ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Loader2, CheckCircle2, Sparkles, Mic, FileText, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressInfo {
  phase: string
  message: string
  detail?: string
  percent: number
  elapsed: number
}

interface ProcessingViewProps {
  progress: ProgressInfo | null
  onCancel: () => void
}

export function ProcessingView({ progress, onCancel }: ProcessingViewProps) {
  if (!progress) return null

  const isTranscribing = progress.phase === 'transcribing'
  const isGenerating = progress.phase === 'generating'
  const isCompleted = progress.phase === 'completed'
  const icon = isCompleted ? CheckCircle2 : isTranscribing ? Mic : Sparkles

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500',
          isCompleted
            ? 'border-green-500 bg-green-500/10'
            : 'border-primary bg-primary/10',
        )}>
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          )}
        </div>
        <div>
          <p className="text-lg font-semibold">
            {isCompleted ? '处理完成' : isTranscribing ? '语音转写中' : '内容生成中'}
          </p>
          <p className="text-sm text-muted-foreground">{progress.message}</p>
        </div>
      </div>

      {/* Progress bar */}
      {!isCompleted && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {isTranscribing ? '转写进度' : '生成进度'}
            </span>
            <span className="font-mono tabular-nums">{progress.percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                'bg-gradient-to-r from-primary to-purple-500',
                progress.percent < 100 && 'animate-pulse',
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Detail info */}
      {progress.detail && (
        <div className="flex items-center gap-2 justify-center mb-4">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{progress.detail}</p>
        </div>
      )}

      {/* Cancel button */}
      {!isCompleted && (
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            取消处理
          </button>
        </div>
      )}
    </div>
  )
}

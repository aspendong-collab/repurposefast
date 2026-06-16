'use client'
import { Loader2, CheckCircle2, Sparkles, Mic, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dictionary } from '@/lib/dictionary'

interface ProgressInfo { phase: string; message: string; detail?: string; percent: number; elapsed: number }

export function ProcessingView({ d, progress, onCancel }: { d: Dictionary; progress: ProgressInfo | null; onCancel: () => void }) {
  if (!progress) return null
  const isComp = progress.phase === 'completed'
  const isTrans = progress.phase === 'transcribing'
  const Icon = isComp ? CheckCircle2 : isTrans ? Mic : Sparkles
  const phaseLabel = isComp ? d.workbench.completed : isTrans ? d.workbench.transcribing : d.workbench.generating

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500', isComp ? 'border-green-500 bg-green-500/10' : 'border-primary bg-primary/10')}>
          {isComp ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Loader2 className="h-6 w-6 text-primary animate-spin" />}
        </div>
        <div>
          <p className="text-lg font-semibold">{phaseLabel}</p>
          <p className="text-sm text-muted-foreground">{progress.message}</p>
        </div>
      </div>

      {!isComp && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{d.workbench.progress}</span>
            <span className="font-mono tabular-nums">{progress.percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 ease-out" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {progress.detail && (
        <div className="flex items-center gap-2 justify-center mb-4">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{progress.detail}</p>
        </div>
      )}

      {!isComp && (
        <div className="text-center">
          <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
            {d.workbench.cancel}
          </button>
        </div>
      )}
    </div>
  )
}

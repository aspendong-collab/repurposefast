'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, Sparkles, Link, FileText, Upload, Zap, Globe, Layers, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkbench } from '@/hooks/use-workbench'
import { ProcessingView } from '@/components/workbench/processing-view'
import { Gallery } from '@/components/workbench/gallery'
import { RefineChat } from '@/components/workbench/refine-chat'

const STATS = [
  { value: '63+', label: 'Languages', icon: Globe },
  { value: '10', label: 'Output Formats', icon: Layers },
  { value: '<1 min', label: 'Processing Time', icon: Zap },
]

export function HeroSection() {
  const {
    state,
    setInputValue,
    setInputMode,
    startProcessing,
    cancelProcessing,
    openRefine,
    closeRefine,
    sendRefineMessage,
    reset,
  } = useWorkbench()

  const isProcessing = state.phase === 'transcribing' || state.phase === 'generating'
  const hasResults = state.formats.some((f) => f.status !== 'pending')

  return (
    <section id="tool" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[180px]" />
        <div className="bg-grid absolute inset-0 opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl px-4 w-full">
        {/* ── Hero Text ── */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm text-violet-400">
            <Sparkles className="h-4 w-4" />
            AI-Powered Content Repurposing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
            Turn One Video Into<br />
            <span className="gradient-text">Your Entire Content Strategy</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Paste a link or upload a file — AI automatically transcribes and repurposes your content into
            blog posts, social threads, newsletters, and more. <span className="text-violet-400 font-medium">10x your content output.</span>
          </p>
        </div>

        {/* ── Stats Bar ── */}
        <div className="flex justify-center gap-8 sm:gap-16 mb-10 animate-in fade-in duration-1000">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-bold text-foreground">
                <Icon className="h-5 w-5 text-violet-400" />
                {value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Embedded Tool ── */}
        {state.phase === 'idle' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-1 shadow-2xl shadow-violet-500/5">
              {/* Mode Switcher */}
              <div className="flex gap-1 px-1 pt-1 pb-3 border-b border-border/30">
                {[
                  { id: 'url' as const, icon: Link, label: 'Paste Link' },
                  { id: 'file' as const, icon: Upload, label: 'Upload File' },
                  { id: 'text' as const, icon: FileText, label: 'Paste Text' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setInputMode(id)}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                      state.inputMode === id
                        ? 'bg-violet-600/10 text-violet-400 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-6">
                <div className="relative">
                  {state.inputMode === 'url' && (
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="url"
                          value={state.inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && state.inputValue.trim()) startProcessing() }}
                          placeholder="Paste YouTube, podcast, or any video link..."
                          className="w-full h-14 rounded-xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <button
                        onClick={startProcessing}
                        disabled={!state.inputValue.trim()}
                        className={cn(
                          'shrink-0 h-14 px-6 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                          state.inputValue.trim()
                            ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/25 active:scale-95'
                            : 'bg-muted text-muted-foreground cursor-not-allowed',
                        )}
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">Generate</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {state.inputMode === 'text' && (
                    <div>
                      <textarea
                        value={state.inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Paste your transcript or text here, AI will repurpose it into multiple formats..."
                        rows={4}
                        className="w-full rounded-xl border border-border/50 bg-background/50 p-4 text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all resize-none placeholder:text-muted-foreground/50"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-muted-foreground">⌘+Enter to generate</p>
                        <button
                          onClick={startProcessing}
                          disabled={!state.inputValue.trim()}
                          className={cn(
                            'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                            state.inputValue.trim()
                              ? 'bg-violet-600 text-white hover:bg-violet-500'
                              : 'bg-muted text-muted-foreground cursor-not-allowed',
                          )}
                        >
                          <Sparkles className="h-4 w-4" /> Generate
                        </button>
                      </div>
                    </div>
                  )}
                  {state.inputMode === 'file' && (
                    <div
                      onClick={() => document.getElementById('hero-file-input')?.click()}
                      className="flex flex-col items-center gap-4 p-10 rounded-xl border-2 border-dashed border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5 cursor-pointer transition-all"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium">Drop your audio/video file here</p>
                        <p className="text-sm text-muted-foreground mt-1">MP3, WAV, MP4, MOV — up to 500MB</p>
                      </div>
                      <input id="hero-file-input" type="file" accept="audio/*,video/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return
                        const fd = new FormData(); fd.append('file', file)
                        setInputValue(file.name)
                        try { const r = await fetch('/api/repurpose/transcribe', { method: 'POST', body: fd }); if (r.ok) startProcessing() } catch {}
                      }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-6 mt-8 animate-in fade-in zoom-in-95 duration-300">
            <ProcessingView progress={state.progress} onCancel={cancelProcessing} />
            {hasResults && (
              <Gallery formats={state.formats} onCopy={() => {}} onDownload={() => {}} onRefine={openRefine} />
            )}
          </div>
        )}

        {/* Results */}
        {state.phase === 'completed' && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">
                ✨ {state.formats.filter((f) => f.status === 'completed').length} formats generated
              </h2>
            </div>
            <Gallery formats={state.formats} onCopy={() => {}} onDownload={() => {}} onRefine={openRefine} />
            <div className="text-center mt-8">
              <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                Start over
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <div className="flex justify-center mt-8 animate-in fade-in duration-300">
            <div className="max-w-md text-center p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-medium mb-2">Something went wrong</p>
              <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
              <button onClick={reset} className="text-sm text-violet-400 hover:text-violet-300">Try again</button>
            </div>
          </div>
        )}

        {/* Scroll indicator */}
        {state.phase === 'idle' && (
          <div className="flex justify-center mt-16 animate-in fade-in duration-1000 delay-1000">
            <ChevronDown className="h-6 w-6 text-muted-foreground/40 animate-bounce" />
          </div>
        )}
      </div>

      {state.refineTarget && (
        <RefineChat format={state.refineTarget} messages={state.refineMessages} onSend={sendRefineMessage} onClose={closeRefine} />
      )}
    </section>
  )
}

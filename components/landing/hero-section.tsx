'use client'

import { ArrowRight, Sparkles, Link, FileText, Upload, Zap, Globe, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkbench } from '@/hooks/use-workbench'
import { ProcessingView } from '@/components/workbench/processing-view'
import { Gallery } from '@/components/workbench/gallery'
import { RefineChat } from '@/components/workbench/refine-chat'

const STATS = [
  { value: '63+', label: 'Languages', icon: Globe },
  { value: '10', label: 'Formats', icon: Layers },
  { value: '<60s', label: 'Processing', icon: Zap },
]

export function HeroSection() {
  const { state, setInputValue, setInputMode, startProcessing, cancelProcessing, openRefine, closeRefine, sendRefineMessage, reset } = useWorkbench()
  const busy = state.phase === 'transcribing' || state.phase === 'generating'
  const hasResults = state.formats.some(f => f.status !== 'pending')

  return (
    <section id="tool" className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10">
        <div className="g-hero absolute inset-0" />
        <div className="bg-dot absolute inset-0 opacity-60" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1px] h-[40%] bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 w-full">
        {/* Hero Headline */}
        <div className="text-center mb-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.04] px-5 py-2 text-sm font-medium text-violet-300 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Content Repurposing
          </div>
          <h1 className="text-[3.2rem] sm:text-[4rem] lg:text-[5.5rem] xl:text-[6.5rem] font-extrabold tracking-tighter leading-[0.95]">
            <span className="text-foreground">Turn One Video</span>
            <br />
            <span className="g-text">Into Content Everywhere</span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground/80 leading-relaxed font-light">
            Paste a YouTube link. Upload a podcast. Drop a text transcript.
            <br />
            <span className="text-violet-300/80 font-normal">ailomo instantly creates polished content for every platform.</span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 sm:gap-20 mb-12">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-bold text-foreground group-hover:scale-105 transition-transform">
                <Icon className="h-6 w-6 text-violet-400" />
                {value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-2 tracking-widest uppercase">{label}</div>
            </div>
          ))}
        </div>

        {/* Input Card - idle */}
        {state.phase === 'idle' && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-strong rounded-2xl p-1 glow-v">
              {/* Mode Tabs */}
              <div className="flex gap-1 px-1 pt-1 pb-2 border-b border-white/[0.04]">
                {[
                  { id: 'url' as const, icon: Link, label: 'Paste Link' },
                  { id: 'file' as const, icon: Upload, label: 'Upload' },
                  { id: 'text' as const, icon: FileText, label: 'Text' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setInputMode(id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                      state.inputMode === id
                        ? 'bg-white text-black shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* URL Input */}
              <div className="p-5 sm:p-6">
                {state.inputMode === 'url' && (
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={state.inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && state.inputValue.trim()) startProcessing() }}
                        placeholder="Paste a YouTube link, podcast URL, or any video..."
                        className="w-full h-14 rounded-xl input-focus pl-5 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/35 bg-transparent"
                      />
                    </div>
                    <button
                      onClick={startProcessing}
                      disabled={!state.inputValue.trim()}
                      className={cn(
                        'shrink-0 h-14 px-8 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                        state.inputValue.trim()
                          ? 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10 active:scale-[0.97] btn-shine'
                          : 'bg-white/[0.04] text-muted-foreground cursor-not-allowed',
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Text mode */}
                {state.inputMode === 'text' && (
                  <div>
                    <textarea
                      value={state.inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Paste your transcript or text — AI transforms it into platform-ready content..."
                      rows={5}
                      className="w-full rounded-xl input-focus p-4 text-sm resize-none text-foreground placeholder:text-muted-foreground/35 bg-transparent"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={startProcessing}
                        disabled={!state.inputValue.trim()}
                        className={cn(
                          'px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                          state.inputValue.trim()
                            ? 'bg-white text-black hover:bg-white/90 active:scale-[0.97]'
                            : 'bg-white/[0.04] text-muted-foreground cursor-not-allowed',
                        )}
                      >
                        <Sparkles className="h-4 w-4" /> Generate
                      </button>
                    </div>
                  </div>
                )}

                {/* File mode */}
                {state.inputMode === 'file' && (
                  <div
                    onClick={() => document.getElementById('hero-file-upload')?.click()}
                    className="flex flex-col items-center gap-4 py-12 rounded-xl border-2 border-dashed border-violet-500/15 hover:border-violet-500/30 hover:bg-violet-500/[0.02] cursor-pointer transition-all"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium">Drop your file here</p>
                      <p className="text-sm text-muted-foreground mt-1">MP3, WAV, MP4, MOV — up to 500MB</p>
                    </div>
                    <input id="hero-file-upload" type="file" accept="audio/*,video/*" className="hidden" onChange={async e => {
                      const f = e.target?.files?.[0]; if (!f) return
                      const fd = new FormData(); fd.append('file', f)
                      setInputValue(f.name)
                      try { const r = await fetch('/api/repurpose/transcribe',{method:'POST',body:fd}); if(r.ok) startProcessing() } catch {}
                    }} />
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground/50 mt-4">
              No sign-up required. Free to start.
            </p>
          </div>
        )}

        {/* Processing / Results */}
        {busy && (
          <div className="flex flex-col items-center gap-6 mt-10">
            <ProcessingView progress={state.progress} onCancel={cancelProcessing} />
            {hasResults && <Gallery formats={state.formats} onCopy={()=>{}} onDownload={()=>{}} onRefine={openRefine} />}
          </div>
        )}
        {state.phase === 'completed' && (
          <div className="mt-10 text-center">
            <p className="text-2xl font-bold mb-8 g-text">✨ {state.formats.filter(f=>f.status==='completed').length} formats generated</p>
            <Gallery formats={state.formats} onCopy={()=>{}} onDownload={()=>{}} onRefine={openRefine} />
            <button onClick={reset} className="mt-8 text-sm text-muted-foreground hover:text-white underline underline-offset-4">Start over</button>
          </div>
        )}
        {state.phase === 'error' && (
          <div className="flex justify-center mt-8">
            <div className="max-w-md p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.04] text-center">
              <p className="font-medium text-red-400 mb-2">Something went wrong</p>
              <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
              <button onClick={reset} className="text-sm text-violet-400 hover:text-violet-300">Try again</button>
            </div>
          </div>
        )}
      </div>

      {state.refineTarget && (
        <RefineChat format={state.refineTarget} messages={state.refineMessages} onSend={sendRefineMessage} onClose={closeRefine} />
      )}
    </section>
  )
}

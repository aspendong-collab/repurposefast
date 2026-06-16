'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import type { OutputFormat, ContentOutput, TranscriptSegment } from '@/lib/repurpose/types'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'
import type { Dictionary } from '@/lib/dictionary'

type Phase = 'idle' | 'transcribing' | 'generating' | 'completed' | 'error'

interface ProgressInfo { phase: string; message: string; detail?: string; percent: number; elapsed: number }
interface FormatResult { format: OutputFormat; status: 'pending'|'streaming'|'completed'|'error'; title: string; content: string; metadata?: ContentOutput['metadata']; error?: string }
interface RefineMessage { role: 'user'|'assistant'; content: string; diff?: { before: string; after: string } }
interface AppState {
  inputMode: 'url'|'file'|'text'; inputValue: string; detectedLanguage: string|null; detectedPlatform: string|null
  phase: Phase; progress: ProgressInfo|null; jobId: string|null
  transcript: string; segments: TranscriptSegment[]; formats: FormatResult[]
  activeCard: OutputFormat|null; refineTarget: OutputFormat|null; refineMessages: RefineMessage[]; error: string|null
}

const SMART_SUGGESTIONS: Record<string, OutputFormat[]> = {
  youtube: ['wechat-article','twitter-thread','xiaohongshu','blog-post'],
  bilibili: ['wechat-article','xiaohongshu','blog-post'],
  podcast: ['blog-post','newsletter','summary'],
  meeting: ['summary','blog-post'],
  tiktok: ['xiaohongshu','twitter-thread'],
  default: ['wechat-article','xiaohongshu','twitter-thread'],
}

function detectPlatform(url: string): string {
  if (url.includes('youtube.com')||url.includes('youtu.be')) return 'youtube'
  if (url.includes('bilibili.com')) return 'bilibili'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('open.spotify.com')||url.includes('apple.com/podcast')) return 'podcast'
  return 'default'
}

export function useWorkbench(dict: Dictionary) {
  const w = dict.workbench
  const [state, setState] = useState<AppState>({ inputMode:'url',inputValue:'',detectedLanguage:null,detectedPlatform:null,phase:'idle',progress:null,jobId:null,transcript:'',segments:[],formats:[],activeCard:null,refineTarget:null,refineMessages:[],error:null })
  const abortRef = useRef<AbortController|null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  useEffect(()=>{return ()=>{if(timerRef.current)clearInterval(timerRef.current)}},[])

  const fmt = (tmpl: string, vars: Record<string,any>) => Object.entries(vars).reduce((s,[k,v])=>s.replace(`{${k}}`,String(v)),tmpl)

  const startProgressTimer = useCallback((phase: string, estimatedSeconds: number, initialMessage: string) => {
    const startTime = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now()-startTime)/1000
      const percent = Math.min(Math.round((elapsed/estimatedSeconds)*100),95)
      setState(s=>({...s,progress:{phase,message:initialMessage,detail:`${w.elapsedPrefix} ${fmt(w.elapsedFormat,{elapsed:Math.floor(elapsed)})}${estimatedSeconds>0?' · '+fmt(w.estimatedFormat,{seconds:estimatedSeconds}):''}`,percent,elapsed}}))
    },500)
  },[w])
  const stopProgressTimer = useCallback(()=>{if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null}},[])

  const setInputValue = useCallback((v:string)=>setState(s=>({...s,inputValue:v,error:null})),[])
  const setInputMode = useCallback((m:'url'|'file'|'text')=>setState(s=>({...s,inputMode:m})),[])
  const openRefine = useCallback((format:OutputFormat)=>{setState(s=>({...s,refineTarget:format,refineMessages:[{role:'assistant',content:`${w.refineTitle}${OUTPUT_FORMATS[format].label} ${w.refinePlaceholder}`}]}))},[w])
  const closeRefine = useCallback(()=>setState(s=>({...s,refineTarget:null,refineMessages:[]})),[])

  const doStream = async (transcriptText: string, formats: OutputFormat[], lang: string, plat: string) => {
    abortRef.current = new AbortController()
    const completedSet = new Set<string>()
    const total = formats.length
    const streamRes = await fetch('/api/repurpose/stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcript:transcriptText,formats,language:lang,platform:plat}),signal:abortRef.current.signal})
    if (!streamRes.ok) { const ed = await streamRes.json().catch(()=>({})); throw new Error(ed.error||'Stream failed') }
    const reader = streamRes.body?.getReader()
    if (!reader) throw new Error(w.streamError)
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const {done,value}=await reader.read(); if(done) break
      buffer+=decoder.decode(value,{stream:true})
      const lines = buffer.split('\n'); buffer=lines.pop()||''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const event = JSON.parse(line.slice(6))
          if (event.type==='chunk') {
            const meta = OUTPUT_FORMATS[event.format]
            setState(s=>({...s,progress:{phase:'generating',message:fmt(w.generatingFormat,{format:meta?.label||event.format}),detail:fmt(w.formatsProgress,{done:completedSet.size,total}),percent:Math.round((completedSet.size/total)*100),elapsed:0},formats:s.formats.map(f=>f.format===event.format?{...f,status:'streaming'as const,content:(f.content||'')+event.text}:f)}))
          }
          if (event.type==='complete') { completedSet.add(event.format); setState(s=>({...s,progress:{phase:'generating',message:fmt(w.formatComplete,{format:OUTPUT_FORMATS[event.format]?.label||event.format}),detail:fmt(w.formatsProgress,{done:completedSet.size,total}),percent:Math.round((completedSet.size/total)*100),elapsed:0},formats:s.formats.map(f=>f.format===event.format?{...f,status:'completed'as const,title:event.title||f.title,metadata:event.metadata}:f)})) }
          if (event.type==='done') { stopProgressTimer(); setState(s=>({...s,phase:'completed',progress:{phase:'completed',message:fmt(w.allDone,{count:completedSet.size}),percent:100,elapsed:0}})) }
        } catch {}
      }
    }
    setState(s=>({...s,phase:'completed',progress:{phase:'completed',message:fmt(w.allDone,{count:completedSet.size}),percent:100,elapsed:0}}))
  }

  const startProcessing = useCallback(async () => {
    const {inputValue,inputMode} = state
    if (!inputValue) return
    stopProgressTimer()
    setState(s=>({...s,error:null,phase:inputMode==='text'?'generating':'transcribing'}))
    const platform = inputMode==='url'?detectPlatform(inputValue):'default'
    const suggestedFormats = SMART_SUGGESTIONS[platform]||SMART_SUGGESTIONS.default
    const jobId = crypto.randomUUID()
    const initialFormats: FormatResult[] = suggestedFormats.map(f=>({format:f,status:'pending'as const,title:OUTPUT_FORMATS[f].label,content:''}))
    setState(s=>({...s,detectedPlatform:platform,phase:inputMode==='text'?'generating':'transcribing',formats:initialFormats,jobId}))

    if (inputMode==='text') {
      setState(s=>({...s,phase:'generating',transcript:inputValue,progress:{phase:'generating',message:w.transcribeDone,detail:fmt(w.detectedLang,{lang:'N/A',chars:inputValue.length}),percent:0,elapsed:0}}))
      try { await doStream(inputValue,suggestedFormats,'zh',platform) }
      catch(e:any) { stopProgressTimer(); setState(s=>({...s,phase:'error',error:e?.message||'Failed',progress:null})) }
      return
    }

    startProgressTimer('transcribing',20,w.transcribeStart)
    try {
      const tr = await fetch('/api/repurpose/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:inputMode,url:inputValue||undefined,language:'auto'}),signal:AbortSignal.timeout(120000)})
      if (!tr.ok) { const ed=await tr.json().catch(()=>({})); throw new Error(ed.error||`Request failed (${tr.status})`) }
      const td = await tr.json()

      // Captions disabled → call HF Space directly (yt-dlp + Faster-Whisper)
      if (td.status === 'processing' || !td.transcript) {
        const hfUrl = 'https://silence2026-ailomo-whisper.hf.space'
        setState(s=>({...s,progress:{phase:'transcribing',message:'Downloading & transcribing via GPU...',percent:5,elapsed:0}}))
        
        const subRes = await fetch(hfUrl+'/gradio_api/call/transcribe_fn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:[inputValue,'en']})})
        const {event_id} = await subRes.json()
        
        for (let i=0;i<60;i++) {
          await new Promise(r=>setTimeout(r,3000))
          setState(s=>({...s,progress:{...s.progress!,percent:Math.min(5+i*1.5,95)}}))
          const pr=await fetch(hfUrl+'/gradio_api/call/transcribe_fn/'+event_id)
          const pt=await pr.text()
          if (pt.includes('event: complete')) {
            const dl=pt.split('\n').find((l:string)=>l.startsWith('data: '))
            if (dl) {
              const r=JSON.parse(dl.slice(6));const text=r[0];const detLang=r[1]||'en'
              stopProgressTimer()
              setState(s=>({...s,phase:'generating',transcript:text,detectedLanguage:detLang,progress:{phase:'generating',message:'Transcription complete!',detail:fmt(w.detectedLang,{lang:detLang,chars:text?.length||0}),percent:100,elapsed:0}}))
              await doStream(text,suggestedFormats,detLang,platform)
              return
            }
          }
        }
        throw new Error('GPU transcription timed out. Try Paste Text or upload audio file.')
      }

      if (!td.transcript) throw new Error(w.transcribeFailed)
      stopProgressTimer()
      setState(s=>({...s,phase:'generating',transcript:td.transcript,segments:td.segments||[],detectedLanguage:td.detectedLanguage||'zh',progress:{phase:'generating',message:w.transcribeDone,detail:fmt(w.detectedLang,{lang:td.detectedLanguage||'auto',chars:td.transcript.length}),percent:100,elapsed:0}}))
      await doStream(td.transcript,suggestedFormats,td.detectedLanguage||'zh',platform)
    } catch(e:any) {
      stopProgressTimer()
      const msg = e?.name==='AbortError'||e?.name==='TimeoutError'?w.timeoutError:e?.message||'Failed'
      setState(s=>({...s,phase:'error',error:msg,progress:null}))
    }
  },[state.inputValue,state.inputMode,w,startProgressTimer,stopProgressTimer])

  const cancelProcessing = useCallback(()=>{stopProgressTimer();abortRef.current?.abort();setState(s=>({...s,phase:'idle',progress:null,jobId:null,error:null}))},[stopProgressTimer])
  const sendRefineMessage = useCallback(async (message:string)=>{
    const {refineTarget,formats}=state;if(!refineTarget)return
    const tf=formats.find(f=>f.format===refineTarget);if(!tf)return
    setState(s=>({...s,refineMessages:[...s.refineMessages,{role:'user'as const,content:message}]}))
    try {
      const r=await fetch('/api/repurpose/refine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({format:refineTarget,originalContent:tf.content,instruction:message})})
      if(!r.ok) throw new Error('Refine failed')
      const d=await r.json()
      setState(s=>({...s,refineMessages:[...s.refineMessages,{role:'assistant'as const,content:d.content,diff:d.diff}],formats:s.formats.map(f=>f.format===refineTarget?{...f,content:d.refined||f.content,title:d.title||f.title}:f)}))
    } catch(e:any){setState(s=>({...s,refineMessages:[...s.refineMessages,{role:'assistant'as const,content:`Refine error: ${e.message}`}]}))}
  },[state.refineTarget,state.formats])
  const reset = useCallback(()=>{stopProgressTimer();setState({inputMode:'url',inputValue:'',detectedLanguage:null,detectedPlatform:null,phase:'idle',progress:null,jobId:null,transcript:'',segments:[],formats:[],activeCard:null,refineTarget:null,refineMessages:[],error:null})},[stopProgressTimer])

  return { state, setInputValue, setInputMode, startProcessing, cancelProcessing, openRefine, closeRefine, sendRefineMessage, reset }
}

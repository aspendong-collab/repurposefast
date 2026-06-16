'use client'
import { useState } from 'react'
import { FormatCard } from './format-card'
import type { OutputFormat } from '@/lib/repurpose/types'
import type { Dictionary } from '@/lib/dictionary'

interface FormatResult { format: OutputFormat; status: 'pending'|'streaming'|'completed'|'error'; title: string; content: string; metadata?: any; error?: string }

export function Gallery({ d, formats, onCopy, onDownload, onRefine }: { d: Dictionary; formats: FormatResult[]; onCopy: (f:OutputFormat,c:string)=>void; onDownload: (f:OutputFormat,c:string,t:string)=>void; onRefine: (f:OutputFormat)=>void }) {
  const [copied, setCopied] = useState<Record<string,boolean>>({})
  const handleCopy = async (f:OutputFormat, c:string) => {
    try { await navigator.clipboard.writeText(c) } catch { const ta=document.createElement('textarea');ta.value=c;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta) }
    setCopied(m=>({...m,[f]:true})); setTimeout(()=>setCopied(m=>({...m,[f]:false})),2000); onCopy(f,c)
  }
  const handleDownload = (f:OutputFormat, c:string, t:string) => { const b=new Blob([c],{type:'text/markdown'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=t.slice(0,30)+'.md';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);onDownload(f,c,t) }
  return (<div className="w-full max-w-6xl mx-auto"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{formats.map(f=>(<FormatCard key={f.format} d={d} format={f.format} status={f.status} content={f.content} title={f.title} metadata={f.metadata} error={f.error} isCopied={!!copied[f.format]} onCopy={()=>handleCopy(f.format,f.content)} onDownload={()=>handleDownload(f.format,f.content,f.title)} onRefine={()=>onRefine(f.format)}/>))}</div></div>)
}
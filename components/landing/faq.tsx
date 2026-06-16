'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dictionary } from '@/lib/dictionary'

export function FAQ({ d }: { d: Dictionary }) {
  const [open, setOpen] = useState<number|null>(null)
  return (<section id="faq" className="py-24 sm:py-32"><div className="mx-auto max-w-3xl px-4 sm:px-6"><div className="text-center mb-16"><p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{d.faq.label}</p><h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{d.faq.title}<span className="g-text">{d.faq.highlight}</span></h2></div><div className="space-y-3">{d.faq.items.map((faq,i)=>(<div key={i} className="rounded-xl border border-border/50 overflow-hidden"><button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"><span className="font-medium pr-4">{faq.q}</span><ChevronDown className={cn('h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',open===i&&'rotate-180')}/></button><div className={cn('px-6 overflow-hidden transition-all duration-200',open===i?'pb-4 max-h-40':'max-h-0')}><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div></div>))}</div></div></section>)
}
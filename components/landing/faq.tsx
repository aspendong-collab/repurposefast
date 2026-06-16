'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQDict { label: string; title: string }

const FAQS = [
  { q: 'Is it really free to start?', a: 'Yes! Free plan gives you 3 videos/month with 5 output formats. No credit card required.' },
  { q: 'Which languages do you support?', a: '63+ languages for transcription and content generation.' },
  { q: 'What platforms can I repurpose content for?', a: 'WeChat, Xiaohongshu, Twitter/X, LinkedIn, blogs, Medium, Substack, newsletters, more.' },
  { q: 'How long does it take?', a: 'Most videos processed in under 1 minute. Content streams in real-time.' },
  { q: 'Can I refine AI-generated content?', a: 'Yes! Chat with each output to adjust tone, length, style, or add elements.' },
  { q: 'What file formats can I upload?', a: 'Audio: MP3, WAV, M4A, FLAC, OGG. Video: MP4, MOV, MKV, WEBM.' },
  { q: 'Is my data safe?', a: 'Yes. Files deleted after processing. Never used for training.' },
  { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime. No long-term contracts.' },
]

export function FAQ({ dict }: { dict: FAQDict }) {
  const [open, setOpen] = useState<number|null>(null)
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{dict.label}</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{dict.title} <span className="g-text">Questions</span></h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq,i)=>(
            <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
              <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors">
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown className={cn('h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',open===i&&'rotate-180')}/>
              </button>
              <div className={cn('px-6 overflow-hidden transition-all duration-200',open===i?'pb-4 max-h-40':'max-h-0')}>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'done') return
    setStatus('loading')
    
    // Submit to our API
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Silently continue — at least show confirmation
    }
    
    setStatus('done')
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Get early access to new features
        </h2>
        <p className="mt-3 text-muted-foreground">
          Join our waitlist. No spam, product updates only.
        </p>

        {status === 'done' ? (
          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-6 py-3 text-sm text-green-400">
            <Check className="h-4 w-4" />
            You're on the list!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 outline-none focus:border-violet-500/40 transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.97] disabled:opacity-50"
            >
              {status === 'loading' ? '...' : 'Join'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

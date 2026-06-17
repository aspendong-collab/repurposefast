import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store (resets on cold start — acceptable for MVP)
const waitlist = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    waitlist.add(email.toLowerCase().trim())
    console.log(`📧 Waitlist: ${email} (total: ${waitlist.size})`)
    return NextResponse.json({ ok: true, count: waitlist.size })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ count: waitlist.size })
}

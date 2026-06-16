// ── POST /api/stripe/checkout ────────────────────────────────────────────────
// Creates a Stripe Checkout Session and returns the URL.
// Configure STRIPE_SECRET_KEY + STRIPE_PRICE_IDS in Vercel env.

import { NextRequest, NextResponse } from 'next/server'

const PRICE_IDS: Record<string, string> = {
  creator: process.env.STRIPE_PRICE_CREATOR || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
}

export async function POST(request: NextRequest) {
  const { plan } = await request.json().catch(() => ({ plan: 'creator' }))
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailomo.com'
  const priceId = PRICE_IDS[plan]

  if (!priceId) {
    // No Stripe configured → return a friendly message + email option
    return NextResponse.json({
      url: null,
      message: 'Payment coming soon! Email hi@ailomo.com for early access.',
    })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        mode: 'subscription',
        success_url: `${siteUrl}?success=true`,
        cancel_url: `${siteUrl}?canceled=true`,
        allow_promotion_codes: 'true',
      }).toString(),
    })

    const session = await res.json()
    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

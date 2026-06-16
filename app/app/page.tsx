import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FeatureHighlights } from '@/components/landing/feature-highlights'
import { Features } from '@/components/landing/features'
import { FormatShowcase } from '@/components/landing/format-showcase'
import { SocialProof } from '@/components/landing/social-proof'
import { Pricing } from '@/components/landing/pricing'
import { CTASection } from '@/components/landing/cta-section'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'RePurposeFast — Turn One Video Into Multi-Platform Content',
  description: 'AI-powered content repurposing. Paste a link → get blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes & more. 63+ languages, free to start.',
  openGraph: {
    title: 'RePurposeFast — AI Video Content Repurposing Tool',
    description: 'Turn one video into your entire content strategy. Free to start.',
  },
}

export default function AppPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero with Embedded Tool */}
        <HeroSection />

        {/* 2. How It Works — 3 steps */}
        <HowItWorks />

        {/* 3. Feature Highlights — Alternating image+text (对标 UniScribe) */}
        <FeatureHighlights />

        {/* 4. Features Grid — 9 capabilities */}
        <Features />

        {/* 5. Format Showcase + Languages */}
        <FormatShowcase />

        {/* 6. Social Proof — Stats + Testimonials */}
        <SocialProof />

        {/* 7. Pricing */}
        <Pricing />

        {/* 8. CTA */}
        <CTASection />

        {/* 9. FAQ */}
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

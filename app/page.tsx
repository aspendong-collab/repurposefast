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
  title: 'ailomo — AI Video Content Repurposing | Turn One Video Into Multi-Platform Content',
  description: 'AI-powered content repurposing. Paste a link → get blog posts, Twitter threads, LinkedIn posts, Xiaohongshu notes & more. 63+ languages, free to start.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeatureHighlights />
        <Features />
        <FormatShowcase />
        <SocialProof />
        <Pricing />
        <CTASection />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

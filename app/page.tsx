'use client'

import { useLocale } from '@/hooks/use-locale'
import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FeatureHighlights } from '@/components/landing/feature-highlights'
import { Features } from '@/components/landing/features'
import { FormatShowcase } from '@/components/landing/format-showcase'
import { SocialProof } from '@/components/landing/social-proof'
import { Pricing } from '@/components/landing/pricing'
import { CTASection } from '@/components/landing/cta-section'
import { EmailCapture } from '@/components/landing/email-capture'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  const { dict } = useLocale()
  return (
    <>
      <Navbar d={dict} />
      <main>
        <HeroSection d={dict} />
        <HowItWorks d={dict} />
        <FeatureHighlights d={dict} />
        <Features d={dict} />
        <FormatShowcase d={dict} />
        <SocialProof d={dict} />
        <Pricing d={dict} />
        <CTASection d={dict} />
        <EmailCapture />
        <FAQ d={dict} />
      </main>
      <Footer d={dict} />
    </>
  )
}

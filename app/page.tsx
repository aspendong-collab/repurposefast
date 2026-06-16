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
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  const { dict } = useLocale()

  return (
    <>
      <Navbar dict={dict.nav} />
      <main>
        <HeroSection dict={dict.hero} />
        <HowItWorks dict={dict.howItWorks} />
        <FeatureHighlights dict={dict.highlights} />
        <Features dict={dict.features} />
        <FormatShowcase dict={dict.formats} />
        <SocialProof dict={dict.social} />
        <Pricing dict={dict.pricing} />
        <CTASection dict={dict.cta} />
        <FAQ dict={dict.faq} />
      </main>
      <Footer dict={dict.footer} />
    </>
  )
}

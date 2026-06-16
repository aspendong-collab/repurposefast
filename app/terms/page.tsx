import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | ailomo' }

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p><strong>Last updated:</strong> June 2026</p>
          <h3>1. Acceptance of Terms</h3>
          <p>By using ailomo, you agree to these terms. If you do not agree, please do not use the service.</p>
          <h3>2. Service Description</h3>
          <p>ailomo provides AI-powered content repurposing services, including audio/video transcription, content generation, and multi-platform formatting.</p>
          <h3>3. User Responsibilities</h3>
          <p>You are responsible for the content you upload and generate. You must have the rights to any content you process through our service. Do not use our service for illegal purposes.</p>
          <h3>4. Intellectual Property</h3>
          <p>You retain all rights to your original content. The AI-generated content produced by our service is yours to use. We claim no ownership over your content or the generated output.</p>
          <h3>5. Service Availability</h3>
          <p>We strive to provide reliable service but do not guarantee uninterrupted access. We may modify or discontinue features with reasonable notice.</p>
          <h3>6. Limitation of Liability</h3>
          <p>ailomo is provided "as is". We are not liable for any damages arising from the use of our service.</p>
          <h3>7. Contact</h3>
          <p>For questions about these terms, contact hi@ailomo.com.</p>
        </div>
      </div>
    </div>
  )
}

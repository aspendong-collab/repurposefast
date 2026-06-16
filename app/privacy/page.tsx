import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy | ailomo' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p><strong>Last updated:</strong> June 2026</p>
          <h3>1. Information We Collect</h3>
          <p>We collect only the minimum data needed to provide our service: uploaded files for transcription and generated content. We do not collect personal information beyond what is necessary for account functionality.</p>
          <h3>2. How We Use Your Data</h3>
          <p>Uploaded audio/video files are processed solely for transcription and content generation. Files are automatically deleted from our servers after processing is complete. We never use your content to train AI models.</p>
          <h3>3. Data Storage & Security</h3>
          <p>All data is processed in secure cloud environments. We use industry-standard encryption for data in transit and at rest. No user content is retained beyond the processing period.</p>
          <h3>4. Third-Party Services</h3>
          <p>We use third-party AI providers (DeepSeek, Hugging Face) for processing. Your content is sent to these services solely for the purpose of transcription and generation. These providers have their own privacy policies.</p>
          <h3>5. Cookies</h3>
          <p>We use essential cookies for language preferences and service functionality. No tracking or advertising cookies are used.</p>
          <h3>6. Contact</h3>
          <p>For privacy concerns, contact us at hi@ailomo.com.</p>
        </div>
      </div>
    </div>
  )
}

export interface Dictionary {
  nav: { features: string; howItWorks: string; pricing: string; faq: string; tryFree: string }
  hero: {
    badge: string; title: string; highlight: string; subtitle: string; accent: string
    stats: { languages: string; formats: string; speed: string }
    tabs: { url: string; file: string; text: string }
    placeholder: string; generate: string
    fileDropTitle: string; fileDropSubtitle: string; textPlaceholder: string
    noSignup: string; processing: string; error: string; tryAgain: string; startOver: string; formatsGenerated: string
  }
  howItWorks: { label: string; title: string; highlight: string; suffix: string; steps: Array<{ title: string; desc: string }> }
  highlights: { label: string; title: string; highlight: string; items: Array<{ badge: string; title: string; desc: string }> }
  features: { label: string; title: string; highlight: string; subtitle: string; list: Array<{ title: string; desc: string }> }
  formats: {
    outputLabel: string; outputTitle: string; outputHighlight: string; outputSubtitle: string
    formatNames: string[]
    langLabel: string; langTitle: string; langSubtitle: string; more: string
  }
  social: { label: string; stats: { users: string; videos: string; rating: string; languages: string }; testimonials: Array<{ text: string; author: string; role: string }> }
  pricing: {
    label: string; title: string; highlight: string; suffix: string; subtitle: string
    enterprise: string; enterpriseLink: string; enterpriseSuffix: string
    plans: {
      free: { name: string; desc: string; cta: string; features: string[] }
      creator: { name: string; desc: string; cta: string; badge: string; features: string[] }
      pro: { name: string; desc: string; cta: string; features: string[] }
    }
  }
  cta: { title: string; highlight: string; suffix: string; subtitle: string; start: string; pricing: string }
  faq: { label: string; title: string; highlight: string; items: Array<{ q: string; a: string }> }
  footer: {
    tagline: string; copyright: string; builtWith: string
    sections: { product: string; tools: string; legal: string; company: string }
    links: { features: string; pricing: string; faq: string; yt2blog: string; vid2twitter: string; vid2xhs: string; podcast2article: string; allTools: string; privacy: string; terms: string; github: string; contact: string }
  }
  workbench: {
    transcribing: string; generating: string; completed: string; progress: string; cancel: string
    refineTitle: string; refinePlaceholder: string; send: string; copy: string; copied: string; download: string; refine: string
  }
}

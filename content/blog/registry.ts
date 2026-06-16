// ── Blog Content Registry ────────────────────────────────────────────────────
// Each entry generates a full SEO-optimized blog page.
// Add entries here, run `node scripts/seo/generate-blog.js` to auto-generate.

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  readingTime: string
  targetKeyword: string
  secondaryKeywords: string[]
  outline: string[]
}

// ── Pillar Posts (Hub Pages) ────────────────────────────────────────────────
export const pillarPosts: BlogPost[] = [
  {
    slug: 'ai-content-repurposing-guide-2026',
    title: 'The Ultimate AI Content Repurposing Guide 2026: Turn One Video Into Your Entire Strategy',
    description: 'Complete guide to AI-powered content repurposing. Learn how to transform one video into blog posts, social media content, newsletters, and more with AI tools.',
    category: 'Content Strategy',
    tags: ['AI content repurposing', 'content marketing', 'video marketing', 'multi-platform content', 'content strategy'],
    readingTime: '12 min',
    targetKeyword: 'AI content repurposing',
    secondaryKeywords: ['video to blog', 'content repurposing tool', 'multi-platform content strategy', 'AI content creation'],
    outline: ['What is AI Content Repurposing', 'Why Repurpose Content in 2026', 'Best AI Repurposing Tools Compared', 'Step-by-Step Repurposing Workflow', 'Platform-Specific Content Optimization', 'Measuring Repurposing ROI', 'Common Mistakes to Avoid'],
  },
  {
    slug: 'youtube-to-blog-post-complete-guide',
    title: 'How to Turn YouTube Videos Into Blog Posts: Complete AI Workflow (2026)',
    description: 'Step-by-step guide: convert YouTube videos into SEO-optimized blog posts using AI. Includes best practices, templates, and tool comparisons.',
    category: 'Tutorials',
    tags: ['YouTube to blog', 'video to article', 'content repurposing', 'blog writing', 'SEO'],
    readingTime: '10 min',
    targetKeyword: 'YouTube to blog post',
    secondaryKeywords: ['convert YouTube to article', 'video to blog post AI', 'YouTube content repurposing', 'video blogging tips'],
    outline: ['Why Convert YouTube to Blog Posts', 'Manual vs AI Conversion', 'Step-by-Step AI Workflow', 'SEO Optimization Tips', 'Blog Structure Best Practices', 'Real Examples with Templates'],
  },
  {
    slug: 'video-to-social-media-content-strategy',
    title: 'Video to Social Media: 10-Platform Content Strategy for 2026',
    description: 'Transform one video into content for Twitter/X, LinkedIn, Xiaohongshu, TikTok, Instagram, and more. Complete cross-platform strategy guide.',
    category: 'Social Media',
    tags: ['social media strategy', 'cross-platform content', 'video repurposing', 'Twitter threads', 'LinkedIn content'],
    readingTime: '14 min',
    targetKeyword: 'video to social media content',
    secondaryKeywords: ['repurpose video for social media', 'cross-platform content strategy', 'video to Twitter thread', 'video to LinkedIn post'],
    outline: ['The One-to-Many Content Model', 'Platform-by-Platform Optimization', 'Timing and Scheduling Strategy', 'Content Variation Without Duplication', 'Analytics and Performance Tracking'],
  },
  {
    slug: 'ai-transcription-accuracy-comparison',
    title: 'AI Transcription Accuracy Compared: Whisper vs DeepSeek vs AssemblyAI (2026)',
    description: 'In-depth comparison of AI transcription tools. Accuracy benchmarks, language support, pricing, and best use cases for each.',
    category: 'Tools & Comparisons',
    tags: ['AI transcription', 'speech to text', 'Whisper', 'DeepSeek', 'transcription comparison'],
    readingTime: '11 min',
    targetKeyword: 'AI transcription accuracy',
    secondaryKeywords: ['best speech to text AI', 'Whisper vs alternatives', 'transcription tool comparison', 'accurate transcription AI'],
    outline: ['Why Transcription Accuracy Matters', 'Methodology and Test Criteria', 'Whisper (OpenAI) Deep Dive', 'DeepSeek Audio Performance', 'AssemblyAI Feature Comparison', 'Accuracy Results by Language', 'Cost Analysis', 'Which Tool to Choose'],
  },
  {
    slug: 'podcast-to-blog-workflow',
    title: 'Podcast to Blog Post: Automated AI Workflow for Content Creators',
    description: 'Turn every podcast episode into an SEO blog post, newsletter, and social media content automatically. Complete workflow for podcasters.',
    category: 'Tutorials',
    tags: ['podcast to blog', 'podcast SEO', 'content repurposing', 'podcast marketing', 'show notes'],
    readingTime: '9 min',
    targetKeyword: 'podcast to blog post',
    secondaryKeywords: ['podcast show notes AI', 'convert podcast to article', 'podcast content repurposing', 'podcast SEO strategy'],
    outline: ['Why Blog Your Podcast', 'Transcription Setup', 'AI Editing and Formatting', 'SEO Optimization for Podcast Posts', 'Show Notes vs Full Blog Posts', 'Automation Pipeline Setup'],
  },
  {
    slug: 'content-repurposing-tools-ranked',
    title: '10 Best Content Repurposing Tools in 2026: Ranked and Reviewed',
    description: 'Comprehensive ranking of the best AI content repurposing tools. Features, pricing, pros/cons for each tool. Updated June 2026.',
    category: 'Tools & Comparisons',
    tags: ['content repurposing tools', 'AI tools', 'content marketing tools', 'best AI tools 2026', 'tool comparison'],
    readingTime: '15 min',
    targetKeyword: 'best content repurposing tools',
    secondaryKeywords: ['content repurposing software', 'AI repurposing tool review', 'best AI content tools', 'repurpose content automatically'],
    outline: ['What Makes a Great Repurposing Tool', 'Tool #1: ailomo', 'Tool #2-#10: Competitor Analysis', 'Feature Comparison Matrix', 'Pricing Breakdown', 'Which Tool Fits Your Needs'],
  },
  {
    slug: 'seo-content-cluster-strategy',
    title: 'SEO Content Cluster Strategy: Build Topical Authority with AI (2026)',
    description: 'Master the content cluster model for SEO. Learn how to build pillar pages, cluster content, and dominate search rankings with AI assistance.',
    category: 'SEO',
    tags: ['SEO strategy', 'content clusters', 'topical authority', 'SEO content', 'AI SEO'],
    readingTime: '13 min',
    targetKeyword: 'SEO content cluster strategy',
    secondaryKeywords: ['topical authority SEO', 'pillar page strategy', 'content cluster model', 'SEO content structure'],
    outline: ['What Are Content Clusters', 'Pillar Page Blueprint', 'Cluster Content Planning', 'Internal Linking Architecture', 'AI-Assisted Content Creation', 'Measuring Cluster Performance', 'Real Cluster Case Study'],
  },
]

// ── Long-Tail Cluster Posts ──────────────────────────────────────────────────
export const clusterPosts: BlogPost[] = [
  {
    slug: 'ai-video-to-blog-workflow-automation',
    title: 'Automate Your Video-to-Blog Workflow with AI: Complete Setup Guide',
    description: 'Build a fully automated pipeline that converts your YouTube videos into blog posts, complete with SEO optimization and scheduling.',
    category: 'Automation',
    tags: ['workflow automation', 'video to blog', 'AI automation', 'content pipeline'],
    readingTime: '8 min',
    targetKeyword: 'automate video to blog',
    secondaryKeywords: ['video to blog automation', 'AI content workflow', 'automated content pipeline'],
    outline: ['The Manual Problem', 'Tool Stack Overview', 'Setting Up AI Transcription', 'Auto-Formatting and SEO', 'Scheduling and Publishing', 'Full Automation Script'],
  },
  {
    slug: 'twitter-thread-from-video-ai',
    title: 'How to Create Viral Twitter/X Threads from Videos Using AI',
    description: 'Transform your videos into engaging Twitter/X threads that drive engagement. Learn the formula, structure, and AI tools to automate it.',
    category: 'Social Media',
    tags: ['Twitter threads', 'X marketing', 'social media AI', 'content repurposing'],
    readingTime: '7 min',
    targetKeyword: 'create Twitter thread from video',
    secondaryKeywords: ['video to Twitter thread', 'AI Twitter thread generator', 'viral thread formula'],
    outline: ['The Anatomy of a Viral Thread', 'Extracting Hook-Worthy Moments', 'Thread Structure Template', 'AI Generation Tips', 'Real Examples Analyzed'],
  },
  {
    slug: 'xiaohongshu-content-strategy-2026',
    title: 'Xiaohongshu (RED) Content Strategy 2026: AI-Powered Growth for International Brands',
    description: 'Complete guide to succeeding on Xiaohongshu as an international brand. Content optimization, AI tools, and growth strategies.',
    category: 'Social Media',
    tags: ['Xiaohongshu', 'RED marketing', 'Chinese social media', 'international marketing', 'AI content'],
    readingTime: '11 min',
    targetKeyword: 'Xiaohongshu content strategy',
    secondaryKeywords: ['RED content marketing', 'Xiaohongshu for brands', 'Chinese platform marketing', 'social commerce China'],
    outline: ['Understanding Xiaohongshu Algorithm', 'Content Types That Perform', 'AI-Assisted Content Creation', 'Hashtag and Keyword Strategy', 'KOL Collaboration Playbook', 'Performance Metrics That Matter'],
  },
  {
    slug: 'linkedin-content-ai-strategy',
    title: 'LinkedIn Content Strategy: Use AI to Build Thought Leadership in 2026',
    description: 'Leverage AI to create consistent, high-quality LinkedIn content that builds professional authority. Templates and strategies included.',
    category: 'Social Media',
    tags: ['LinkedIn marketing', 'thought leadership', 'B2B content', 'AI content', 'personal branding'],
    readingTime: '9 min',
    targetKeyword: 'LinkedIn content AI strategy',
    secondaryKeywords: ['LinkedIn thought leadership', 'AI LinkedIn posts', 'B2B content strategy', 'professional branding AI'],
    outline: ['Why LinkedIn in 2026', 'Content Pillars for Thought Leadership', 'AI-Generated Drafts + Human Touch', 'Posting Cadence and Timing', 'Engagement Optimization'],
  },
  {
    slug: 'multilingual-content-repurposing',
    title: 'Multilingual Content Repurposing: Scale to 63+ Languages with AI',
    description: 'How to repurpose one piece of content into 63+ languages automatically. Complete multilingual content strategy for global reach.',
    category: 'Content Strategy',
    tags: ['multilingual content', 'content localization', 'international SEO', 'AI translation', 'global content'],
    readingTime: '10 min',
    targetKeyword: 'multilingual content repurposing',
    secondaryKeywords: ['content localization AI', 'multilingual SEO', 'translate content automatically', 'global content strategy'],
    outline: ['The Multilingual Opportunity', 'AI vs Human Translation', '63-Language Pipeline Setup', 'SEO for Multilingual Content', 'Quality Control Process', 'Success Metrics'],
  },
  {
    slug: 'content-repurposing-roi-calculator',
    title: 'Content Repurposing ROI: How to Measure and 10x Your Content Efficiency',
    description: 'Calculate the true ROI of content repurposing. Learn metrics, formulas, and how AI tools can multiply your content output without increasing costs.',
    category: 'Content Strategy',
    tags: ['content ROI', 'content efficiency', 'marketing metrics', 'content repurposing', 'AI productivity'],
    readingTime: '8 min',
    targetKeyword: 'content repurposing ROI',
    secondaryKeywords: ['content efficiency metrics', 'repurposing ROI calculator', 'content marketing ROI', 'AI content productivity'],
    outline: ['The Content Efficiency Problem', 'ROI Calculation Framework', 'Time-to-Content Metrics', 'Platform-Specific Value', 'Before/After Case Study', 'Free ROI Calculator Template'],
  },
  {
    slug: 'ai-newsletter-content-generation',
    title: 'How to Generate AI Newsletters from Videos: Complete Setup for Content Creators',
    description: 'Turn your videos into engaging email newsletters automatically. AI-powered workflow for newsletter content creation and distribution.',
    category: 'Tutorials',
    tags: ['newsletter', 'email marketing', 'AI content', 'video to newsletter', 'content automation'],
    readingTime: '7 min',
    targetKeyword: 'AI newsletter from video',
    secondaryKeywords: ['video to newsletter', 'AI email content', 'newsletter automation', 'content creator newsletter'],
    outline: ['Why Newsletters Still Matter', 'Video-to-Newsletter Pipeline', 'AI Editing and Personalization', 'Email Platform Integration', 'Growth and Monetization'],
  },
  {
    slug: 'youtube-seo-content-repurposing',
    title: 'YouTube SEO Meets Content Repurposing: Double Your Organic Reach',
    description: 'Combine YouTube SEO with content repurposing to dominate both video and text search results. Strategy guide for maximum organic reach.',
    category: 'SEO',
    tags: ['YouTube SEO', 'content repurposing', 'organic reach', 'video SEO', 'search strategy'],
    readingTime: '10 min',
    targetKeyword: 'YouTube SEO content repurposing',
    secondaryKeywords: ['YouTube content strategy', 'video SEO text content', 'organic reach strategy', 'YouTube blog synergy'],
    outline: ['YouTube SEO Fundamentals', 'Keyword Research for Both Platforms', 'Video-to-Text SEO Pipeline', 'Cross-Platform Ranking Strategy', 'Tracking Combined Performance'],
  },
]

// ── All posts, ordered for internal linking ──
export const allBlogPosts: BlogPost[] = [...pillarPosts, ...clusterPosts]

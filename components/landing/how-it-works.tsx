export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Paste or Upload',
      desc: 'Drop a YouTube link, upload an audio file, or paste text. No configuration needed — just one click.',
      accent: 'from-violet-600 to-purple-600',
    },
    {
      step: '02',
      title: 'AI Works Its Magic',
      desc: 'Our AI transcribes and understands your content, then intelligently rewrites it for each platform\'s unique style.',
      accent: 'from-purple-600 to-fuchsia-600',
    },
    {
      step: '03',
      title: 'Publish Everywhere',
      desc: 'Get polished content for WeChat, Twitter, LinkedIn, Xiaohongshu, blogs, and more. Copy, download, or share instantly.',
      accent: 'from-fuchsia-600 to-cyan-600',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/3 rounded-full blur-[180px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            From Video to <span className="gradient-text">Multi-Platform</span> in 3 Steps
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {steps.map(({ step, title, desc, accent }, i) => (
            <div key={step} className="relative group">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Step Number */}
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${accent} flex items-center justify-center mb-6 shadow-xl group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{step}</span>
                </div>

                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

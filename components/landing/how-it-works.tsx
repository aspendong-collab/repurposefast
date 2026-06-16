export function HowItWorks() {
  const steps = [
    { step: '01', title: 'Paste or Upload', desc: 'Drop a YouTube link, upload a file, or paste text. Zero configuration.', accent: 'from-violet-500 to-purple-600' },
    { step: '02', title: 'AI Transforms It', desc: 'Your content is transcribed, understood, and rewritten for every platform\'s unique voice.', accent: 'from-purple-500 to-fuchsia-600' },
    { step: '03', title: 'Publish Everywhere', desc: 'Get blog posts, social threads, newsletters, and more. Copy, download, done.', accent: 'from-fuchsia-500 to-cyan-500' },
  ]

  return (
    <section id="how-it-works" className="py-32 sm:py-40 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[180px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400/80 mb-6">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            From Video to{' '}
            <span className="g-text">Multi-Platform</span>
            <br /> in 3 Steps
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {steps.map(({ step, title, desc, accent }, i) => (
            <div key={step} className="relative group">
              {i < 2 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-violet-500/20 to-transparent" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mb-7 shadow-2xl shadow-violet-500/15 group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white tracking-tighter">{step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground/70 text-[15px] leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

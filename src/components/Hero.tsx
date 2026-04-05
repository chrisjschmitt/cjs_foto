export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "100dvh" }}>
      {/* Abstract gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-100 via-warm-50 to-warm-200" />
      <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-warm-200/60 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-warm-300/40 blur-3xl" />

      <div className="relative z-10 px-6 pt-20 pb-16 text-center">
        <p className="mb-4 text-sm tracking-[0.3em] uppercase text-warm-500">
          Visual Art &amp; Photography
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-warm-900 sm:text-4xl lg:text-[2.5rem]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Christopher Schmitt Photographs
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-warm-600 sm:text-lg">
          A curated collection of my work — captured
          through the lens and shaped by my imagination.
        </p>
        <a
          href="#portfolio"
          className="mt-10 inline-flex min-h-[44px] items-center border border-warm-400 px-8 text-sm tracking-widest uppercase text-warm-700 transition-all hover:border-warm-700 hover:bg-warm-900 hover:text-warm-50"
        >
          View Work
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
        <div className="h-12 w-px animate-pulse bg-gradient-to-b from-transparent to-warm-400" />
      </div>
    </section>
  );
}

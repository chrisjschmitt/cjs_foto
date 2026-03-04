export default function Footer() {
  return (
    <footer id="contact" className="border-t border-warm-200 bg-warm-100/50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div>
            <h3 className="font-serif text-2xl text-warm-900">CJS Foto</h3>
            <p className="mt-2 text-sm text-warm-500">
              Visual Art &amp; Photography
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-end">
            <a
              href="mailto:chris@chrisjschmitt.com"
              className="text-sm text-warm-600 transition-colors hover:text-warm-900"
            >
              chris@chrisjschmitt.com
            </a>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-xs tracking-widest uppercase text-warm-400 transition-colors hover:text-warm-700"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-xs tracking-widest uppercase text-warm-400 transition-colors hover:text-warm-700"
              >
                Behance
              </a>
              <a
                href="/cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-widest uppercase text-warm-400 transition-colors hover:text-warm-700"
              >
                CV
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-xs text-warm-400">
          &copy; {new Date().getFullYear()} CJS Foto. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

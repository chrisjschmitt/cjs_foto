"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-warm-50/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap sm:gap-8 sm:px-6 sm:py-5 lg:px-8">
        <a
          href="#"
          className="font-serif text-lg tracking-wide text-warm-900 transition-colors hover:text-warm-600 sm:text-xl"
        >
          Christopher Schmitt Photos
        </a>
        <div className="flex items-center gap-4 sm:gap-8">
          <a
            href="#statement"
            className="min-h-[44px] flex items-center text-xs tracking-widest uppercase text-warm-600 transition-colors hover:text-warm-900 sm:text-sm"
          >
            Statement
          </a>
          <a
            href="#portfolio"
            className="min-h-[44px] flex items-center text-xs tracking-widest uppercase text-warm-600 transition-colors hover:text-warm-900 sm:text-sm"
          >
            Portfolio
          </a>
          <a
            href="#contact"
            className="min-h-[44px] flex items-center text-xs tracking-widest uppercase text-warm-600 transition-colors hover:text-warm-900 sm:text-sm"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}

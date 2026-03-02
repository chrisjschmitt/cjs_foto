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
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <a
          href="#"
          className="font-serif text-xl tracking-wide text-warm-900 hover:text-warm-600 transition-colors"
        >
          CJS Foto
        </a>
        <div className="flex items-center gap-8">
          <a
            href="#statement"
            className="text-sm tracking-widest uppercase text-warm-600 hover:text-warm-900 transition-colors"
          >
            Statement
          </a>
          <a
            href="#portfolio"
            className="text-sm tracking-widest uppercase text-warm-600 hover:text-warm-900 transition-colors"
          >
            Portfolio
          </a>
          <a
            href="#contact"
            className="text-sm tracking-widest uppercase text-warm-600 hover:text-warm-900 transition-colors"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}

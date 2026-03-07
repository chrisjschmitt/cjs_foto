"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import type { SiteSettings, GrantorLogo } from "@/lib/portfolio-data";

export default function Acknowledgements() {
  const [html, setHtml] = useState("");
  const [logos, setLogos] = useState<GrantorLogo[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SiteSettings | null) => {
        if (!data) return;
        const hasLogos = data.grantorLogos && data.grantorLogos.length > 0;
        const hasText = data.acknowledgements && data.acknowledgements.trim();
        if (!hasLogos && !hasText) return;

        setVisible(true);
        if (data.grantorLogos) setLogos(data.grantorLogos);
        if (hasText) setHtml(marked.parse(data.acknowledgements!) as string);
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <section className="border-t border-warm-200 bg-warm-50 py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="mb-8 text-center text-xs tracking-[0.4em] uppercase text-warm-500">
          Acknowledgements
        </p>

        {logos.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo) => (
              <div key={logo.url} className="flex-shrink-0">
                {logo.link ? (
                  <a href={logo.link} target="_blank" rel="noopener noreferrer" title={logo.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.url} alt={logo.name} className="h-16 w-auto object-contain opacity-70 transition-opacity hover:opacity-100" />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.url} alt={logo.name} className="h-16 w-auto object-contain opacity-70" />
                )}
              </div>
            ))}
          </div>
        )}

        {html && (
          <div
            className="prose-warm mx-auto max-w-2xl text-center text-sm leading-relaxed text-warm-600"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  );
}

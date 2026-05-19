"use client";

import { useMemo } from "react";
import { marked } from "marked";
import type { SiteSettings } from "@/lib/portfolio-data";

interface Props {
  settings: SiteSettings | null;
}

export default function Acknowledgements({ settings }: Props) {
  const logos = settings?.grantorLogos || [];
  const ackText = settings?.acknowledgements || "";
  const html = useMemo(() => (ackText ? (marked.parse(ackText) as string) : ""), [ackText]);

  if (logos.length === 0 && !ackText) return null;

  return (
    <section className="border-t border-warm-200 bg-warm-50 py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {logos.length > 0 && (
          <div className={html ? "mb-8" : ""}>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {logos.map((logo) => (
                <div key={logo.url} className="flex-shrink-0">
                  {logo.link ? (
                    <a href={logo.link} target="_blank" rel="noopener noreferrer" title={logo.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo.url} alt={logo.name} className="h-28 w-auto object-contain opacity-80 transition-opacity hover:opacity-100 sm:h-32" />
                    </a>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo.url} alt={logo.name} className="h-28 w-auto object-contain opacity-80 sm:h-32" />
                  )}
                </div>
              ))}
            </div>
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

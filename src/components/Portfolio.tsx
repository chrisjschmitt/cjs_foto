"use client";

import { useState, useEffect } from "react";
import PortfolioCard from "./PortfolioCard";
import Lightbox from "./Lightbox";
import type { StoredArtwork, ImageMeta } from "@/lib/portfolio-data";

export interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  images: (string | ImageMeta)[];
}

export default function Portfolio() {
  const [active, setActive] = useState("All");
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [lightbox, setLightbox] = useState<ArtworkItem | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/portfolio", { cache: "no-store" }).then((res) => (res.ok ? res.json() : [])),
      fetch("/api/settings", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)).catch(() => null),
    ]).then(([portfolioData, settings]) => {
      const mapped: ArtworkItem[] = portfolioData.map(
        (a: StoredArtwork & { imageUrl?: string }) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          year: a.year,
          description: a.description,
          images: a.images || (a.imageUrl ? [a.imageUrl] : []),
        })
      );
      setArtworks(mapped);
      if (settings?.defaultCategory) {
        const exists = mapped.some((a) => a.category === settings.defaultCategory);
        if (exists) setActive(settings.defaultCategory);
      }
    }).catch(() => {});
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(artworks.map((a) => a.category))),
  ];

  const sorted = [...artworks].sort((a, b) => b.year.localeCompare(a.year));

  const filtered =
    active === "All"
      ? sorted
      : sorted.filter((a) => a.category === active);

  return (
    <>
      <section id="portfolio" className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-4 text-center text-xs tracking-[0.4em] uppercase text-warm-500">
            Selected Works
          </p>
          <h2 className="mb-12 text-center font-serif text-4xl font-light text-warm-900 lg:text-5xl">
            Portfolio
          </h2>

          {artworks.length > 0 && (
            <>
              <div className="mb-14 flex flex-wrap items-center justify-center gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className={`rounded-full px-5 py-2 text-xs tracking-widest uppercase transition-all ${
                      active === cat
                        ? "bg-warm-900 text-warm-50"
                        : "bg-warm-100 text-warm-600 hover:bg-warm-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((artwork) => (
                  <PortfolioCard
                    key={artwork.id}
                    artwork={artwork}
                    onClick={() => setLightbox(artwork)}
                  />
                ))}
              </div>
            </>
          )}

          {artworks.length === 0 && (
            <p className="text-center text-warm-400">
              Portfolio coming soon.
            </p>
          )}
        </div>
      </section>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          seriesTitle={lightbox.title}
          seriesDescription={lightbox.description}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

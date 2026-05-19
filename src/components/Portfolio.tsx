"use client";

import { useState, useMemo } from "react";
import PortfolioCard from "./PortfolioCard";
import Lightbox from "./Lightbox";
import type { StoredArtwork, ImageMeta, SiteSettings } from "@/lib/portfolio-data";

export interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  images: (string | ImageMeta)[];
}

interface Props {
  artworks: StoredArtwork[];
  settings: SiteSettings | null;
}

export default function Portfolio({ artworks: raw, settings }: Props) {
  const items: ArtworkItem[] = useMemo(
    () =>
      raw.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        year: a.year,
        description: a.description,
        images: a.images || [],
      })),
    [raw]
  );

  const defaultCat = settings?.defaultCategory || "All";
  const hasDefault = defaultCat !== "All" && items.some((a) => a.category === defaultCat);
  const [active, setActive] = useState(hasDefault ? defaultCat : "All");
  const [lightbox, setLightbox] = useState<ArtworkItem | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(items.map((a) => a.category))),
  ];

  const sorted = [...items].sort((a, b) => b.year.localeCompare(a.year));

  const filtered =
    active === "All"
      ? sorted
      : sorted.filter((a) => a.category === active);

  return (
    <>
      <section id="portfolio" className="scroll-mt-20 py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-4 text-center text-xs tracking-[0.4em] uppercase text-warm-500">
            Selected Works
          </p>
          <h2 className="mb-12 text-center font-serif text-4xl font-light text-warm-900 lg:text-5xl">
            Portfolio
          </h2>

          {items.length > 0 && (
            <>
              <div className="mb-14 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className={`min-h-[44px] rounded-full px-4 py-2 text-xs tracking-widest uppercase transition-all sm:px-5 ${
                      active === cat
                        ? "bg-warm-900 text-warm-50"
                        : "bg-warm-100 text-warm-600 hover:bg-warm-200 active:bg-warm-200"
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

          {items.length === 0 && (
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

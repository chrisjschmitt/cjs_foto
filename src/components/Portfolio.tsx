"use client";

import { useState } from "react";
import PortfolioCard from "./PortfolioCard";

export interface ArtworkItem {
  id: number;
  title: string;
  category: string;
  year: string;
  description: string;
  gradient: string;
  href: string;
}

const artworks: ArtworkItem[] = [
  {
    id: 1,
    title: "Morning Stillness",
    category: "Landscape",
    year: "2025",
    description: "Dawn light filtering through coastal mist.",
    gradient: "from-amber-200 via-orange-100 to-yellow-50",
    href: "#",
  },
  {
    id: 2,
    title: "Urban Geometry",
    category: "Architecture",
    year: "2025",
    description: "Angular shadows cast across concrete and glass.",
    gradient: "from-slate-300 via-gray-200 to-stone-100",
    href: "#",
  },
  {
    id: 3,
    title: "Verdant Whisper",
    category: "Nature",
    year: "2024",
    description: "Close study of dew on unfurling fern fronds.",
    gradient: "from-emerald-200 via-green-100 to-lime-50",
    href: "#",
  },
  {
    id: 4,
    title: "Solitude in Blue",
    category: "Abstract",
    year: "2024",
    description: "An exploration of monochromatic depth and stillness.",
    gradient: "from-sky-200 via-blue-100 to-indigo-50",
    href: "#",
  },
  {
    id: 5,
    title: "Golden Hour",
    category: "Portrait",
    year: "2024",
    description: "Warm light shaping a contemplative moment.",
    gradient: "from-amber-100 via-yellow-50 to-orange-100",
    href: "#",
  },
  {
    id: 6,
    title: "Nocturne",
    category: "Landscape",
    year: "2023",
    description: "City lights reflected on rain-slicked pavement.",
    gradient: "from-violet-200 via-purple-100 to-fuchsia-50",
    href: "#",
  },
];

const categories = ["All", ...Array.from(new Set(artworks.map((a) => a.category)))];

export default function Portfolio() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? artworks : artworks.filter((a) => a.category === active);

  return (
    <section id="portfolio" className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-4 text-center text-xs tracking-[0.4em] uppercase text-warm-500">
          Selected Works
        </p>
        <h2 className="mb-12 text-center font-serif text-4xl font-light text-warm-900 lg:text-5xl">
          Portfolio
        </h2>

        {/* Category filter */}
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

        {/* Gallery grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artwork) => (
            <PortfolioCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </div>
    </section>
  );
}

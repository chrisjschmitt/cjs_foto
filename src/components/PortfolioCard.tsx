import Image from "next/image";
import type { ArtworkItem } from "./Portfolio";

interface Props {
  artwork: ArtworkItem;
  onClick: () => void;
}

export default function PortfolioCard({ artwork, onClick }: Props) {
  const cover = artwork.images[0];

  return (
    <button
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-sm bg-white text-left shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm-100">
        {cover && (
          <Image
            src={cover}
            alt={artwork.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-warm-900/80 px-5 py-2 text-xs tracking-widest uppercase text-warm-50 backdrop-blur-sm">
            {artwork.images.length > 1 ? `View ${artwork.images.length} Images` : "View"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] tracking-widest uppercase text-warm-400">
            {artwork.category}
          </span>
          <span className="text-[11px] tracking-wider text-warm-400">
            {artwork.year}
          </span>
        </div>
        <h3 className="font-serif text-lg text-warm-900">{artwork.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-warm-500">
          {artwork.description}
        </p>
      </div>
    </button>
  );
}

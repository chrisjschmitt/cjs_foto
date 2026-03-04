"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { ImageMeta } from "@/lib/portfolio-data";
import { normalizeImage, imageUrl } from "@/lib/portfolio-data";

interface LightboxProps {
  images: (string | ImageMeta)[];
  seriesTitle: string;
  seriesDescription: string;
  initialIndex?: number;
  onClose: () => void;
}

export default function Lightbox({ images, seriesTitle, seriesDescription, initialIndex = 0, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const touchStart = useRef<number | null>(null);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev();
      else next();
    }
    touchStart.current = null;
  }

  const meta = normalizeImage(images[current]);
  const url = imageUrl(images[current]);
  const hasImageInfo = meta.name || meta.year || meta.description;
  const hasThumbnails = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative flex h-full w-full max-w-7xl flex-col items-center px-4 py-16 sm:py-14" onClick={(e) => e.stopPropagation()}>
        {/* Header — series title and description */}
        <div className="flex w-full items-center justify-between px-0 pb-3 sm:px-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-serif text-base text-white sm:text-lg">{seriesTitle}</h2>
            {seriesDescription && <p className="truncate text-xs text-white/50">{seriesDescription}</p>}
          </div>
          <div className="flex flex-shrink-0 items-center gap-3 pl-3">
            <span className="text-sm tabular-nums text-white/60">
              {current + 1}/{images.length}
            </span>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 active:bg-white/20"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image */}
        <div className={`relative w-full flex-1 ${hasImageInfo ? "" : hasThumbnails ? "mb-16" : ""}`}>
          <Image
            src={url}
            alt={meta.name || seriesTitle}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Image caption — name, year, description below the image */}
        {hasImageInfo && (
          <div className={`w-full px-0 pt-3 text-center sm:px-2 ${hasThumbnails ? "pb-1" : ""}`}>
            {meta.name && <p className="text-sm font-medium text-white">{meta.name}</p>}
            {meta.year && <p className="text-xs text-white/60">{meta.year}</p>}
            {meta.description && <p className="mt-0.5 text-xs text-white/40">{meta.description}</p>}
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white/80 active:bg-white/20 sm:left-4"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white/80 active:bg-white/20 sm:right-4"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {hasThumbnails && (
          <div className="flex gap-2 overflow-x-auto px-0 pt-2 sm:px-2">
            {images.map((img, idx) => (
              <button
                key={imageUrl(img)}
                onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-sm transition-all sm:h-12 sm:w-12 ${
                  idx === current ? "ring-2 ring-white ring-offset-1 ring-offset-black" : "opacity-50 active:opacity-80"
                }`}
              >
                <Image src={imageUrl(img)} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

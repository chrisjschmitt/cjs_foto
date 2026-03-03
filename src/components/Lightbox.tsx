"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface LightboxProps {
  images: string[];
  title: string;
  description: string;
  initialIndex?: number;
  onClose: () => void;
}

export default function Lightbox({ images, title, description, initialIndex = 0, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-7xl flex-col items-center justify-center px-4 py-16" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-6">
          <div>
            <h2 className="font-serif text-lg text-white">{title}</h2>
            <p className="text-xs text-white/50">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm tabular-nums text-white/60">
              {current + 1} / {images.length}
            </span>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-[calc(100%-8rem)] w-full">
          <Image
            src={images[current]}
            alt={`${title} — ${current + 1} of ${images.length}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 flex gap-2 overflow-x-auto px-6">
            {images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setCurrent(idx)}
                className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm transition-all ${
                  idx === current ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image src={img} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

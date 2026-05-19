"use client";

import { useState, useEffect } from "react";
import type { StoredArtwork, SiteSettings } from "@/lib/portfolio-data";
import ArtistStatement from "./ArtistStatement";
import Portfolio from "./Portfolio";
import Acknowledgements from "./Acknowledgements";

export default function HomeContent() {
  const [portfolio, setPortfolio] = useState<StoredArtwork[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/site-data")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPortfolio(data.portfolio || []);
          setSettings(data.settings || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  return (
    <>
      <ArtistStatement settings={settings} />
      <Portfolio artworks={portfolio} settings={settings} />
      <Acknowledgements settings={settings} />
    </>
  );
}

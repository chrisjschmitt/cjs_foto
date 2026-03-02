import { NextResponse } from "next/server";
import {
  getPortfolioManifest,
  savePortfolioManifest,
  deleteArtworkImage,
} from "@/lib/portfolio-data";
import type { StoredArtwork } from "@/lib/portfolio-data";

export async function GET() {
  const artworks = await getPortfolioManifest();
  return NextResponse.json(artworks);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const artworks = await getPortfolioManifest();
  const artwork = artworks.find((a) => a.id === id);

  if (artwork) {
    await deleteArtworkImage(artwork.imageUrl);
  }

  const updated = artworks.filter((a) => a.id !== id);
  await savePortfolioManifest(updated);

  return NextResponse.json(updated);
}

export async function PUT(request: Request) {
  const { id, title, category, year, description } = await request.json();
  const artworks = await getPortfolioManifest();

  const updated: StoredArtwork[] = artworks.map((a) =>
    a.id === id ? { ...a, title, category, year, description } : a
  );

  await savePortfolioManifest(updated);
  return NextResponse.json(updated);
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getPortfolioManifest,
  savePortfolioManifest,
  deleteArtworkImage,
  imageUrl as getImageUrl,
} from "@/lib/portfolio-data";
import type { StoredArtwork } from "@/lib/portfolio-data";
import { verifyRequest, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

function tryRevalidate() {
  try { revalidatePath("/"); } catch { /* non-critical */ }
}

function jsonResponse(data: unknown) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const artworks = await getPortfolioManifest();
  return jsonResponse(artworks);
}

export async function DELETE(request: Request) {
  if (!verifyRequest(request)) return unauthorizedResponse();
  const { id, imageUrl, remainingImages } = await request.json();
  const artworks = await getPortfolioManifest();

  if (imageUrl) {
    await deleteArtworkImage(imageUrl);

    if (Array.isArray(remainingImages)) {
      const updated = artworks.map((a) =>
        a.id === id ? { ...a, images: remainingImages } : a
      );
      await savePortfolioManifest(updated);
      tryRevalidate();
      return jsonResponse({ ok: true });
    }

    const artwork = artworks.find((a) => a.id === id);
    if (artwork) {
      artwork.images = artwork.images.filter((img) => img !== imageUrl);
    }
    await savePortfolioManifest(artworks);
    tryRevalidate();
    return jsonResponse({ ok: true });
  }

  const artwork = artworks.find((a) => a.id === id);
  if (artwork) {
    await Promise.all(artwork.images.map((img) => deleteArtworkImage(getImageUrl(img))));
  }

  const updated = artworks.filter((a) => a.id !== id);
  await savePortfolioManifest(updated);
  tryRevalidate();
  return jsonResponse({ ok: true });
}

export async function PUT(request: Request) {
  if (!verifyRequest(request)) return unauthorizedResponse();
  const body = await request.json();
  const { id, title, category, year, description, images } = body;
  const artworks = await getPortfolioManifest();

  const updated: StoredArtwork[] = artworks.map((a) => {
    if (a.id !== id) return a;
    const patch: Partial<StoredArtwork> = {};
    if (title !== undefined) patch.title = title;
    if (category !== undefined) patch.category = category;
    if (year !== undefined) patch.year = year;
    if (description !== undefined) patch.description = description;
    if (Array.isArray(images)) patch.images = images;
    return { ...a, ...patch };
  });

  await savePortfolioManifest(updated);
  tryRevalidate();
  return jsonResponse({ ok: true });
}

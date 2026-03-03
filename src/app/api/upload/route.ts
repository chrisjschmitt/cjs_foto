import { NextResponse } from "next/server";
import {
  getPortfolioManifest,
  savePortfolioManifest,
  uploadArtworkImage,
} from "@/lib/portfolio-data";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const seriesId = formData.get("seriesId") as string | null;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const year = formData.get("year") as string;
  const description = formData.get("description") as string;

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set. Add it in Vercel project settings or .env.local." },
      { status: 500 }
    );
  }

  try {
    const imageUrls = await Promise.all(files.map((f) => uploadArtworkImage(f)));
    const artworks = await getPortfolioManifest();

    if (seriesId) {
      const idx = artworks.findIndex((a) => a.id === seriesId);
      if (idx === -1) {
        return NextResponse.json({ error: "Series not found" }, { status: 404 });
      }
      artworks[idx].images.push(...imageUrls);
      await savePortfolioManifest(artworks);
      return NextResponse.json(artworks[idx]);
    }

    const newArtwork = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category,
      year,
      description,
      images: imageUrls,
      createdAt: new Date().toISOString(),
    };

    artworks.unshift(newArtwork);
    await savePortfolioManifest(artworks);
    return NextResponse.json(newArtwork);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  getPortfolioManifest,
  savePortfolioManifest,
  uploadArtworkImage,
} from "@/lib/portfolio-data";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse upload. Files may be too large." },
      { status: 413 }
    );
  }

  const files = (formData.getAll("files") as File[]).filter(
    (f) => f instanceof File && f.size > 0
  );
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
    const imageUrls: string[] = [];
    for (const file of files) {
      const url = await uploadArtworkImage(file);
      imageUrls.push(url);
    }

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

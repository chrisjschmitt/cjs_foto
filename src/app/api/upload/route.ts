import { NextResponse } from "next/server";
import {
  getPortfolioManifest,
  savePortfolioManifest,
  uploadArtworkImage,
} from "@/lib/portfolio-data";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const year = formData.get("year") as string;
  const description = formData.get("description") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set. Add it in Vercel project settings or .env.local." },
      { status: 500 }
    );
  }

  try {
    const imageUrl = await uploadArtworkImage(file);
    const artworks = await getPortfolioManifest();

    const newArtwork = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category,
      year,
      description,
      imageUrl,
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

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getPortfolioManifest,
  savePortfolioManifest,
} from "@/lib/portfolio-data";
import { verifyRequest, unauthorizedResponse } from "@/lib/auth";

function tryRevalidate() {
  try { revalidatePath("/"); } catch { /* non-critical */ }
}

export async function POST(request: Request) {
  if (!verifyRequest(request)) return unauthorizedResponse();
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse request." },
      { status: 413 }
    );
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const year = formData.get("year") as string;
  const description = formData.get("description") as string;
  const imageUrlsRaw = formData.get("imageUrls") as string | null;

  if (!imageUrlsRaw) {
    return NextResponse.json({ error: "No image URLs provided" }, { status: 400 });
  }

  if (!title || !category || !year || !description) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const imageUrls: string[] = JSON.parse(imageUrlsRaw);
  if (imageUrls.length === 0) {
    return NextResponse.json({ error: "No images" }, { status: 400 });
  }

  try {
    const artworks = await getPortfolioManifest();

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
    tryRevalidate();
    return NextResponse.json(newArtwork);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { savePortfolioManifest } from "@/lib/portfolio-data";
import type { StoredArtwork } from "@/lib/portfolio-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const { blobs } = await list({ prefix: "portfolio/images/" });
  const imageUrls = blobs
    .filter((b) => !b.pathname.endsWith(".json"))
    .map((b) => b.url);

  return NextResponse.json({
    imageCount: imageUrls.length,
    images: imageUrls,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const series: StoredArtwork[] = body.series;

  if (!Array.isArray(series) || series.length === 0) {
    return NextResponse.json({ error: "Provide a 'series' array" }, { status: 400 });
  }

  for (const s of series) {
    if (!s.id || !s.title || !Array.isArray(s.images)) {
      return NextResponse.json(
        { error: "Each series needs id, title, and images array" },
        { status: 400 }
      );
    }
  }

  await savePortfolioManifest(series);
  return NextResponse.json({ restored: series.length });
}

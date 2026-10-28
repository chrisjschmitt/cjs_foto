import { NextResponse } from "next/server";
import { getPortfolioManifest, getSiteSettings } from "@/lib/portfolio-data";

// Saves call revalidatePath("/api/site-data"), so a long cache is safe.
export const revalidate = 3600;

export async function GET() {
  const [portfolio, settings] = await Promise.all([
    getPortfolioManifest(),
    getSiteSettings(),
  ]);

  return NextResponse.json({ portfolio, settings });
}

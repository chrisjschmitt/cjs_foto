import { NextResponse } from "next/server";
import { getPortfolioManifest, getSiteSettings } from "@/lib/portfolio-data";

export const revalidate = 60;

export async function GET() {
  const [portfolio, settings] = await Promise.all([
    getPortfolioManifest(),
    getSiteSettings(),
  ]);

  return NextResponse.json({ portfolio, settings });
}

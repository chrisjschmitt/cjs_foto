import { NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/portfolio-data";
import type { SiteSettings } from "@/lib/portfolio-data";
import { verifyRequest, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}

export async function PUT(request: Request) {
  if (!verifyRequest(request)) return unauthorizedResponse();

  const body: SiteSettings = await request.json();

  try {
    await saveSiteSettings(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

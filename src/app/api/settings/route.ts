import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteSettings, saveSiteSettings } from "@/lib/portfolio-data";
import type { SiteSettings } from "@/lib/portfolio-data";
import { verifyRequest, unauthorizedResponse } from "@/lib/auth";

export const revalidate = 60;

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!verifyRequest(request)) return unauthorizedResponse();

  const body: SiteSettings = await request.json();

  try {
    await saveSiteSettings(body);
    try {
      revalidatePath("/");
      revalidatePath("/api/site-data");
      revalidatePath("/api/settings");
    } catch { /* non-critical */ }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

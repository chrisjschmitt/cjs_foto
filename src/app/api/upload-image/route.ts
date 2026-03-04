import { NextResponse } from "next/server";
import { uploadArtworkImage } from "@/lib/portfolio-data";
import { verifyRequest, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifyRequest(request)) return unauthorizedResponse();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse upload. File may be too large." },
      { status: 413 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const url = await uploadArtworkImage(file);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

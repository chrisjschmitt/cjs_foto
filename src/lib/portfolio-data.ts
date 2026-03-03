import { put, list, del } from "@vercel/blob";

export interface StoredArtwork {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  images: string[];
  createdAt: string;
}

const MANIFEST_KEY = "portfolio/manifest.json";

export async function getPortfolioManifest(): Promise<StoredArtwork[]> {
  try {
    const { blobs } = await list({ prefix: MANIFEST_KEY });
    if (blobs.length === 0) return [];

    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();

    return data.map((item: StoredArtwork & { imageUrl?: string }) => {
      if (item.images) return item;
      return { ...item, images: item.imageUrl ? [item.imageUrl] : [] };
    });
  } catch {
    return [];
  }
}

export async function savePortfolioManifest(
  artworks: StoredArtwork[]
): Promise<void> {
  const { blobs } = await list({ prefix: MANIFEST_KEY });
  for (const blob of blobs) {
    await del(blob.url);
  }

  await put(MANIFEST_KEY, JSON.stringify(artworks, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function uploadArtworkImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `portfolio/images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
  });

  return blob.url;
}

export async function deleteArtworkImage(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl);
  } catch {
    // Image may already be deleted
  }
}

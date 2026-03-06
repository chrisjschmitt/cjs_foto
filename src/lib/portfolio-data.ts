import { put, list, del } from "@vercel/blob";

export interface ImageMeta {
  url: string;
  name: string;
  year: string;
  description?: string;
}

export interface StoredArtwork {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  images: (string | ImageMeta)[];
  createdAt: string;
}

export function normalizeImage(img: string | ImageMeta): ImageMeta {
  if (typeof img === "string") return { url: img, name: "", year: "" };
  return img;
}

export function imageUrl(img: string | ImageMeta): string {
  return typeof img === "string" ? img : img.url;
}

const MANIFEST_KEY = "portfolio/manifest.json";

function wrapError(step: string, err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  throw new Error(`[${step}] ${msg}`);
}

export async function getPortfolioManifest(): Promise<StoredArtwork[]> {
  try {
    const { blobs } = await list({ prefix: MANIFEST_KEY });
    if (blobs.length === 0) return [];

    const url = `${blobs[0].url}?t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
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
  try {
    await put(MANIFEST_KEY, JSON.stringify(artworks, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    wrapError("manifest-save", err);
  }
}

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  tif: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
  cr2: "image/x-canon-cr2",
  nef: "image/x-nikon-nef",
  arw: "image/x-sony-arw",
  dng: "image/x-adobe-dng",
  orf: "image/x-olympus-orf",
  rw2: "image/x-panasonic-rw2",
};

function resolveContentType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return MIME_MAP[ext] || "application/octet-stream";
}

export async function uploadArtworkImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const key = `portfolio/images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const contentType = resolveContentType(file);

  try {
    const blob = await put(key, file, {
      access: "public",
      contentType,
    });
    return blob.url;
  } catch (err) {
    wrapError(
      `image-upload: name="${file.name}" type="${file.type}" resolved="${contentType}" size=${file.size}`,
      err
    );
  }
}

export async function deleteArtworkImage(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl);
  } catch {
    // Image may already be deleted
  }
}

// --- Site settings (artist statement, etc.) ---

const SETTINGS_KEY = "portfolio/settings.json";

export interface SiteSettings {
  statementTitle: string;
  statementBody: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  statementTitle: "About My Work",
  statementBody: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { blobs } = await list({ prefix: SETTINGS_KEY });
    if (blobs.length === 0) return DEFAULT_SETTINGS;

    const url = `${blobs[0].url}?t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...await res.json() };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await put(SETTINGS_KEY, JSON.stringify(settings, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    wrapError("settings-save", err);
  }
}

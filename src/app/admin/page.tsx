"use client";

import { useState, useEffect, useRef } from "react";
import type { StoredArtwork } from "@/lib/portfolio-data";
import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  const [artworks, setArtworks] = useState<StoredArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    year: new Date().getFullYear().toString(),
    description: "",
  });

  useEffect(() => {
    fetchArtworks();
  }, []);

  async function fetchArtworks() {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) setArtworks(await res.json());
    } catch {
      setMessage({ type: "error", text: "Failed to load portfolio data." });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "error", text: "Please select an image file." });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("year", form.year);
    formData.append("description", form.description);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage({ type: "success", text: `"${form.title}" uploaded successfully!` });
      setForm({ title: "", category: "", year: new Date().getFullYear().toString(), description: "" });
      if (fileRef.current) fileRef.current.value = "";
      await fetchArtworks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setArtworks(await res.json());
        setMessage({ type: "success", text: `"${title}" deleted.` });
      }
    } catch {
      setMessage({ type: "error", text: "Delete failed." });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-warm-900">Portfolio Admin</h1>
          <p className="mt-1 text-sm text-warm-500">Upload and manage your artwork</p>
        </div>
        <Link
          href="/"
          className="text-sm tracking-widest uppercase text-warm-500 hover:text-warm-900 transition-colors"
        >
          &larr; View Site
        </Link>
      </div>

      {message && (
        <div
          className={`mb-8 rounded-sm px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upload form */}
      <form onSubmit={handleUpload} className="mb-16 rounded-sm border border-warm-200 bg-white p-8">
        <h2 className="mb-6 font-serif text-xl text-warm-900">Upload New Artwork</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">
              Image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required
              className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-700 file:mr-3 file:rounded-full file:border-0 file:bg-warm-100 file:px-4 file:py-1 file:text-xs file:text-warm-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">
              Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Morning Stillness"
              className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-900 placeholder:text-warm-300 focus:border-warm-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">
              Category
            </label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Landscape, Macro, Portrait"
              className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-900 placeholder:text-warm-300 focus:border-warm-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">
              Year
            </label>
            <input
              type="text"
              required
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-900 focus:border-warm-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">
              Description
            </label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the piece"
              className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-900 placeholder:text-warm-300 focus:border-warm-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="mt-6 rounded-sm bg-warm-900 px-8 py-3 text-sm tracking-widest uppercase text-warm-50 transition-colors hover:bg-warm-800 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Artwork"}
        </button>
      </form>

      {/* Existing artwork list */}
      <h2 className="mb-6 font-serif text-xl text-warm-900">
        Uploaded Artwork ({artworks.length})
      </h2>

      {loading ? (
        <p className="text-sm text-warm-500">Loading...</p>
      ) : artworks.length === 0 ? (
        <p className="text-sm text-warm-500">No uploaded artwork yet. Use the form above to add your first piece.</p>
      ) : (
        <div className="space-y-4">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="flex items-center gap-5 rounded-sm border border-warm-200 bg-white p-4"
            >
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-sm bg-warm-100">
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-base text-warm-900">{artwork.title}</h3>
                <p className="text-xs text-warm-500">
                  {artwork.category} &middot; {artwork.year}
                </p>
                <p className="mt-1 text-xs text-warm-400">{artwork.description}</p>
              </div>
              <button
                onClick={() => handleDelete(artwork.id, artwork.title)}
                className="flex-shrink-0 text-xs tracking-widest uppercase text-warm-400 transition-colors hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

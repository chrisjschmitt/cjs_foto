"use client";

import { useState, useEffect, useRef } from "react";
import type { StoredArtwork } from "@/lib/portfolio-data";
import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  const [artworks, setArtworks] = useState<StoredArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addingImages, setAddingImages] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", year: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
      if (res.ok) {
        setArtworks(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: data.error || `Failed to load portfolio (HTTP ${res.status}).` });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text: `Failed to load portfolio: ${msg}` });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSeries(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.category || !form.year || !form.description) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    const fileList = fileRef.current?.files;
    if (!fileList || fileList.length === 0) {
      setMessage({ type: "error", text: "Please select at least one image." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i]);
      }
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("year", form.year);
      formData.append("description", form.description);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage({ type: "success", text: `"${form.title}" created with ${fileList.length} image${fileList.length > 1 ? "s" : ""}.` });
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

  async function handleAddImages(seriesId: string) {
    const input = addFileRefs.current[seriesId];
    const fileList = input?.files;
    if (!fileList || fileList.length === 0) {
      setMessage({ type: "error", text: "Please select at least one image to add." });
      return;
    }

    setAddingImages(true);
    setMessage(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i]);
      }
      formData.append("seriesId", seriesId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage({ type: "success", text: `Added ${fileList.length} image${fileList.length > 1 ? "s" : ""}.` });
      setAddingTo(null);
      if (input) input.value = "";
      await fetchArtworks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add images";
      setMessage({ type: "error", text: msg });
    } finally {
      setAddingImages(false);
    }
  }

  async function handleDeleteImage(seriesId: string, imageUrl: string) {
    const series = artworks.find((a) => a.id === seriesId);
    if (series && series.images.length <= 1) {
      if (!confirm(`This is the last image. Deleting it will remove the entire series "${series.title}". Continue?`)) return;
      return handleDeleteSeries(seriesId, series.title);
    }
    if (!confirm("Delete this image?")) return;

    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: seriesId, imageUrl }),
      });
      if (res.ok) {
        setArtworks(await res.json());
        setMessage({ type: "success", text: "Image removed." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete image." });
    }
  }

  async function handleDeleteSeries(id: string, title: string) {
    if (!confirm(`Delete the entire "${title}" series and all its images? This cannot be undone.`)) return;

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

  function startEditing(artwork: StoredArtwork) {
    setEditingId(artwork.id);
    setEditForm({
      title: artwork.title,
      category: artwork.category,
      year: artwork.year,
      description: artwork.description,
    });
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        setArtworks(await res.json());
        setEditingId(null);
        setMessage({ type: "success", text: `"${editForm.title}" updated.` });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  }

  async function moveImage(seriesId: string, index: number, direction: -1 | 1) {
    const series = artworks.find((a) => a.id === seriesId);
    if (!series) return;
    const target = index + direction;
    if (target < 0 || target >= series.images.length) return;

    const imgs = [...series.images];
    const [moved] = imgs.splice(index, 1);
    imgs.splice(target, 0, moved);

    setArtworks((prev) =>
      prev.map((a) => (a.id === seriesId ? { ...a, images: imgs } : a))
    );

    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: seriesId, images: imgs }),
      });
      if (res.ok) setArtworks(await res.json());
    } catch {
      setMessage({ type: "error", text: "Failed to save new order." });
      await fetchArtworks();
    }
  }

  const inputClass =
    "w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-900 placeholder:text-warm-300 focus:border-warm-400 focus:outline-none";
  const btnSmall =
    "flex h-7 w-7 items-center justify-center rounded-sm text-sm transition-colors";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-warm-900">Portfolio Admin</h1>
          <p className="mt-1 text-sm text-warm-500">Create and manage portfolio series</p>
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

      {/* Create new series */}
      <form onSubmit={handleCreateSeries} noValidate className="mb-16 rounded-sm border border-warm-200 bg-white p-6 sm:p-8">
        <h2 className="mb-6 font-serif text-xl text-warm-900">Create New Series</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">
              Images
            </label>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-700 file:mr-3 file:rounded-full file:border-0 file:bg-warm-100 file:px-4 file:py-1 file:text-xs file:text-warm-700"
            />
            <p className="mt-1 text-xs text-warm-400">Select one or more images. The first image will be the cover.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Copper Veins" className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Category</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Macro, Landscape, Portrait" className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Year</label>
            <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the series" className={inputClass} />
          </div>
        </div>

        <button type="submit" disabled={uploading} className="mt-6 rounded-sm bg-warm-900 px-8 py-3 text-sm tracking-widest uppercase text-warm-50 transition-colors hover:bg-warm-800 disabled:opacity-50">
          {uploading ? "Creating..." : "Create Series"}
        </button>
      </form>

      {/* Series list */}
      <h2 className="mb-6 font-serif text-xl text-warm-900">
        Portfolio Series ({artworks.length})
      </h2>

      {loading ? (
        <p className="text-sm text-warm-500">Loading...</p>
      ) : artworks.length === 0 ? (
        <p className="text-sm text-warm-500">No series yet. Create your first one above.</p>
      ) : (
        <div className="space-y-6">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="rounded-sm border border-warm-200 bg-white p-5 sm:p-6">
              {editingId === artwork.id ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Title</label>
                      <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Category</label>
                      <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Year</label>
                      <input type="text" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Description</label>
                      <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveEdit(artwork.id)} disabled={saving} className="rounded-sm bg-warm-900 px-5 py-2 text-xs tracking-widest uppercase text-warm-50 hover:bg-warm-800 disabled:opacity-50">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEditing} className="rounded-sm border border-warm-200 px-5 py-2 text-xs tracking-widest uppercase text-warm-500 hover:border-warm-400">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg text-warm-900">{artwork.title}</h3>
                      <p className="text-xs text-warm-500">
                        {artwork.category} &middot; {artwork.year} &middot; {artwork.images.length} image{artwork.images.length !== 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-xs text-warm-400">{artwork.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      <button onClick={() => setAddingTo(addingTo === artwork.id ? null : artwork.id)} className="text-xs tracking-widest uppercase text-warm-500 active:text-warm-900">
                        {addingTo === artwork.id ? "Close" : "+ Add"}
                      </button>
                      <button onClick={() => startEditing(artwork)} className="text-xs tracking-widest uppercase text-warm-500 active:text-warm-900">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteSeries(artwork.id, artwork.title)} className="text-xs tracking-widest uppercase text-warm-500 active:text-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add images form */}
              {addingTo === artwork.id && (
                <div className="mb-4 rounded-sm border border-warm-100 bg-warm-50 p-3">
                  <input
                    ref={(el) => { addFileRefs.current[artwork.id] = el; }}
                    type="file"
                    multiple
                    className="mb-3 w-full text-sm text-warm-700 file:mr-3 file:rounded-full file:border-0 file:bg-warm-200 file:px-4 file:py-2 file:text-xs file:text-warm-700"
                  />
                  <button
                    onClick={() => handleAddImages(artwork.id)}
                    disabled={addingImages}
                    className="rounded-sm bg-warm-900 px-5 py-2 text-xs tracking-widest uppercase text-warm-50 hover:bg-warm-800 disabled:opacity-50"
                  >
                    {addingImages ? "Uploading..." : "Upload"}
                  </button>
                </div>
              )}

              {/* Image grid with always-visible controls */}
              <p className="mb-2 text-[10px] tracking-widest uppercase text-warm-400">
                Use arrows to reorder &middot; first image is the cover
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {artwork.images.map((img, idx) => (
                  <div key={img} className="relative overflow-hidden rounded-sm border border-warm-100 bg-warm-100">
                    <div className="relative aspect-square">
                      <Image src={img} alt={`${artwork.title} ${idx + 1}`} fill sizes="150px" className="object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded-sm bg-warm-900/80 px-2 py-0.5 text-[10px] tracking-wider uppercase text-warm-50">
                          Cover
                        </span>
                      )}
                    </div>
                    {/* Always-visible controls bar */}
                    <div className="flex items-center justify-between border-t border-warm-100 bg-white px-1.5 py-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveImage(artwork.id, idx, -1)}
                          disabled={idx === 0}
                          className={`${btnSmall} ${idx === 0 ? "text-warm-200" : "bg-warm-100 text-warm-600 active:bg-warm-200"}`}
                          aria-label="Move left"
                        >
                          &larr;
                        </button>
                        <button
                          onClick={() => moveImage(artwork.id, idx, 1)}
                          disabled={idx === artwork.images.length - 1}
                          className={`${btnSmall} ${idx === artwork.images.length - 1 ? "text-warm-200" : "bg-warm-100 text-warm-600 active:bg-warm-200"}`}
                          aria-label="Move right"
                        >
                          &rarr;
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteImage(artwork.id, img)}
                        className={`${btnSmall} bg-red-50 text-red-500 active:bg-red-100`}
                        aria-label="Delete image"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

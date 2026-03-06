"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { StoredArtwork, ImageMeta, SiteSettings } from "@/lib/portfolio-data";
import { normalizeImage, imageUrl } from "@/lib/portfolio-data";
import { marked } from "marked";
import Image from "next/image";
import Link from "next/link";

interface PendingImage {
  file: File;
  name: string;
  year: string;
  description: string;
  preview: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [artworks, setArtworks] = useState<StoredArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addingImages, setAddingImages] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingImage[]>([]);
  const [addPendingFiles, setAddPendingFiles] = useState<PendingImage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", year: "", description: "" });
  const [editingImageKey, setEditingImageKey] = useState<string | null>(null);
  const [editImageForm, setEditImageForm] = useState({ name: "", year: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [deletingSeries, setDeletingSeries] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; type: "success" | "error"; text: string }[]>([]);
  const [statementTitle, setStatementTitle] = useState("About My Work");
  const [statementBody, setStatementBody] = useState("");
  const [statementPreview, setStatementPreview] = useState(false);
  const [savingStatement, setSavingStatement] = useState(false);
  const [editingStatement, setEditingStatement] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const toastId = useRef(0);

  const [form, setForm] = useState({
    title: "",
    category: "",
    year: new Date().getFullYear().toString(),
    description: "",
  });

  const toast = useCallback((type: "success" | "error", text: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) setToken(saved);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchArtworks();
      fetchStatement();
    }
  }, [token]);

  function authHeaders(): HeadersInit {
    return token ? { "x-admin-token": token } : {};
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Login failed."); return; }
      sessionStorage.setItem("admin_token", data.token);
      setToken(data.token);
      setPassword("");
    } catch {
      setAuthError("Login failed.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setArtworks([]);
  }

  async function fetchArtworks() {
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store", headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) setArtworks(await res.json());
      else toast("error", "Failed to load portfolio.");
    } catch { toast("error", "Failed to load portfolio."); }
    finally { setLoading(false); }
  }

  async function fetchStatement() {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data: SiteSettings = await res.json();
        setStatementTitle(data.statementTitle || "About My Work");
        setStatementBody(data.statementBody || "");
      }
    } catch { /* use defaults */ }
  }

  async function handleSaveStatement() {
    setSavingStatement(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ statementTitle, statementBody }),
      });
      if (res.ok) {
        toast("success", "Artist statement saved.");
        setEditingStatement(false);
      } else {
        toast("error", "Failed to save statement.");
      }
    } catch {
      toast("error", "Failed to save statement.");
    } finally {
      setSavingStatement(false);
    }
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>, target: "create" | "add") {
    const files = e.target.files;
    if (!files) return;
    const items: PendingImage[] = Array.from(files).map((f) => ({
      file: f,
      name: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      year: form.year || new Date().getFullYear().toString(),
      description: "",
      preview: URL.createObjectURL(f),
    }));
    if (target === "create") setPendingFiles(items);
    else setAddPendingFiles(items);
  }

  function updatePending(idx: number, field: string, value: string, target: "create" | "add") {
    const setter = target === "create" ? setPendingFiles : setAddPendingFiles;
    setter((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  function removePending(idx: number, target: "create" | "add") {
    const setter = target === "create" ? setPendingFiles : setAddPendingFiles;
    setter((prev) => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
  }

  async function uploadPendingFiles(items: PendingImage[]): Promise<ImageMeta[]> {
    const results: ImageMeta[] = [];
    for (let i = 0; i < items.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${items.length}...`);
      const fd = new FormData();
      fd.append("file", items[i].file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd, headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to upload file ${i + 1}`);
      results.push({ url: data.url, name: items[i].name, year: items[i].year, description: items[i].description || undefined });
    }
    setUploadProgress("");
    return results;
  }

  async function handleCreateSeries(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.category || !form.year || !form.description) { toast("error", "Please fill in all fields."); return; }
    if (pendingFiles.length === 0) { toast("error", "Please select at least one image."); return; }
    for (const p of pendingFiles) { if (!p.name || !p.year) { toast("error", "Each image needs a name and year."); return; } }

    setUploading(true);
    try {
      const imageMetas = await uploadPendingFiles(pendingFiles);
      setUploadProgress("Saving series...");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("year", form.year);
      formData.append("description", form.description);
      formData.append("imageUrls", JSON.stringify(imageMetas));

      const res = await fetch("/api/upload", { method: "POST", body: formData, headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save series");

      setArtworks((prev) => [data, ...prev]);
      toast("success", `"${form.title}" created.`);
      setForm({ title: "", category: "", year: new Date().getFullYear().toString(), description: "" });
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setPendingFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) { toast("error", err instanceof Error ? err.message : "Upload failed"); }
    finally { setUploading(false); setUploadProgress(""); }
  }

  async function handleAddImages(seriesId: string) {
    if (addPendingFiles.length === 0) { toast("error", "Please select at least one image."); return; }
    for (const p of addPendingFiles) { if (!p.name || !p.year) { toast("error", "Each image needs a name and year."); return; } }

    setAddingImages(true);
    const currentSeries = artworks.find((a) => a.id === seriesId);
    try {
      const newMetas = await uploadPendingFiles(addPendingFiles);
      setUploadProgress("Saving...");

      const allImages = currentSeries ? [...currentSeries.images, ...newMetas] : newMetas;
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ id: seriesId, images: allImages }),
      });
      if (!res.ok) throw new Error("Failed to save");

      setArtworks((prev) => prev.map((a) => a.id === seriesId ? { ...a, images: allImages } : a));
      toast("success", `Added ${addPendingFiles.length} image${addPendingFiles.length > 1 ? "s" : ""}.`);
      addPendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setAddPendingFiles([]);
      setAddingTo(null);
      if (addFileRef.current) addFileRef.current.value = "";
    } catch (err) { toast("error", err instanceof Error ? err.message : "Failed to add images"); }
    finally { setAddingImages(false); setUploadProgress(""); }
  }

  async function handleDeleteImage(seriesId: string, imgUrl: string) {
    const series = artworks.find((a) => a.id === seriesId);
    if (series && series.images.length <= 1) {
      if (!confirm(`This is the last image. Deleting it will remove the entire series "${series.title}". Continue?`)) return;
      return handleDeleteSeries(seriesId, series.title);
    }
    if (!confirm("Delete this image?")) return;

    setDeletingImage(imgUrl);
    const remaining = series!.images.filter((img) => imageUrl(img) !== imgUrl);
    setArtworks((prev) => prev.map((a) => a.id === seriesId ? { ...a, images: remaining } : a));
    try {
      const res = await fetch("/api/portfolio", { method: "DELETE", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ id: seriesId, imageUrl: imgUrl, remainingImages: remaining }) });
      if (!res.ok) { toast("error", "Failed to delete image."); await fetchArtworks(); }
      else toast("success", "Image deleted.");
    } catch { toast("error", "Failed to delete image."); await fetchArtworks(); }
    finally { setDeletingImage(null); }
  }

  async function handleDeleteSeries(id: string, title: string) {
    if (!confirm(`Delete "${title}" and all its images?`)) return;
    setDeletingSeries(id);
    setArtworks((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await fetch("/api/portfolio", { method: "DELETE", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ id }) });
      if (!res.ok) { toast("error", "Delete failed."); await fetchArtworks(); }
      else toast("success", `"${title}" deleted.`);
    } catch { toast("error", "Delete failed."); await fetchArtworks(); }
    finally { setDeletingSeries(null); }
  }

  function startEditingImage(seriesId: string, idx: number) {
    const series = artworks.find((a) => a.id === seriesId);
    if (!series) return;
    const meta = normalizeImage(series.images[idx]);
    const key = `${seriesId}:${idx}`;
    setEditingImageKey(key);
    setEditImageForm({ name: meta.name, year: meta.year, description: meta.description || "" });
  }

  async function handleSaveImageEdit(seriesId: string, idx: number) {
    if (!editImageForm.name || !editImageForm.year) { toast("error", "Name and year are required."); return; }
    setSaving(true);
    const series = artworks.find((a) => a.id === seriesId);
    if (!series) return;

    const updatedImages = series.images.map((img, i) => {
      if (i !== idx) return img;
      const meta = normalizeImage(img);
      return { ...meta, name: editImageForm.name, year: editImageForm.year, description: editImageForm.description || undefined } as ImageMeta;
    });

    setArtworks((prev) => prev.map((a) => a.id === seriesId ? { ...a, images: updatedImages } : a));
    setEditingImageKey(null);

    try {
      const res = await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ id: seriesId, images: updatedImages }) });
      if (res.ok) toast("success", "Image details saved.");
      else toast("error", "Failed to save.");
    } catch { toast("error", "Failed to save."); }
    finally { setSaving(false); }
  }

  function startEditing(artwork: StoredArtwork) {
    setEditingId(artwork.id);
    setEditForm({ title: artwork.title, category: artwork.category, year: artwork.year, description: artwork.description });
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ id, ...editForm }) });
      if (res.ok) { setArtworks((prev) => prev.map((a) => a.id === id ? { ...a, ...editForm } : a)); setEditingId(null); toast("success", `"${editForm.title}" saved.`); }
    } catch { toast("error", "Failed to save."); }
    finally { setSaving(false); }
  }

  async function moveImage(seriesId: string, index: number, direction: -1 | 1) {
    const series = artworks.find((a) => a.id === seriesId);
    if (!series) return;
    const target = index + direction;
    if (target < 0 || target >= series.images.length) return;
    const imgs = [...series.images];
    const [moved] = imgs.splice(index, 1);
    imgs.splice(target, 0, moved);
    setArtworks((prev) => prev.map((a) => a.id === seriesId ? { ...a, images: imgs } : a));
    try {
      await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ id: seriesId, images: imgs }) });
      toast("success", "Order saved.");
    } catch { toast("error", "Failed to save order."); await fetchArtworks(); }
  }

  const ic = "w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-900 placeholder:text-warm-300 focus:border-warm-400 focus:outline-none";
  const btn7 = "flex h-7 w-7 items-center justify-center rounded-sm text-sm transition-colors";

  function renderPendingList(items: PendingImage[], target: "create" | "add") {
    if (items.length === 0) return null;
    return (
      <div className="mt-4 space-y-3">
        <p className="text-[10px] tracking-widest uppercase text-warm-400">{items.length} image{items.length > 1 ? "s" : ""} selected — fill in details for each</p>
        {items.map((p, i) => (
          <div key={i} className="flex gap-3 rounded-sm border border-warm-100 bg-warm-50 p-3">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-warm-200">
              <Image src={p.preview} alt={p.name} fill sizes="80px" className="object-cover" unoptimized />
            </div>
            <div className="flex-grow space-y-2">
              <div className="grid gap-2 sm:grid-cols-3">
                <input type="text" value={p.name} onChange={(e) => updatePending(i, "name", e.target.value, target)} placeholder="Image name *" className={ic} />
                <input type="text" value={p.year} onChange={(e) => updatePending(i, "year", e.target.value, target)} placeholder="Year *" className={ic} />
                <input type="text" value={p.description} onChange={(e) => updatePending(i, "description", e.target.value, target)} placeholder="Description (optional)" className={ic} />
              </div>
            </div>
            <button onClick={() => removePending(i, target)} className="flex-shrink-0 self-start text-red-400 active:text-red-600 text-lg leading-none">&times;</button>
          </div>
        ))}
      </div>
    );
  }

  if (authLoading) return null;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-50 px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-sm border border-warm-200 bg-white p-8">
          <h1 className="mb-2 font-serif text-2xl text-warm-900">Admin Login</h1>
          <p className="mb-6 text-sm text-warm-500">Enter the admin password to continue.</p>
          {authError && <p className="mb-4 rounded-sm bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">{authError}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className={`${ic} mb-4`}
          />
          <button type="submit" className="w-full rounded-sm bg-warm-900 py-3 text-sm tracking-widest uppercase text-warm-50 hover:bg-warm-800">
            Log In
          </button>
          <Link href="/" className="mt-4 block text-center text-xs tracking-widest uppercase text-warm-400 active:text-warm-900">&larr; Back to Site</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-warm-900">Portfolio Admin</h1>
          <p className="mt-1 text-sm text-warm-500">Create and manage portfolio series</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm tracking-widest uppercase text-warm-500 active:text-warm-900">&larr; View Site</Link>
          <button onClick={handleLogout} className="text-sm tracking-widest uppercase text-warm-400 active:text-red-600">Logout</button>
        </div>
      </div>

      {/* Artist Statement */}
      <div className="mb-16 rounded-sm border border-warm-200 bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-warm-900">Artist Statement</h2>
          {!editingStatement && (
            <button onClick={() => setEditingStatement(true)} className="text-xs tracking-widest uppercase text-warm-500 active:text-warm-900">Edit</button>
          )}
        </div>
        {editingStatement ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Title</label>
              <input type="text" value={statementTitle} onChange={(e) => setStatementTitle(e.target.value)} className={ic} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs tracking-widest uppercase text-warm-500">Body (Markdown)</label>
                <button onClick={() => setStatementPreview(!statementPreview)} className="text-[10px] tracking-widest uppercase text-warm-400 active:text-warm-900">
                  {statementPreview ? "Edit" : "Preview"}
                </button>
              </div>
              {statementPreview ? (
                <div className="prose-warm min-h-[12rem] rounded-sm border border-warm-200 bg-warm-50 p-4 text-sm leading-relaxed text-warm-700" dangerouslySetInnerHTML={{ __html: marked.parse(statementBody) as string }} />
              ) : (
                <textarea
                  value={statementBody}
                  onChange={(e) => setStatementBody(e.target.value)}
                  rows={10}
                  placeholder="Write your artist statement here. Supports **bold**, *italic*, [links](url), lists, and more."
                  className={`${ic} resize-y font-mono text-sm`}
                />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveStatement} disabled={savingStatement} className="rounded-sm bg-warm-900 px-5 py-2 text-xs tracking-widest uppercase text-warm-50 hover:bg-warm-800 disabled:opacity-50">
                {savingStatement ? "Saving..." : "Save Statement"}
              </button>
              <button onClick={() => { setEditingStatement(false); fetchStatement(); }} className="rounded-sm border border-warm-200 px-5 py-2 text-xs tracking-widest uppercase text-warm-500">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose-warm text-sm leading-relaxed text-warm-700" dangerouslySetInnerHTML={{ __html: statementBody ? marked.parse(statementBody) as string : "<p class='text-warm-400 italic'>No statement yet. Click Edit to add one.</p>" }} />
        )}
      </div>

      {/* Create new series */}
      <form onSubmit={handleCreateSeries} noValidate className="mb-16 rounded-sm border border-warm-200 bg-white p-6 sm:p-8">
        <h2 className="mb-6 font-serif text-xl text-warm-900">Create New Series</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Images</label>
            <input ref={fileRef} type="file" multiple onChange={(e) => handleFilesSelected(e, "create")} className="w-full rounded-sm border border-warm-200 px-3 py-2 text-sm text-warm-700 file:mr-3 file:rounded-full file:border-0 file:bg-warm-100 file:px-4 file:py-1 file:text-xs file:text-warm-700" />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Series Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Copper Veins" className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Category</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Macro, Landscape" className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Year</label>
            <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest uppercase text-warm-500">Series Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" className={ic} />
          </div>
        </div>
        {renderPendingList(pendingFiles, "create")}
        <button type="submit" disabled={uploading} className="mt-6 rounded-sm bg-warm-900 px-8 py-3 text-sm tracking-widest uppercase text-warm-50 hover:bg-warm-800 disabled:opacity-50">
          {uploading ? (uploadProgress || "Creating...") : "Create Series"}
        </button>
      </form>

      {/* Series list */}
      <h2 className="mb-6 font-serif text-xl text-warm-900">Portfolio Series ({artworks.length})</h2>

      {loading ? <p className="text-sm text-warm-500">Loading...</p> : artworks.length === 0 ? <p className="text-sm text-warm-500">No series yet.</p> : (
        <div className="space-y-6">
          {artworks.map((artwork) => (
            <div key={artwork.id} className={`rounded-sm border border-warm-200 bg-white p-5 sm:p-6 transition-opacity ${deletingSeries === artwork.id ? "opacity-50 pointer-events-none" : ""}`}>
              {editingId === artwork.id ? (
                <div className="space-y-4 mb-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div><label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Title</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={ic} /></div>
                    <div><label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Category</label><input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={ic} /></div>
                    <div><label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Year</label><input type="text" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className={ic} /></div>
                    <div><label className="mb-1 block text-[10px] tracking-widest uppercase text-warm-400">Description</label><input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={ic} /></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveEdit(artwork.id)} disabled={saving} className="rounded-sm bg-warm-900 px-5 py-2 text-xs tracking-widest uppercase text-warm-50 hover:bg-warm-800 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                    <button onClick={() => setEditingId(null)} className="rounded-sm border border-warm-200 px-5 py-2 text-xs tracking-widest uppercase text-warm-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-warm-900">{artwork.title}</h3>
                    <p className="text-xs text-warm-500">{artwork.category} &middot; {artwork.year} &middot; {artwork.images.length} image{artwork.images.length !== 1 ? "s" : ""}</p>
                    <p className="mt-1 text-xs text-warm-400">{artwork.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <button onClick={() => { setAddingTo(addingTo === artwork.id ? null : artwork.id); setAddPendingFiles([]); }} className="text-xs tracking-widest uppercase text-warm-500 active:text-warm-900">{addingTo === artwork.id ? "Close" : "+ Add"}</button>
                    <button onClick={() => startEditing(artwork)} className="text-xs tracking-widest uppercase text-warm-500 active:text-warm-900">Edit</button>
                    <button onClick={() => handleDeleteSeries(artwork.id, artwork.title)} disabled={deletingSeries === artwork.id} className="text-xs tracking-widest uppercase text-warm-500 active:text-red-600 disabled:opacity-50">{deletingSeries === artwork.id ? "Deleting..." : "Delete"}</button>
                  </div>
                </div>
              )}

              {/* Add images */}
              {addingTo === artwork.id && (
                <div className="mb-4 rounded-sm border border-warm-100 bg-warm-50 p-3">
                  <input ref={addFileRef} type="file" multiple onChange={(e) => handleFilesSelected(e, "add")} className="w-full text-sm text-warm-700 file:mr-3 file:rounded-full file:border-0 file:bg-warm-200 file:px-4 file:py-2 file:text-xs file:text-warm-700" />
                  {renderPendingList(addPendingFiles, "add")}
                  {addPendingFiles.length > 0 && (
                    <button onClick={() => handleAddImages(artwork.id)} disabled={addingImages} className="mt-3 rounded-sm bg-warm-900 px-5 py-2 text-xs tracking-widest uppercase text-warm-50 hover:bg-warm-800 disabled:opacity-50">
                      {addingImages ? (uploadProgress || "Uploading...") : "Upload"}
                    </button>
                  )}
                </div>
              )}

              {/* Image grid */}
              <p className="mb-2 text-[10px] tracking-widest uppercase text-warm-400">Use arrows to reorder &middot; first image is the cover</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {artwork.images.map((img, idx) => {
                  const meta = normalizeImage(img);
                  const url = imageUrl(img);
                  const key = `${artwork.id}:${idx}`;
                  const isEditing = editingImageKey === key;

                  return (
                    <div key={url} className={`overflow-hidden rounded-sm border border-warm-100 bg-white transition-opacity ${deletingImage === url ? "opacity-40 pointer-events-none" : ""}`}>
                      <div className="flex gap-3 p-3">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-warm-100">
                          <Image src={url} alt={meta.name || artwork.title} fill sizes="80px" className="object-cover" />
                          {idx === 0 && <span className="absolute top-0.5 left-0.5 rounded-sm bg-warm-900/80 px-1.5 py-0.5 text-[8px] tracking-wider uppercase text-warm-50">Cover</span>}
                        </div>
                        {isEditing ? (
                          <div className="flex-grow space-y-1.5">
                            <input type="text" value={editImageForm.name} onChange={(e) => setEditImageForm({ ...editImageForm, name: e.target.value })} placeholder="Name *" className={ic} />
                            <input type="text" value={editImageForm.year} onChange={(e) => setEditImageForm({ ...editImageForm, year: e.target.value })} placeholder="Year *" className={ic} />
                            <input type="text" value={editImageForm.description} onChange={(e) => setEditImageForm({ ...editImageForm, description: e.target.value })} placeholder="Description (optional)" className={ic} />
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleSaveImageEdit(artwork.id, idx)} disabled={saving} className="rounded-sm bg-warm-900 px-3 py-1 text-[10px] tracking-widest uppercase text-warm-50 disabled:opacity-50">{saving ? "..." : "Save"}</button>
                              <button onClick={() => setEditingImageKey(null)} className="rounded-sm border border-warm-200 px-3 py-1 text-[10px] tracking-widest uppercase text-warm-500">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-warm-900 truncate">{meta.name || <span className="italic text-warm-300">Untitled</span>}</p>
                            <p className="text-[11px] text-warm-500">{meta.year || "—"}</p>
                            {meta.description && <p className="mt-0.5 text-[11px] text-warm-400 line-clamp-2">{meta.description}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-warm-100 bg-warm-50 px-2 py-1">
                        <div className="flex gap-1">
                          <button onClick={() => moveImage(artwork.id, idx, -1)} disabled={idx === 0} className={`${btn7} ${idx === 0 ? "text-warm-200" : "bg-warm-100 text-warm-600 active:bg-warm-200"}`}>&larr;</button>
                          <button onClick={() => moveImage(artwork.id, idx, 1)} disabled={idx === artwork.images.length - 1} className={`${btn7} ${idx === artwork.images.length - 1 ? "text-warm-200" : "bg-warm-100 text-warm-600 active:bg-warm-200"}`}>&rarr;</button>
                        </div>
                        <div className="flex gap-2">
                          {!isEditing && <button onClick={() => startEditingImage(artwork.id, idx)} className="text-[10px] tracking-widest uppercase text-warm-400 active:text-warm-900">Edit</button>}
                          <button onClick={() => handleDeleteImage(artwork.id, url)} disabled={deletingImage === url} className="text-[10px] tracking-widest uppercase text-red-400 active:text-red-600 disabled:opacity-50">{deletingImage === url ? "..." : "Delete"}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`animate-[fadeInUp_0.3s_ease-out] rounded-lg px-5 py-3 text-sm font-medium shadow-lg ${t.type === "success" ? "bg-warm-900 text-warm-50" : "bg-red-600 text-white"}`}>
            {t.type === "success" ? "\u2713 " : "\u2717 "}{t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

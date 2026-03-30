"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type GalleryPhoto } from "@/lib/supabase";

const MAX_PHOTOS = 6;

type PendingPhoto = {
  file: File;
  preview: string;
  caption: string;
};

export default function GalleryTab() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    setPhotos((data as GalleryPhoto[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const totalCount = photos.length + pending.length;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const slots = MAX_PHOTOS - totalCount;
    if (slots <= 0) return;
    const toAdd = files.slice(0, slots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));
    setPending((p) => [...p, ...toAdd]);
  }

  function removePending(index: number) {
    setPending((p) => {
      URL.revokeObjectURL(p[index].preview);
      return p.filter((_, i) => i !== index);
    });
  }

  async function handleDelete(photo: GalleryPhoto) {
    await supabase.storage.from("gallery").remove([photo.file_path]);
    await supabase.from("gallery").delete().eq("id", photo.id);
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
  }

  async function handleSave() {
    if (pending.length === 0) return;
    setSaving(true);

    for (const item of pending) {
      const filePath = `${Date.now()}_${item.file.name.replace(/\s/g, "_")}`;
      const { error } = await supabase.storage.from("gallery").upload(filePath, item.file, { upsert: false });
      if (error) { alert("Upload failed: " + error.message); continue; }
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(filePath);
      await supabase.from("gallery").insert({ image_url: urlData.publicUrl, file_path: filePath, caption: item.caption || null });
      URL.revokeObjectURL(item.preview);
    }

    setPending([]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetchPhotos();
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-lg">Gallery Photos</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${totalCount >= MAX_PHOTOS ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
            {totalCount} / {MAX_PHOTOS} photos
          </span>
        </div>

        {totalCount < MAX_PHOTOS && (
          <label className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileSelect} />
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose Photos
          </label>
        )}
        {totalCount >= MAX_PHOTOS && (
          <p className="text-slate-500 text-sm">Maximum {MAX_PHOTOS} photos reached. Delete one to add more.</p>
        )}
      </div>

      {/* Pending previews */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6">
          <h4 className="font-semibold text-slate-700 mb-4">New Photos — not saved yet</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {pending.map((item, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden border border-slate-200">
                <img src={item.preview} alt="preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-2">
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => setPending((p) => p.map((x, idx) => idx === i ? { ...x, caption: e.target.value } : x))}
                    placeholder="Caption (optional)"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Saved photos */}
      {photos.length === 0 && pending.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No photos uploaded yet.
        </div>
      ) : photos.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="font-semibold text-slate-700 mb-4">Saved Photos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-slate-200">
                <img src={photo.image_url} alt={photo.caption || "Gallery"} className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {photo.caption && (
                  <div className="p-2 text-xs text-slate-500 truncate">{photo.caption}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

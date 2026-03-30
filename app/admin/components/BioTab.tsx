"use client";

import { useState, useEffect } from "react";
import { supabase, type Bio } from "@/lib/supabase";

const defaultBio: Bio = {
  id: 1, name: "", title: "", qualification: "", experience: "",
  specialization: "", about: "", photo_url: null, photo_path: null,
  show_title: true, show_qualification: true, show_experience: true,
  show_specialization: true, show_about: true,
};

export default function BioTab() {
  const [bio, setBio] = useState<Bio>(defaultBio);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("bio").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setBio(data as Bio);
      setLoading(false);
    });
  }, []);

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    const filePath = `bio/profile_${Date.now()}`;

    if (bio.photo_path) {
      await supabase.storage.from("gallery").remove([bio.photo_path]);
    }

    const { error } = await supabase.storage.from("gallery").upload(filePath, file, { upsert: true });
    if (error) { alert("Upload failed: " + error.message); setUploadingPhoto(false); return; }

    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(filePath);
    const updated = { ...bio, photo_url: urlData.publicUrl, photo_path: filePath };
    setBio(updated);
    await supabase.from("bio").update({ photo_url: urlData.publicUrl, photo_path: filePath }).eq("id", 1);
    setUploadingPhoto(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("bio").update({
      name: bio.name, title: bio.title, qualification: bio.qualification,
      experience: bio.experience, specialization: bio.specialization, about: bio.about,
      show_title: bio.show_title, show_qualification: bio.show_qualification,
      show_experience: bio.show_experience, show_specialization: bio.show_specialization,
      show_about: bio.show_about,
    }).eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function Toggle({ field, label }: { field: keyof Bio; label: string }) {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => setBio((p) => ({ ...p, [field]: !p[field] }))}
          className={`w-10 h-5 rounded-full transition-colors relative ${bio[field] ? "bg-blue-500" : "bg-slate-200"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${bio[field] ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </label>
    );
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Photo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            {bio.photo_url ? (
              <img src={bio.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <label className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors ${uploadingPhoto ? "bg-slate-100 text-slate-400" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
              <input type="file" accept="image/*" className="sr-only" disabled={uploadingPhoto}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ""; }} />
              {uploadingPhoto ? "Uploading..." : bio.photo_url ? "Change Photo" : "Upload Photo"}
            </label>
            <p className="text-xs text-slate-400 mt-2">Recommended: square photo, at least 300×300px</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-4">Bio Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input type="text" value={bio.name} onChange={(e) => setBio((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Dr. Lohith Kumar"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {[
            { key: "title" as keyof Bio, label: "Title / Role", toggle: "show_title" as keyof Bio, placeholder: "e.g. Chief Pathologist, Lab Director" },
            { key: "qualification" as keyof Bio, label: "Qualification", toggle: "show_qualification" as keyof Bio, placeholder: "e.g. B.Sc MLT, DMLT, M.Sc Biochemistry" },
            { key: "experience" as keyof Bio, label: "Experience", toggle: "show_experience" as keyof Bio, placeholder: "e.g. 10+ Years in Clinical Pathology" },
            { key: "specialization" as keyof Bio, label: "Specialization", toggle: "show_specialization" as keyof Bio, placeholder: "e.g. Haematology, Biochemistry" },
          ].map(({ key, label, toggle, placeholder }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">{label}</label>
                <Toggle field={toggle} label="Show on website" />
              </div>
              <input type="text" value={bio[key] as string} onChange={(e) => setBio((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">About / Bio</label>
              <Toggle field="show_about" label="Show on website" />
            </div>
            <textarea rows={4} value={bio.about} onChange={(e) => setBio((p) => ({ ...p, about: e.target.value }))}
              placeholder="A short paragraph about the doctor/owner and the lab..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

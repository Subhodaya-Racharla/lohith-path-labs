"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Test } from "@/lib/supabase";

const CATEGORIES = ["Blood", "Thyroid", "ECG", "Allergy", "Other"];

const emptyForm = { name: "", description: "", price: "", category: "Blood" };

export default function TestsTab() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTests = useCallback(async () => {
    const { data } = await supabase.from("tests").select("*").order("category").order("name");
    setTests((data as Test[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  function startEdit(test: Test) {
    setEditingId(test.id);
    setForm({
      name: test.name,
      description: test.description || "",
      price: test.price?.toString() || "",
      category: test.category || "Blood",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      category: form.category,
    };

    if (editingId) {
      await supabase.from("tests").update(payload).eq("id", editingId);
    } else {
      await supabase.from("tests").insert(payload);
    }

    setSaving(false);
    cancelForm();
    fetchTests();
  }

  async function toggleActive(test: Test) {
    await supabase.from("tests").update({ is_active: !test.is_active }).eq("id", test.id);
    fetchTests();
  }

  async function deleteTest(id: string) {
    if (!confirm("Delete this test? It will be removed from the booking form.")) return;
    await supabase.from("tests").delete().eq("id", id);
    fetchTests();
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading tests...</div>;
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tests.filter((t) => t.category === cat);
    return acc;
  }, {} as Record<string, Test[]>);

  return (
    <div>
      {/* Add / Edit Form */}
      {showForm ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h3 className="font-bold text-slate-900 text-lg mb-4">
            {editingId ? "Edit Test" : "Add New Test"}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Test Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Complete Blood Count"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="e.g. 250"
                  min="0"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Test" : "Add Test"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Test
        </button>
      )}

      {/* Tests grouped by category */}
      {CATEGORIES.map((cat) => {
        const catTests = grouped[cat];
        if (!catTests || catTests.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              {cat}
            </h3>
            <div className="space-y-2">
              {catTests.map((test) => (
                <div
                  key={test.id}
                  className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 ${
                    test.is_active ? "border-slate-200" : "border-slate-100 opacity-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">{test.name}</span>
                      {!test.is_active && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    {test.description && (
                      <p className="text-slate-400 text-sm truncate">{test.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {test.price !== null && (
                      <span className="font-bold text-slate-900 text-sm">₹{test.price}</span>
                    )}
                    <button
                      onClick={() => startEdit(test)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleActive(test)}
                      className={`transition-colors p-1 ${test.is_active ? "text-green-500 hover:text-slate-400" : "text-slate-300 hover:text-green-500"}`}
                      title={test.is_active ? "Hide from booking" : "Show in booking"}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {test.is_active ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

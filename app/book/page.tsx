"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, type Test } from "@/lib/supabase";

function BookForm() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("testId") ?? "";

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patient_name: "",
    phone: "",
    email: "",
    test_id: "",
    test_name: "",
    collection_type: "walkin" as "home" | "walkin",
    preferred_date: "",
    notes: "",
  });

  useEffect(() => {
    supabase
      .from("tests")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .then(({ data }) => {
        const list = (data as Test[]) || [];
        setTests(list);
        if (preselectedId) {
          const match = list.find((t) => t.id === preselectedId);
          if (match) setForm((p) => ({ ...p, test_id: match.id, test_name: match.name }));
        }
        setLoading(false);
      });
  }, [preselectedId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (name === "test_id") {
      const test = tests.find((t) => t.id === value);
      setForm((prev) => ({ ...prev, test_id: value, test_name: test?.name || "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("bookings").insert({
      patient_name: form.patient_name,
      phone: form.phone,
      email: form.email || null,
      test_id: form.test_id || null,
      test_name: form.test_name,
      collection_type: form.collection_type,
      preferred_date: form.preferred_date || null,
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (err) {
      setError("Something went wrong. Please try again or call us directly.");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    const lines = [
      "Hello, I just booked a test online.",
      `Name: ${form.patient_name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : "",
      form.test_name ? `Test: ${form.test_name}` : "",
      `Collection: ${form.collection_type === "home" ? "Home Collection" : "Walk-in"}`,
      form.preferred_date ? `Preferred Date: ${form.preferred_date}` : "",
      form.notes ? `Notes: ${form.notes}` : "",
    ].filter(Boolean).join("\n");
    const waUrl = `https://wa.me/919182147180?text=${encodeURIComponent(lines)}`;

    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-2">
            Thank you, <strong>{form.patient_name}</strong>!
          </p>
          <p className="text-slate-500 mb-6">
            We have received your booking for <strong>{form.test_name}</strong>.
            Our team will contact you on <strong>{form.phone}</strong> shortly to confirm.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Message Us on WhatsApp
            </a>
            <a href="/" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="hero-bg py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Book a Test</h1>
        <p className="text-blue-200 text-lg max-w-md mx-auto">
          Fill in the form below and we will confirm your booking shortly
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="patient_name"
                value={form.patient_name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Test */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Test <span className="text-red-400">*</span>
              </label>
              {loading ? (
                <div className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-400 bg-slate-50">
                  Loading tests...
                </div>
              ) : (
                <select
                  name="test_id"
                  value={form.test_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Choose a test</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                      {test.price ? ` — ₹${test.price}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Collection Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Collection Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "walkin", label: "Walk-in", desc: "Visit our lab", icon: "🏥" },
                  { value: "home", label: "Home Collection", desc: "We come to you", icon: "🏠" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                      form.collection_type === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="collection_type"
                      value={opt.value}
                      checked={form.collection_type === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{opt.label}</div>
                      <div className="text-slate-400 text-xs">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Preferred Date{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                name="preferred_date"
                value={form.preferred_date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Notes{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any special instructions or questions..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Prefer to book by phone?{" "}
          <a href="tel:+919182147180" className="text-blue-600 font-medium hover:underline">
            Call +91 91821 47180
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense>
      <BookForm />
    </Suspense>
  );
}

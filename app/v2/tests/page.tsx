"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, type Test } from "@/lib/supabase";
import { useCart } from "../CartContext";
import V2Navbar from "../components/V2Navbar";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Blood", "Thyroid", "ECG", "Allergy", "Other"];

const TIME_SLOTS = [
  "7:00 AM – 9:00 AM",
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
];

const BRAND_COLOR = "from-blue-600 to-cyan-500";

type Step = "browse" | "checkout" | "confirmed";

const emptyForm = {
  patient_name: "",
  phone: "",
  collection_type: "walkin" as "walkin" | "home",
  address: "",
  preferred_date: "",
  time_slot: "",
  payment_method: "cash" as "cash" | "upi",
};

// ─── Main inner component (needs useSearchParams so wrapped in Suspense) ──────

function TestsInner() {
  const searchParams = useSearchParams();
  const { items, add, remove, has, total, count, clear } = useCart();

  const [tests, setTests]       = useState<Test[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [step, setStep]         = useState<Step>("browse");
  const [form, setForm]         = useState(emptyForm);
  const [errors, setErrors]     = useState<Partial<typeof emptyForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Fetch tests
  useEffect(() => {
    supabase.from("tests").select("*").eq("is_active", true).order("category").order("name")
      .then(({ data }) => { setTests((data as Test[]) || []); setLoading(false); });
  }, []);

  // Auto-add test from URL param
  useEffect(() => {
    const testId = searchParams.get("testId");
    if (testId && tests.length > 0) {
      const match = tests.find(t => t.id === testId);
      if (match) add(match);
    }
  }, [tests, searchParams]);  // eslint-disable-line

  // Filtered tests
  const filtered = tests.filter(t => {
    const matchCat = category === "All" || t.category === category;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  // ── Form helpers ────────────────────────────────────────────────────────────

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: "" }));
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.patient_name.trim()) e.patient_name = "Name is required";
    if (/\d/.test(form.patient_name)) e.patient_name = "Name should not contain numbers";
    if (form.phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a valid 10-digit number";
    if (form.collection_type === "home" && !form.address.trim()) e.address = "Address is required for home collection";
    if (!form.preferred_date) e.preferred_date = "Please select a date";
    if (!form.time_slot) e.time_slot = "Please select a time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleBooking() {
    if (!validate()) return;
    if (items.length === 0) return;
    setSubmitting(true);

    const ref = "LP" + Math.floor(1000 + Math.random() * 9000);
    const cartItems = items.map(i => ({ id: i.test.id, name: i.test.name, price: i.test.price, category: i.test.category }));

    const { error } = await supabase.from("bookings").insert({
      patient_name:    form.patient_name,
      phone:           form.phone.replace(/\D/g, ""),
      email:           null,
      test_id:         items.length === 1 ? items[0].test.id : null,
      test_name:       items.map(i => i.test.name).join(", "),
      collection_type: form.collection_type,
      preferred_date:  form.preferred_date || null,
      notes:           null,
      address:         form.address || null,
      time_slot:       form.time_slot,
      payment_method:  form.payment_method,
      booking_ref:     ref,
      cart_items:      cartItems,
    });

    setSubmitting(false);
    if (error) {
      alert("Something went wrong. Please try again or call us.");
      return;
    }
    setBookingRef(ref);
    clear();
    setForm(emptyForm);
    setStep("confirmed");
  }

  // ── Confirmation screen ──────────────────────────────────────────────────────

  if (step === "confirmed") {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm mb-4">
            Our team will contact you shortly to confirm your appointment.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking ID</span>
              <span className="font-bold text-blue-600 text-base">{bookingRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-800">{form.preferred_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slot</span>
              <span className="font-medium text-slate-800">{form.time_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Collection</span>
              <span className="font-medium text-slate-800">{form.collection_type === "home" ? "Home Collection" : "Walk-in"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment</span>
              <span className="font-medium text-slate-800">{form.payment_method === "cash" ? "Cash on Collection" : "UPI / Online"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <a href="/v2/reports"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Track My Reports
            </a>
            <button onClick={() => setStep("browse")}
              className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
              ← Book More Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout screen ──────────────────────────────────────────────────────────

  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-slate-50">
        <V2Navbar dark />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep("browse")}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
            </div>

            {/* Cart summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Your Tests ({items.length})</h3>
              <div className="space-y-2 mb-3">
                {items.map(i => (
                  <div key={i.test.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${BRAND_COLOR}`} />
                      <span className="text-slate-800 font-medium">{i.test.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{i.test.price ? `₹${i.test.price}` : "—"}</span>
                      <button onClick={() => remove(i.test.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span className="text-blue-600">₹{total}</span>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.patient_name}
                  onChange={e => setField("patient_name", e.target.value.replace(/\d/g, ""))}
                  placeholder="Your full name"
                  className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.patient_name ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`} />
                {errors.patient_name && <p className="text-red-500 text-xs mt-1">{errors.patient_name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-400">*</span></label>
                <input type="tel" value={form.phone} inputMode="numeric" maxLength={10}
                  onChange={e => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.phone ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Collection type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Collection Type <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: "walkin", label: "Walk-in", desc: "Visit our lab", icon: "🏥" }, { value: "home", label: "Home Collection", desc: "We come to you", icon: "🏠" }].map(opt => (
                    <label key={opt.value}
                      className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-colors ${form.collection_type === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="radio" name="collection_type" value={opt.value}
                        checked={form.collection_type === opt.value}
                        onChange={e => setField("collection_type", e.target.value)} className="sr-only" />
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{opt.label}</div>
                        <div className="text-slate-400 text-xs">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address (conditional) */}
              {form.collection_type === "home" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Home Address <span className="text-red-400">*</span></label>
                  <textarea value={form.address} onChange={e => setField("address", e.target.value)} rows={2}
                    placeholder="Full address including area and landmark"
                    className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${errors.address ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Date <span className="text-red-400">*</span></label>
                <input type="date" value={form.preferred_date}
                  onChange={e => setField("preferred_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full border rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${errors.preferred_date ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`} />
                {errors.preferred_date && <p className="text-red-500 text-xs mt-1">{errors.preferred_date}</p>}
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time Slot <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => setField("time_slot", slot)}
                      className={`text-sm font-medium py-2.5 px-3 rounded-xl border-2 transition-colors ${form.time_slot === slot ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.time_slot && <p className="text-red-500 text-xs mt-1">{errors.time_slot}</p>}
              </div>

              {/* Payment */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: "cash", label: "Cash on Collection", icon: "💵" }, { value: "upi", label: "UPI / Online", icon: "📱" }].map(opt => (
                    <label key={opt.value}
                      className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-colors ${form.payment_method === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="radio" name="payment_method" value={opt.value}
                        checked={form.payment_method === opt.value}
                        onChange={e => setField("payment_method", e.target.value)} className="sr-only" />
                      <span className="text-xl">{opt.icon}</span>
                      <span className="font-semibold text-slate-900 text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {form.payment_method === "upi" && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                    📲 You will receive a payment link on WhatsApp after booking confirmation.
                  </div>
                )}
              </div>

              {/* Submit */}
              <button onClick={handleBooking} disabled={submitting || items.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-colors text-base flex items-center justify-center gap-2">
                {submitting ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Booking...</>
                ) : (
                  <>Confirm Booking · ₹{total}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Browse screen ────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <V2Navbar dark />

      {/* Spacer for fixed navbar */}
      <div className="h-16 shrink-0" />

      {/* Search + categories — always visible, never overlaps cards */}
      <div className="shrink-0 bg-white border-b border-slate-100 shadow-sm z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tests (e.g. blood, thyroid, ECG...)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${category === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-32 md:pb-16">
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-6 md:items-start">

          {/* ── Tests grid ── */}
          <div>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-44 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium">No tests found for "{search}"</p>
                <button onClick={() => { setSearch(""); setCategory("All"); }} className="mt-2 text-blue-600 text-sm hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map(test => {
                  const inCart = has(test.id);
                  return (
                    <div key={test.id} className={`bg-white rounded-2xl border-2 transition-all duration-200 p-5 flex flex-col ${inCart ? "border-blue-400 shadow-md shadow-blue-100" : "border-slate-100 hover:border-slate-200"}`}>
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${BRAND_COLOR} text-white`}>
                          {test.category}
                        </span>
                        {test.price !== null && (
                          <span className="text-lg font-bold text-slate-900">₹{test.price}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{test.name}</h3>
                      {test.description && (
                        <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">{test.description}</p>
                      )}
                      <div className="mt-auto">
                        {inCart ? (
                          <button onClick={() => remove(test.id)}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors hover:bg-red-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Added — Tap to Remove
                          </button>
                        ) : (
                          <button onClick={() => add(test)}
                            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${BRAND_COLOR} text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Cart sidebar (desktop only) ── */}
          <div className="hidden md:block sticky top-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Your Cart</h3>
                <span className="text-xs text-slate-500">{count} test{count !== 1 ? "s" : ""}</span>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-8 text-center text-slate-400 text-sm">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  No tests added yet
                </div>
              ) : (
                <>
                  <div className="px-5 py-3 space-y-3 max-h-72 overflow-y-auto">
                    {items.map(i => (
                      <div key={i.test.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 shrink-0 rounded-full bg-gradient-to-r ${BRAND_COLOR}`} />
                          <span className="text-sm text-slate-800 font-medium truncate">{i.test.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-sm text-slate-600">{i.test.price ? `₹${i.test.price}` : "—"}</span>
                          <button onClick={() => remove(i.test.id)} className="text-slate-300 hover:text-red-400 transition-colors p-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="font-bold text-blue-600 text-lg">₹{total}</span>
                  </div>
                  <div className="px-5 pb-5">
                    <button onClick={() => setStep("checkout")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                      Proceed to Checkout →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
      </div>{/* end scrollable area */}

      {/* ── Mobile sticky bottom bar ── */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${count > 0 ? "translate-y-0" : "translate-y-full"}`}>
        {/* Cart sheet (expanded) */}
        {mobileCartOpen && count > 0 && (
          <div className="bg-white border-t border-slate-200 shadow-2xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900">Your Cart ({count})</h4>
              <button onClick={() => setMobileCartOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {items.map(i => (
                <div key={i.test.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 shrink-0 rounded-full bg-gradient-to-r ${BRAND_COLOR}`} />
                    <span className="text-slate-800 font-medium truncate">{i.test.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-slate-600">{i.test.price ? `₹${i.test.price}` : "—"}</span>
                    <button onClick={() => remove(i.test.id)} className="text-slate-300 hover:text-red-400 p-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold mb-3">
              <span className="text-slate-500">Total</span>
              <span className="text-blue-600 text-base">₹{total}</span>
            </div>
            <button onClick={() => { setMobileCartOpen(false); setStep("checkout"); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
              Proceed to Checkout →
            </button>
          </div>
        )}

        {/* Bottom bar */}
        {!mobileCartOpen && (
          <div className="bg-white border-t border-slate-200 shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
            <button onClick={() => setMobileCartOpen(true)} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{count}</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs text-slate-500">{count} test{count !== 1 ? "s" : ""} selected</div>
                <div className="font-bold text-slate-900">₹{total}</div>
              </div>
              <svg className="w-4 h-4 text-slate-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button onClick={() => setStep("checkout")}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Proceed →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestsPage() {
  return (
    <Suspense>
      <TestsInner />
    </Suspense>
  );
}

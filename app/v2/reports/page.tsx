"use client";

import { useState } from "react";
import { supabase, type Booking, type Report } from "@/lib/supabase";
import V2Navbar from "../components/V2Navbar";

type SearchStep = "search" | "results";
type BookingWithReport = Booking & { report: Report | null };

const STATUS_STYLES: Record<string, string> = {
  pending:          "bg-yellow-50 text-yellow-700 border-yellow-200",
  sample_collected: "bg-orange-50 text-orange-700 border-orange-200",
  report_sent:      "bg-blue-50 text-blue-700 border-blue-200",
  completed:        "bg-green-50 text-green-700 border-green-200",
  cancelled:        "bg-red-50 text-red-700 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  pending:          "Pending",
  sample_collected: "Sample Collected",
  report_sent:      "Report Ready",
  completed:        "Completed",
  cancelled:        "Cancelled",
};

export default function ReportsPage() {
  const [step, setStep]             = useState<SearchStep>("search");
  const [searchMode, setSearchMode] = useState<"phone" | "ref">("ref");
  const [phone, setPhone]           = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [bookings, setBookings]     = useState<BookingWithReport[]>([]);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // ── Search by Booking ID ──────────────────────────────────────────────────────
  async function handleSearchByRef() {
    const ref = bookingRef.trim().toUpperCase();
    if (!ref) { setError("Enter a Booking ID"); return; }
    setError(""); setLoading(true);

    const { data, error: dbError } = await supabase
      .from("bookings").select("*").eq("booking_ref", ref).limit(1);

    if (dbError || !data || data.length === 0) {
      setLoading(false);
      setError("No booking found with this ID. Please check and try again.");
      return;
    }

    const booking = data[0] as Booking;
    const { data: reportsData } = await supabase.from("reports").select("*").eq("booking_id", booking.id);

    const reportsMap: Record<string, Report> = {};
    (reportsData || []).forEach((r: Report) => { reportsMap[r.booking_id] = r; });

    setBookings([{ ...booking, report: reportsMap[booking.id] ?? null }]);
    setLoading(false);
    setStep("results");
  }

  // ── Search by Phone ───────────────────────────────────────────────────────────
  async function handleSearchByPhone() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setError("Enter a valid 10-digit mobile number"); return; }
    if (!/^[6-9]/.test(digits)) { setError("Must start with 6, 7, 8, or 9"); return; }
    setError(""); setLoading(true);

    const { data: bookingsData, error: dbError } = await supabase
      .from("bookings").select("*").eq("phone", digits).order("created_at", { ascending: false });

    if (dbError) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
      return;
    }
    if (!bookingsData || bookingsData.length === 0) {
      setLoading(false);
      setError("No bookings found for this number. Please check the number used during booking.");
      return;
    }

    const ids = bookingsData.map((b: Booking) => b.id);
    const { data: reportsData } = await supabase.from("reports").select("*").in("booking_id", ids);

    const reportsMap: Record<string, Report> = {};
    (reportsData || []).forEach((r: Report) => { reportsMap[r.booking_id] = r; });

    setBookings(bookingsData.map((b: Booking) => ({ ...b, report: reportsMap[b.id] ?? null })));
    setLoading(false);
    setStep("results");
  }

  // ── Cancel booking ────────────────────────────────────────────────────────────
  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(bookingId);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    setCancelling(null);
  }

  const spinner = (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <V2Navbar dark />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">My Reports</h1>
            <p className="text-slate-500 text-sm">Track your bookings and download reports.</p>
          </div>

          {/* ── Search form ── */}
          {step === "search" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {/* Tabs */}
              <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-5">
                <button onClick={() => { setSearchMode("ref"); setError(""); }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${searchMode === "ref" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                  Booking ID
                </button>
                <button onClick={() => { setSearchMode("phone"); setError(""); }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${searchMode === "phone" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                  Mobile Number
                </button>
              </div>

              {searchMode === "ref" ? (
                <>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Booking ID</label>
                  <p className="text-xs text-slate-400 mb-2">Found on your booking receipt (e.g. LP1234)</p>
                  <input type="text" value={bookingRef}
                    onChange={e => { setBookingRef(e.target.value.toUpperCase()); setError(""); }}
                    placeholder="e.g. LP1234"
                    onKeyDown={e => e.key === "Enter" && handleSearchByRef()}
                    className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent font-mono tracking-widest text-lg ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`} />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                  <button onClick={handleSearchByRef} disabled={loading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? <>{spinner} Searching...</> : "Find My Booking"}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 flex gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">OTP Verification Coming Soon</p>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        Mobile number search requires OTP verification via SMS to protect your privacy. This feature will be available shortly.
                      </p>
                      <p className="text-xs text-amber-600 mt-2 font-medium">
                        👉 Meanwhile, use your <strong>Booking ID</strong> (e.g. LP1234) from your receipt to track reports instantly.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSearchMode("ref")}
                    className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors text-sm">
                    Use Booking ID instead →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Results ── */}
          {step === "results" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">
                  {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
                </h2>
                <button onClick={() => { setStep("search"); setPhone(""); setBookingRef(""); setBookings([]); setError(""); }}
                  className="text-sm text-blue-600 hover:underline">← Search again</button>
              </div>

              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {b.booking_ref && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-mono">{b.booking_ref}</span>
                          )}
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[b.status]}`}>
                            {STATUS_LABELS[b.status]}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 mt-1">{b.test_name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                          {b.preferred_date && <span>📅 {new Date(b.preferred_date).toLocaleDateString("en-IN")}</span>}
                          {b.time_slot && <span>🕐 {b.time_slot}</span>}
                          <span>{b.collection_type === "home" ? "🏠 Home" : "🏥 Walk-in"}</span>
                          {b.payment_method && <span>💳 {b.payment_method === "cash" ? "Cash" : "UPI"}</span>}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Booked {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {b.status === "pending" && (
                      <div className="space-y-2">
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700">
                          ⏳ Your report is being prepared. We will notify you once it is ready.
                        </div>
                        <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                          className="text-xs text-red-400 hover:text-red-600 hover:underline disabled:opacity-50 transition-colors">
                          {cancelling === b.id ? "Cancelling..." : "Cancel this booking"}
                        </button>
                      </div>
                    )}
                    {b.status === "cancelled" && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                        ❌ This booking has been cancelled.
                      </div>
                    )}
                    {b.status === "sample_collected" && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-700">
                        🔬 Sample collected. Your report is being processed.
                      </div>
                    )}
                    {b.report && b.status !== "pending" && (
                      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-green-700">
                          <div className="font-semibold">✅ Report Ready</div>
                          <div className="text-xs mt-0.5 text-green-600">
                            Expires {new Date(b.report.expires_at).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                        <a href={b.report.file_url} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <a href="/tests" className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                  + Book More Tests
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

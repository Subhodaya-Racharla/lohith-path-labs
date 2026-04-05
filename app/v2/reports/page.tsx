"use client";

import { useState } from "react";
import { supabase, type Booking, type Report } from "@/lib/supabase";
import V2Navbar from "../components/V2Navbar";

type ReportStep = "phone" | "otp" | "results";
type BookingWithReport = Booking & { report: Report | null };

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  report_sent: "bg-blue-50 text-blue-700 border-blue-200",
  completed:   "bg-green-50 text-green-700 border-green-200",
};
const STATUS_LABELS: Record<string, string> = {
  pending:     "Pending",
  report_sent: "Report Ready",
  completed:   "Completed",
};

export default function ReportsPage() {
  const [step, setStep]               = useState<ReportStep>("phone");
  const [phone, setPhone]             = useState("");
  const [otp, setOtp]                 = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [bookings, setBookings]       = useState<BookingWithReport[]>([]);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────────
  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setError("Enter a valid 10-digit phone number"); return; }
    setError("");
    setLoading(true);

    const { data } = await supabase.from("bookings").select("id").eq("phone", digits).limit(1);
    setLoading(false);

    if (!data || data.length === 0) {
      setError("No bookings found for this number. Please check and try again.");
      return;
    }

    // Generate 6-digit OTP (mock — replace with SMS in production)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);

    // TODO: Send SMS via Twilio / MSG91 / Fast2SMS
    // Example: await fetch("/api/send-otp", { method: "POST", body: JSON.stringify({ phone: digits, otp: code }) })
    // For now, OTP is shown below for testing
    console.log(`[DEV] OTP for ${digits}: ${code}`);

    setStep("otp");
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    if (otp.trim() !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    setError("");
    setLoading(true);

    const digits = phone.replace(/\D/g, "");

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .eq("phone", digits)
      .order("created_at", { ascending: false });

    if (!bookingsData || bookingsData.length === 0) {
      setLoading(false);
      setError("Could not load your bookings.");
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

  // ── UI ───────────────────────────────────────────────────────────────────────

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
            <p className="text-slate-500 text-sm">Enter your registered mobile number to view your bookings and download reports.</p>
          </div>

          {/* ── Phone step ── */}
          {step === "phone" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel" value={phone} inputMode="numeric" maxLength={10}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                placeholder="10-digit number used during booking"
                className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`}
                onKeyDown={e => e.key === "Enter" && handleSendOtp()}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <button onClick={handleSendOtp} disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Checking...</>
                ) : "Send OTP"}
              </button>
            </div>
          )}

          {/* ── OTP step ── */}
          {step === "otp" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">OTP sent to +91 {phone}</div>
                  <div className="text-slate-400 text-xs">Valid for 10 minutes</div>
                </div>
              </div>

              {/* Dev helper */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <strong>Note:</strong> SMS integration pending. Your OTP is: <strong className="text-lg tracking-widest font-mono">{generatedOtp}</strong>
              </div>

              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Enter OTP</label>
              <input
                type="text" value={otp} inputMode="numeric" maxLength={6}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                placeholder="6-digit OTP"
                className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-center text-xl tracking-widest font-mono ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"}`}
                onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Verifying...</>
                ) : "Verify & View Reports"}
              </button>
              <button onClick={handleSendOtp} disabled={loading}
                className="w-full mt-2 text-blue-600 text-sm hover:underline disabled:opacity-50">
                Resend OTP
              </button>
            </div>
          )}

          {/* ── Results step ── */}
          {step === "results" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Bookings for +91 {phone}</h2>
                <button onClick={() => { setStep("phone"); setPhone(""); setOtp(""); setBookings([]); }}
                  className="text-sm text-blue-600 hover:underline">Change number</button>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <p>No bookings found.</p>
                  <a href="/v2/tests" className="mt-2 inline-block text-blue-600 text-sm hover:underline">Book a test →</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {b.booking_ref && (
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">{b.booking_ref}</span>
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

                      {/* Report section */}
                      {b.status === "pending" && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700">
                          ⏳ Your report is being prepared. We'll notify you once it's ready.
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
              )}

              <div className="mt-6 text-center">
                <a href="/v2/tests" className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
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

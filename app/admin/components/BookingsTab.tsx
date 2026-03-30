"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Booking, type Report } from "@/lib/supabase";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  report_sent: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  report_sent: "Report Sent",
  completed: "Completed",
};

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<Record<string, Report>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "report_sent" | "completed">("all");

  const fetchData = useCallback(async () => {
    // Clean up expired reports first
    const now = new Date().toISOString();
    const { data: expiredReports } = await supabase
      .from("reports")
      .select("*")
      .lt("expires_at", now);

    if (expiredReports && expiredReports.length > 0) {
      for (const r of expiredReports) {
        await supabase.storage.from("reports").remove([r.file_path]);
        await supabase.from("reports").delete().eq("id", r.id);
        await supabase.from("bookings").update({ status: "pending" }).eq("id", r.booking_id);
      }
    }

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    setBookings((bookingsData as Booking[]) || []);

    // Fetch reports indexed by booking_id
    const { data: reportsData } = await supabase.from("reports").select("*");
    const reportsMap: Record<string, Report> = {};
    (reportsData || []).forEach((r: Report) => {
      reportsMap[r.booking_id] = r;
    });
    setReports(reportsMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpload(booking: Booking, file: File) {
    setUploading(booking.id);

    const filePath = `${booking.id}.pdf`;

    // Remove old report if exists
    const existing = reports[booking.id];
    if (existing) {
      await supabase.storage.from("reports").remove([existing.file_path]);
      await supabase.from("reports").delete().eq("booking_id", booking.id);
    }

    // Upload new file
    const { error: uploadErr } = await supabase.storage
      .from("reports")
      .upload(filePath, file, { upsert: true, contentType: "application/pdf" });

    if (uploadErr) {
      alert("Upload failed: " + uploadErr.message);
      setUploading(null);
      return;
    }

    // Create signed URL valid for 3 days
    const { data: signedData } = await supabase.storage
      .from("reports")
      .createSignedUrl(filePath, 3 * 24 * 60 * 60);

    if (!signedData?.signedUrl) {
      alert("Failed to generate download link.");
      setUploading(null);
      return;
    }

    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // Save to reports table
    await supabase.from("reports").insert({
      booking_id: booking.id,
      file_path: filePath,
      file_url: signedData.signedUrl,
      expires_at: expiresAt,
    });

    // Update booking status
    await supabase.from("bookings").update({ status: "report_sent" }).eq("id", booking.id);

    setUploading(null);
    fetchData();
  }

  async function markCompleted(bookingId: string) {
    await supabase.from("bookings").update({ status: "completed" }).eq("id", bookingId);
    fetchData();
  }

  async function deleteBooking(bookingId: string) {
    if (!confirm("Delete this booking?")) return;
    const existing = reports[bookingId];
    if (existing) {
      await supabase.storage.from("reports").remove([existing.file_path]);
      await supabase.from("reports").delete().eq("booking_id", bookingId);
    }
    await supabase.from("bookings").delete().eq("id", bookingId);
    fetchData();
  }

  function buildWhatsAppLink(booking: Booking, report: Report) {
    const message = encodeURIComponent(
      `Hello ${booking.patient_name}, your *${booking.test_name}* report from *Lohith Path Labs* is ready!\n\n📄 Download here: ${report.file_url}\n\n⚠️ This link is valid for 3 days.\n\nFor queries call: +91 91821 47180`
    );
    const phone = booking.phone.replace(/\D/g, "");
    return `https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${message}`;
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        Loading bookings...
      </div>
    );
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", count: bookings.length, color: "text-slate-900" },
          { label: "Pending", count: bookings.filter((b) => b.status === "pending").length, color: "text-yellow-600" },
          { label: "Completed", count: bookings.filter((b) => b.status === "completed").length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "pending", "report_sent", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No bookings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const report = reports[booking.id];
            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  {/* Patient Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{booking.patient_name}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_STYLES[booking.status]}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                      <span>📱 {booking.phone}</span>
                      {booking.email && <span>✉️ {booking.email}</span>}
                      <span>🧪 {booking.test_name}</span>
                      <span>{booking.collection_type === "home" ? "🏠 Home" : "🏥 Walk-in"}</span>
                      {booking.preferred_date && (
                        <span>📅 {new Date(booking.preferred_date).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-slate-400 mt-1">📝 {booking.notes}</p>
                    )}
                    <p className="text-xs text-slate-300 mt-1">
                      Booked: {new Date(booking.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors p-1"
                    title="Delete booking"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  {/* Upload Report */}
                  <label className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors ${
                    uploading === booking.id
                      ? "bg-slate-100 text-slate-400"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  }`}>
                    <input
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      disabled={uploading === booking.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(booking, file);
                        e.target.value = "";
                      }}
                    />
                    {uploading === booking.id ? (
                      "Uploading..."
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {report ? "Re-upload Report" : "Upload Report"}
                      </>
                    )}
                  </label>

                  {/* WhatsApp Send */}
                  {report && (
                    <a
                      href={buildWhatsAppLink(booking, report)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Send Report
                    </a>
                  )}

                  {/* Mark Complete */}
                  {booking.status === "report_sent" && (
                    <button
                      onClick={() => markCompleted(booking.id)}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

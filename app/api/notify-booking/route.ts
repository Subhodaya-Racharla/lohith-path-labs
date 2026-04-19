import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const phone  = process.env.LAB_WHATSAPP_NUMBER; // e.g. 919182147180 (with country code, no +)
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    // WhatsApp not configured — booking still succeeds, just no notification
    return NextResponse.json({ skipped: true });
  }

  const {
    bookingRef, patientName, phone: patientPhone,
    tests, date, slot, collectionType, address, paymentMethod, amount,
  } = await req.json();

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : date;

  const lines = [
    `🔬 *New Booking — Lohith Path Labs*`,
    ``,
    `📋 *Booking ID:* ${bookingRef}`,
    `👤 *Patient:* ${patientName}`,
    `📞 *Phone:* +91 ${patientPhone}`,
    `🧪 *Tests:* ${tests}`,
    `💰 *Amount:* ₹${amount}`,
    ``,
    `📅 *Date:* ${formattedDate}`,
    `⏰ *Slot:* ${slot}`,
    `🚗 *Collection:* ${collectionType === "home" ? "Home Collection" : "Walk-in at Lab"}`,
    address ? `📍 *Address:* ${address}` : null,
    `💳 *Payment:* ${paymentMethod === "cash" ? "Cash on Collection" : "UPI / Online"}`,
    ``,
    `_Please confirm & coordinate with the patient._`,
  ].filter(l => l !== null).join("\n");

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(lines)}&apikey=${apiKey}`;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      console.error("CallMeBot error:", await res.text());
      return NextResponse.json({ error: "WhatsApp send failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WhatsApp notification error:", err);
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}

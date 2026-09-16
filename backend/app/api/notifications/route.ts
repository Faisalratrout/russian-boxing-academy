import { NextResponse } from "next/server";

// TODO: GET — list in-app notification logs (expiring/expired subscriptions)
export async function GET() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

// TODO: this is also where the daily subscription-expiry check will live
// (Vercel Cron-compatible route) — flags subscriptions within the
// configured expiry alert window (default 3 days) as EXPIRING_SOON,
// and past endDate as EXPIRED, logging a NotificationLog per flag.

import { NextResponse } from "next/server";

// TODO: GET — list subscriptions (support filtering by status/member)
export async function GET() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

// TODO: POST — create a subscription (memberId, planType) and auto-log the
// matching INCOME/SUBSCRIPTION transaction
export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

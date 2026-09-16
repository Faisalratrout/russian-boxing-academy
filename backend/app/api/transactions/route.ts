import { NextResponse } from "next/server";

// TODO: GET — list transactions (support filtering by type/category/date range)
export async function GET() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

// TODO: POST — manually log an EXPENSE transaction (EQUIPMENT, REPAIR, GLOVES, WRAPS, OTHER)
export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

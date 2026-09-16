import { NextResponse } from "next/server";

// TODO: GET — list members (support filtering by status, search by name)
export async function GET() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

// TODO: POST — create a member (firstName, lastName, birthDate, locationId)
export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

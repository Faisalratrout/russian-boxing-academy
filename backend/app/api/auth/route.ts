import { NextResponse } from "next/server";

// TODO: POST — authenticate a User (ADMIN/COACH) by name + passwordHash,
// issue a session (mechanism TBD — no online payment/3rd-party auth needed,
// this is internal staff login only)
export async function POST() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

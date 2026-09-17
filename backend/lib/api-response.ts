import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json({ error: message }, { status, headers });
}

/** Logs the full error server-side; never leaks details to the client. */
export function serverError(error: unknown, headers?: HeadersInit): NextResponse {
  console.error(error);
  return jsonError("Internal server error", 500, headers);
}

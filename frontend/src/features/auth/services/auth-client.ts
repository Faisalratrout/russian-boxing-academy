import { apiFetch } from "@/lib/api-client";
import type { AuthUser } from "../types";

export function login(name: string, password: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth", { method: "POST", body: { name, password } });
}

export async function logout(): Promise<void> {
  await apiFetch<{ message: string }>("/api/auth/logout", { method: "POST", body: {} });
}

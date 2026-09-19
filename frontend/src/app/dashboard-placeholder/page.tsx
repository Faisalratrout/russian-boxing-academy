// TEMPORARY: scaffolding to prove the auth loop end-to-end. Not the real dashboard; delete when that ships.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, isApiError } from "@/lib/api-client";
import { logout } from "@/features/auth/services/auth-client";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; memberCount: number };

export default function DashboardPlaceholderPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [loggingOut, setLoggingOut] = useState(false);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ members: unknown[] }>("/api/members")
      .then(({ members }) => {
        if (!cancelled) setState({ kind: "ok", memberCount: members.length });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (isApiError(e) && e.status === 401) {
          router.replace("/login");
          return;
        }
        setState({ kind: "error", message: isApiError(e) ? e.message : "Something went wrong" });
      });
    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  function retry() {
    setState({ kind: "loading" });
    setAttempt((n) => n + 1);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      if (!(isApiError(e) && e.status === 401)) {
        setLoggingOut(false);
        setState({ kind: "error", message: isApiError(e) ? e.message : "Something went wrong" });
        return;
      }
    }
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <section className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold text-neutral-900">Temporary auth check</h1>
        {state.kind === "loading" && <p role="status">Loading…</p>}
        {state.kind === "error" && (
          <div className="space-y-2">
            <p role="alert" className="text-red-700">
              {state.message}
            </p>
            <button
              type="button"
              onClick={retry}
              className="rounded-md border border-neutral-400 px-3 py-1 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              Retry
            </button>
          </div>
        )}
        {state.kind === "ok" && (
          <p role="status" className="text-neutral-900">
            Logged in. Backend returned {state.memberCount} member(s).
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-60"
        >
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </section>
    </main>
  );
}

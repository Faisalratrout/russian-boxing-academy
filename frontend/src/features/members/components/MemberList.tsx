"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isApiError } from "@/lib/api-client";
import { listMembers } from "../services/members-client";
import type { Member, MemberStatus } from "../types";

const inputClass =
  "rounded-md border border-neutral-400 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600";

const SEARCH_DEBOUNCE_MS = 300;

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; members: Member[] };

interface MemberListProps {
  refreshKey: number;
}

export function MemberList({ refreshKey }: MemberListProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "">("");
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    listMembers({ status: status || undefined, search: search || undefined })
      .then((members) => {
        if (!cancelled) setState({ kind: "ok", members });
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
  }, [router, status, search, refreshKey, attempt]);

  function retry() {
    setState({ kind: "loading" });
    setAttempt((n) => n + 1);
  }

  const filtered = search !== "" || status !== "";

  return (
    <section className="w-full space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-neutral-900">Members</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="member-search" className="sr-only">
            Search by name
          </label>
          <input
            id="member-search"
            type="search"
            placeholder="Search by name"
            value={searchInput}
            onChange={(e) => {
              setState({ kind: "loading" });
              setSearchInput(e.target.value);
            }}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label htmlFor="member-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="member-status"
            value={status}
            onChange={(e) => {
              setState({ kind: "loading" });
              setStatus(e.target.value as MemberStatus | "");
            }}
            className={`${inputClass} w-full`}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

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
      {state.kind === "ok" && state.members.length === 0 && (
        <p className="text-neutral-700">
          {filtered ? "No members match your filters." : "No members registered yet."}
        </p>
      )}
      {state.kind === "ok" && state.members.length > 0 && (
        <ul className="divide-y divide-neutral-200">
          {state.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2">
              <div>
                <p className="font-medium text-neutral-900">
                  {m.firstName} {m.lastName}
                </p>
                <p className="text-sm text-neutral-700">
                  Born <time dateTime={m.birthDate}>{new Date(m.birthDate).toLocaleDateString()}</time>
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.status === "ACTIVE" ? "bg-green-100 text-green-900" : "bg-neutral-200 text-neutral-800"
                }`}
              >
                {m.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

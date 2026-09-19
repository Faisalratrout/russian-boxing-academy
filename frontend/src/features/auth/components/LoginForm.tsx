"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { isApiError } from "@/lib/api-client";
import { login } from "../services/auth-client";

const inputClass =
  "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600";

export function LoginForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(name, password);
      router.replace("/dashboard-placeholder");
    } catch (e) {
      setError(isApiError(e) ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-neutral-900">Sign in</h1>
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-neutral-800">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="username"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-neutral-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div role="alert" className="min-h-5 text-sm text-red-700">
        {error}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { isApiError } from "@/lib/api-client";
import { createMember } from "../services/members-client";

const inputClass =
  "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600";

const locationId = process.env.NEXT_PUBLIC_DEFAULT_LOCATION_ID;

function today(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

interface MemberFormProps {
  onCreated: () => void;
}

export function MemberForm({ onCreated }: MemberFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!locationId) {
      setError("NEXT_PUBLIC_DEFAULT_LOCATION_ID is not configured");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const member = await createMember(
        { firstName: firstName.trim(), lastName: lastName.trim(), birthDate, locationId },
        crypto.randomUUID()
      );
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setSuccess(`Registered ${member.firstName} ${member.lastName}`);
      onCreated();
    } catch (e) {
      if (isApiError(e) && e.status === 401) {
        router.replace("/login");
        return;
      }
      setError(isApiError(e) ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-neutral-900">Register member</h2>
      <div className="space-y-1">
        <label htmlFor="firstName" className="block text-sm font-medium text-neutral-800">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="off"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="lastName" className="block text-sm font-medium text-neutral-800">
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="off"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="birthDate" className="block text-sm font-medium text-neutral-800">
          Birth date
        </label>
        <input
          id="birthDate"
          name="birthDate"
          type="date"
          required
          max={today()}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div role="alert" className="min-h-5 text-sm text-red-700">
        {error}
      </div>
      <div role="status" className="min-h-5 text-sm text-green-800">
        {success}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-60"
      >
        {submitting ? "Registering…" : "Register member"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { MemberForm } from "@/features/members/components/MemberForm";
import { MemberList } from "@/features/members/components/MemberList";

export default function MembersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-neutral-100 p-4">
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-start">
        <MemberForm onCreated={() => setRefreshKey((n) => n + 1)} />
        <MemberList refreshKey={refreshKey} />
      </div>
    </main>
  );
}

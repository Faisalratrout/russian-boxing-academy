import { apiFetch } from "@/lib/api-client";
import type { CreateMemberInput, ListMembersParams, Member } from "../types";

export async function listMembers({ status, search }: ListMembersParams = {}): Promise<Member[]> {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search) query.set("search", search);
  const qs = query.toString();
  const { members } = await apiFetch<{ members: Member[] }>(`/api/members${qs ? `?${qs}` : ""}`);
  return members;
}

export async function createMember(input: CreateMemberInput, idempotencyKey: string): Promise<Member> {
  const { member } = await apiFetch<{ member: Member }>("/api/members", {
    method: "POST",
    body: input,
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return member;
}

export type MemberStatus = "ACTIVE" | "INACTIVE";

export interface Member {
  id: string;
  locationId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string | null;
  joinDate: string;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListMembersParams {
  status?: MemberStatus;
  search?: string;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  locationId: string;
}

import { corsPreflightHandler, withGetHandler, withPostHandler } from "@/lib/api-handler";
import { createMemberSchema, listMembersQuerySchema } from "@/lib/validation/members";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const GET = withGetHandler(
  { schema: listMembersQuerySchema },
  async (_request, { status, search }) => {
    const where: Prisma.MemberWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { status: 200, body: { members } };
  }
);

export const POST = withPostHandler(
  { schema: createMemberSchema, idempotent: true },
  async (_request, { firstName, lastName, birthDate, locationId }) => {
    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        locationId,
      },
    });

    return { status: 201, body: { member } };
  }
);

export const OPTIONS = corsPreflightHandler();

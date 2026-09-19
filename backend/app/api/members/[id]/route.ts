import { corsPreflightHandler, withPatchHandler } from "@/lib/api-handler";
import { updateMemberSchema } from "@/lib/validation/members";
import { prisma } from "@/lib/prisma";

export const PATCH = withPatchHandler(
  { schema: updateMemberSchema },
  async (_request, data, params) => {
    const existing = await prisma.member.findUnique({ where: { id: params.id } });
    if (!existing) {
      return { status: 404, body: { error: "Member not found" } };
    }

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        ...(data.status && { status: data.status }),
      },
    });

    return { status: 200, body: { member } };
  }
);

export const OPTIONS = corsPreflightHandler();

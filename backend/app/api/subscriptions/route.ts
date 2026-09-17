import { corsPreflightHandler, withGetHandler, withPostHandler } from "@/lib/api-handler";
import {
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
} from "@/lib/validation/subscriptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  createSubscriptionWithTransaction,
  MemberInactiveError,
  MemberNotFoundError,
  SubscriptionAlreadyActiveError,
} from "@/lib/subscriptions";

export const GET = withGetHandler(
  { schema: listSubscriptionsQuerySchema },
  async (_request, { status, memberId }) => {
    const where: Prisma.SubscriptionWhereInput = {
      ...(status && { status }),
      ...(memberId && { memberId }),
    };

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { status: 200, body: { subscriptions } };
  }
);

export const POST = withPostHandler(
  { schema: createSubscriptionSchema, idempotent: true },
  async (_request, { memberId, planType }, { user }) => {
    try {
      const { subscription, transaction } = await createSubscriptionWithTransaction(
        memberId,
        planType,
        user!.userId
      );
      return { status: 201, body: { subscription, transaction } };
    } catch (error) {
      if (error instanceof MemberNotFoundError) {
        return { status: 404, body: { error: "Member not found" } };
      }
      if (error instanceof MemberInactiveError) {
        return { status: 400, body: { error: "Member is not active" } };
      }
      if (error instanceof SubscriptionAlreadyActiveError) {
        return { status: 409, body: { error: error.message } };
      }
      throw error;
    }
  }
);

export const OPTIONS = corsPreflightHandler();

import { prisma } from "./prisma";
import { SubscriptionPlan } from "@prisma/client";

const PLAN_PRICE: Record<SubscriptionPlan, number> = {
  ONE_MONTH: 30,
  TWO_MONTH: 50,
};

const PLAN_DURATION_DAYS: Record<SubscriptionPlan, number> = {
  ONE_MONTH: 30,
  TWO_MONTH: 60,
};

export class MemberNotFoundError extends Error {}
export class MemberInactiveError extends Error {}
export class SubscriptionAlreadyActiveError extends Error {
  constructor(public readonly endDate: Date) {
    super(`Member already has an active subscription until ${endDate.toISOString()}`);
  }
}

export async function createSubscriptionWithTransaction(
  memberId: string,
  planType: SubscriptionPlan,
  createdById: string
) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new MemberNotFoundError();
  if (member.status !== "ACTIVE") throw new MemberInactiveError();

  const price = PLAN_PRICE[planType];
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + PLAN_DURATION_DAYS[planType]);

  return prisma.$transaction(async (tx) => {
    const existingActive = await tx.subscription.findFirst({
      where: { memberId, status: "ACTIVE" },
    });
    if (existingActive) {
      throw new SubscriptionAlreadyActiveError(existingActive.endDate);
    }

    const subscription = await tx.subscription.create({
      data: { memberId, planType, price, startDate, endDate, status: "ACTIVE" },
    });

    const transaction = await tx.transaction.create({
      data: {
        locationId: member.locationId,
        type: "INCOME",
        category: "SUBSCRIPTION",
        amount: price,
        subscriptionId: subscription.id,
        createdById,
      },
    });

    return { subscription, transaction };
  });
}

import { prisma } from "./prisma";

export const EXPIRY_ALERT_WINDOW_DAYS = 3;

export async function runExpiryCheck(): Promise<{
  flaggedExpiringSoon: number;
  flaggedExpired: number;
}> {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + EXPIRY_ALERT_WINDOW_DAYS);

  const enteringWindow = await prisma.subscription.findMany({
    where: { status: "ACTIVE", endDate: { gt: now, lte: windowEnd } },
  });

  for (const subscription of enteringWindow) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRING_SOON" },
      }),
      prisma.notificationLog.create({
        data: { subscriptionId: subscription.id, status: "EXPIRING_SOON" },
      }),
    ]);
  }

  const alreadyExpired = await prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "EXPIRING_SOON"] }, endDate: { lte: now } },
  });

  for (const subscription of alreadyExpired) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      }),
      prisma.notificationLog.create({
        data: { subscriptionId: subscription.id, status: "EXPIRED" },
      }),
    ]);
  }

  return {
    flaggedExpiringSoon: enteringWindow.length,
    flaggedExpired: alreadyExpired.length,
  };
}

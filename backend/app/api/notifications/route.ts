import { corsPreflightHandler, withGetHandler } from "@/lib/api-handler";
import { listNotificationsQuerySchema } from "@/lib/validation/notifications";
import { prisma } from "@/lib/prisma";

export const GET = withGetHandler(
  { schema: listNotificationsQuerySchema },
  async (_request, { status }) => {
    const notifications = await prisma.notificationLog.findMany({
      where: { ...(status && { status }) },
      orderBy: { flaggedAt: "desc" },
    });

    return { status: 200, body: { notifications } };
  }
);

export const OPTIONS = corsPreflightHandler();

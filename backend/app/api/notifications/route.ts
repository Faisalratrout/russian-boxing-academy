import { corsPreflightHandler, withGetHandler } from "@/lib/api-handler";
import { listNotificationsQuerySchema } from "@/lib/validation/notifications";

// TODO: GET — list in-app notification logs (expiring/expired subscriptions)
export const GET = withGetHandler(
  { schema: listNotificationsQuerySchema },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

// TODO: this is also where the daily subscription-expiry check will live
// (Vercel Cron-compatible route) — flags subscriptions within the
// configured expiry alert window (default 3 days) as EXPIRING_SOON,
// and past endDate as EXPIRED, logging a NotificationLog per flag.

export const OPTIONS = corsPreflightHandler();

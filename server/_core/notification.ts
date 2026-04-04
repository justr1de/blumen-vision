import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

/**
 * Placeholder notification — logs to console.
 * In production, integrate with email service (SendGrid, SES, etc.)
 */
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  if (!payload.title?.trim() || !payload.content?.trim()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Title and content are required." });
  }
  console.log(`[Notification] Owner notified: ${payload.title} — ${payload.content.substring(0, 100)}`);
  return true;
}

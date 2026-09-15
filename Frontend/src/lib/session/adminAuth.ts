export type { AdminSessionView as AdminSession } from "@/types/api/auth";

export const adminAuthUpdatedEventName = "embroidery-admin-auth-updated";

export function notifyAdminAuthUpdated(): void {
  window.dispatchEvent(new Event(adminAuthUpdatedEventName));
}

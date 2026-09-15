export type { CustomerSessionView as CustomerSession } from "@/types/api/auth";

export const customerAuthUpdatedEventName = "embroidery-customer-auth-updated";

export function notifyCustomerAuthUpdated(): void {
  window.dispatchEvent(new Event(customerAuthUpdatedEventName));
}

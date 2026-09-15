export type LocalOrderLine = {
  slug: string;
  pdpSlug: string;
  name: string;
  displayName: string;
  priceCents: number;
  imageSrc: string;
  imageAlt: string;
  formats: readonly string[];
  formatsLabel: string;
  sizeLabel: string;
  stitchLabel: string;
};

export type LocalOrder = {
  id: string;
  email: string;
  createdAt: string;
  totalCents: number;
  discountCents: number;
  lines: readonly LocalOrderLine[];
};

export const localOrderStorageKey = "embroidery-local-order";
export const orderHistoryStorageKey = "embroidery-order-history";
export const orderHistoryUpdatedEventName = "embroidery-order-history-updated";

export function notifyOrderHistoryUpdated(): void {
  window.dispatchEvent(new Event(orderHistoryUpdatedEventName));
}

export function createLocalOrderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
    return `FLB-${suffix}`;
  }

  return `FLB-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export function writeLocalOrder(order: LocalOrder): void {
  sessionStorage.setItem(localOrderStorageKey, JSON.stringify(order));
  appendOrderHistory(order);
}

export function readLocalOrder(): LocalOrder | null {
  try {
    const raw = sessionStorage.getItem(localOrderStorageKey);

    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isLocalOrder(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearLocalOrder(): void {
  sessionStorage.removeItem(localOrderStorageKey);
}

export function parseOrderHistory(raw: string): LocalOrder[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isLocalOrder);
  } catch {
    return [];
  }
}

export function readOrderHistory(): LocalOrder[] {
  try {
    return parseOrderHistory(localStorage.getItem(orderHistoryStorageKey) ?? "[]");
  } catch {
    return [];
  }
}

export function writeOrderHistory(orders: readonly LocalOrder[]): void {
  localStorage.setItem(orderHistoryStorageKey, JSON.stringify(orders));
  notifyOrderHistoryUpdated();
}

export function appendOrderHistory(order: LocalOrder): void {
  const history = readOrderHistory();
  writeOrderHistory([order, ...history.filter((item) => item.id !== order.id)]);
}

export function findOrderInHistory(orderId: string): LocalOrder | null {
  return readOrderHistory().find((order) => order.id === orderId) ?? null;
}

function isLocalOrder(value: unknown): value is LocalOrder {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as Partial<LocalOrder>;

  return (
    typeof order.id === "string" &&
    typeof order.email === "string" &&
    typeof order.createdAt === "string" &&
    typeof order.totalCents === "number" &&
    typeof order.discountCents === "number" &&
    Array.isArray(order.lines)
  );
}

import { randomUUID } from "node:crypto";

export function createOrderId(): string {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `FLB-${suffix}`;
}

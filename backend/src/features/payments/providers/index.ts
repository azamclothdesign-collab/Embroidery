import { randomBytes } from "node:crypto";
import type { Order } from "../../orders/orders.repo.ts";
import type { MethodCode } from "../methodSpecs.ts";
import { easypaisa } from "./easypaisa.ts";
import { jazzcash } from "./jazzcash.ts";
import { payfast } from "./payfast.ts";
import { pktParts, type Provider } from "./types.ts";

export const providers: Partial<Record<MethodCode, Provider>> = { payfast, jazzcash, easypaisa };

const ALNUM = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function randomAlnum(length: number): string {
  return [...randomBytes(length)].map((byte) => ALNUM[byte & 31]).join("");
}

/** A fresh, unique provider reference per payment attempt (≤ 20 alphanumerics). */
export function newReference(code: MethodCode, order: Order): string {
  const base = order.number.replace("-", ""); // EMBXXXXXXXXXX (13)
  if (code === "jazzcash") {
    const p = pktParts(new Date());
    return `T${p.y.slice(2)}${p.m}${p.d}${p.h}${p.i}${p.s}${randomAlnum(7)}`; // 20
  }
  return `${base}${randomAlnum(5)}`; // 18
}

import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32, no I L O U

/** EMB-XXXXXXXXXX — 50 bits of randomness, easy to read over the phone. */
export function createOrderNumber(): string {
  const bytes = randomBytes(10);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte & 31];
  return `EMB-${out}`;
}

export function isOrderNumber(value: string): boolean {
  return /^EMB-[0-9A-HJKMNP-TV-Z]{10}$/.test(value);
}

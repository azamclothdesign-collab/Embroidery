import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export function createPasswordSalt(): string {
  return randomBytes(32).toString("hex");
}

export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const derived = (await scryptAsync(password, salt, keyLength)) as Buffer;
  return derived.toString("hex");
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const derived = (await scryptAsync(password, salt, keyLength)) as Buffer;
  const expected = Buffer.from(expectedHash, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

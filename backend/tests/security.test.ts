import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

// Modules read config at import time, so provide a complete test environment first.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: "postgres://test:test@127.0.0.1:5432/test",
  SITE_URL: "https://shop.example.com",
  INTERNAL_API_KEY: "x".repeat(40),
  SETTINGS_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
  DOWNLOAD_SIGNING_KEY: "y".repeat(40),
  STORAGE_DIR: path.join(tmpdir(), "emb-test-storage"),
});

const crypto = await import("../src/platform/crypto.ts");
const { jazzcashHash, verifyJazzcashResponse } = await import("../src/features/payments/providers/jazzcash.ts");
const { payfastValidationHash, verifyPayfastCallback } = await import("../src/features/payments/providers/payfast.ts");
const { signedDownloadUrl, verifyDownloadSignature } = await import("../src/features/downloads/downloads.ts");
const { inspectZip } = await import("../src/features/media/zipInspect.ts");

test("password hashing round-trip", async () => {
  const hash = await crypto.hashPassword("correct horse 42");
  assert.equal(await crypto.verifyPassword("correct horse 42", hash), true);
  assert.equal(await crypto.verifyPassword("wrong", hash), false);
});

test("secret encryption round-trip and tamper detection", () => {
  const sealed = crypto.encryptSecret("merchant-secret");
  assert.notEqual(sealed, "merchant-secret");
  assert.equal(crypto.decryptSecret(sealed), "merchant-secret");
  const tampered = sealed.slice(0, -2) + (sealed.endsWith("A") ? "B" : "A") + "=";
  assert.throws(() => crypto.decryptSecret(tampered));
});

test("jazzcash hash: sorted non-empty pp_ fields, salt first, uppercase HMAC", () => {
  const salt = "s3cr3t";
  const fields = { pp_b: "2", pp_a: "1", pp_empty: "", other: "ignored" };
  const expected = createHmac("sha256", salt).update("s3cr3t&1&2").digest("hex").toUpperCase();
  assert.equal(jazzcashHash(fields, salt), expected);
  assert.equal(verifyJazzcashResponse({ ...fields, pp_SecureHash: expected }, salt), true);
  assert.equal(verifyJazzcashResponse({ ...fields, pp_a: "9", pp_SecureHash: expected }, salt), false);
});

test("payfast callback without the secured key cannot be forged", () => {
  const method = { config: { merchantId: "14833", securedKey: "KEY" } } as never;
  const good = payfastValidationHash({ basketId: "EMB123", securedKey: "KEY", merchantId: "14833", errCode: "000" });
  assert.equal(verifyPayfastCallback({ basketId: "EMB123", errCode: "000", txnId: "1", amountMinor: null, hash: good }, method), true);
  const forged = payfastValidationHash({ basketId: "EMB123", securedKey: "GUESS", merchantId: "14833", errCode: "000" });
  assert.equal(verifyPayfastCallback({ basketId: "EMB123", errCode: "000", txnId: "1", amountMinor: null, hash: forged }, method), false);
  assert.equal(verifyPayfastCallback({ basketId: "EMB123", errCode: "000", txnId: "1", amountMinor: null, hash: "" }, method), false);
});

test("download links expire and cannot be altered", () => {
  const id = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";
  const url = new URL(signedDownloadUrl(id, Date.now()));
  const exp = Number(url.searchParams.get("exp"));
  const sig = url.searchParams.get("sig") ?? "";
  assert.equal(verifyDownloadSignature(id, exp, sig), true);
  assert.equal(verifyDownloadSignature(id, exp + 60, sig), false);
  assert.equal(verifyDownloadSignature(id, exp, sig, (exp + 1) * 1000), false);
});

test("zip inspection rejects non-zip and traversal", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "zip-"));
  const fake = path.join(dir, "fake.zip");
  await writeFile(fake, "not a zip at all, just text padding padding");
  await assert.rejects(inspectZip(fake), /not a ZIP/);

  // Minimal stored ZIP with one entry named "../evil.txt".
  const name = Buffer.from("../evil.txt");
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(name.length, 28);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(central.length + name.length, 12);
  eocd.writeUInt32LE(local.length + name.length, 16);
  local.writeUInt16LE(name.length, 26);
  const evil = path.join(dir, "evil.zip");
  await writeFile(evil, Buffer.concat([local, name, central, name, eocd]));
  await assert.rejects(inspectZip(evil), /unsafe path/);
});

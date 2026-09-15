import "server-only";

function requireNonEmpty(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function requireUrl(name: string, value: string): string {
  try {
    void new URL(value);
    return value;
  } catch {
    throw new Error(`Invalid URL for environment variable: ${name}`);
  }
}

const apiBaseUrl = requireUrl(
  "API_BASE_URL",
  requireNonEmpty("API_BASE_URL", process.env.API_BASE_URL),
);
const hmacSigningSecret = requireNonEmpty(
  "HMAC_SIGNING_SECRET",
  process.env.HMAC_SIGNING_SECRET,
);

if (hmacSigningSecret.length < 32) {
  throw new Error("HMAC_SIGNING_SECRET must be at least 32 characters");
}

const appOriginRaw = process.env.APP_ORIGIN?.trim();
const appOrigin =
  appOriginRaw === undefined || appOriginRaw === ""
    ? "http://localhost:3000"
    : requireUrl("APP_ORIGIN", appOriginRaw);

const nodeEnv = process.env.NODE_ENV;

export const env = {
  API_BASE_URL: apiBaseUrl,
  HMAC_SIGNING_SECRET: hmacSigningSecret,
  APP_ORIGIN: appOrigin,
  NODE_ENV:
    nodeEnv === "development" ||
    nodeEnv === "production" ||
    nodeEnv === "test"
      ? nodeEnv
      : undefined,
};

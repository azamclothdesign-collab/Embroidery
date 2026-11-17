import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing environment variable ${name} (see frontend/.env.example)`);
  }
  return value;
}

export const serverEnv = {
  get backendUrl(): string {
    return required("BACKEND_URL").replace(/\/+$/, "");
  },
  get internalKey(): string {
    return required("INTERNAL_API_KEY");
  },
};

import { findAdminSession } from "./adminAuthRepository.js";
import { findCustomerSession } from "./customerAuthRepository.js";

export async function findActiveCustomerSession(
  tokenHash: string,
): Promise<string | null> {
  const session = await findCustomerSession(tokenHash);
  return session?.customer_id ?? null;
}

export async function findActiveAdminSession(
  tokenHash: string,
): Promise<string | null> {
  const session = await findAdminSession(tokenHash);
  return session?.admin_user_id ?? null;
}

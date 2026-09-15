import { type IncomingMessage } from "node:http";

import { hashSessionToken } from "../../utils/sessionToken.js";
import {
  findActiveAdminSession,
  findActiveCustomerSession,
} from "../database/repositories/auth/sessionRepository.js";
import { readHeader } from "./handlerTypes.js";

export type ResolvedSessions = {
  customerId?: string;
  adminUserId?: string;
  guestToken?: string;
};

export async function resolveRequestSessions(
  req: IncomingMessage,
): Promise<ResolvedSessions> {
  const resolved: ResolvedSessions = {};
  const guestToken = readHeader(req, "x-guest-token");

  if (guestToken !== null) {
    resolved.guestToken = guestToken;
  }

  const customerToken = readHeader(req, "x-customer-session");

  if (customerToken !== null) {
    const customerId = await findActiveCustomerSession(
      hashSessionToken(customerToken),
    );

    if (customerId !== null) {
      resolved.customerId = customerId;
    }
  }

  const adminToken = readHeader(req, "x-admin-session");

  if (adminToken !== null) {
    const adminUserId = await findActiveAdminSession(
      hashSessionToken(adminToken),
    );

    if (adminUserId !== null) {
      resolved.adminUserId = adminUserId;
    }
  }

  return resolved;
}

import {
  createCustomerSession,
  deleteCustomerSession,
  findCustomerByEmail,
  findCustomerById,
  insertCustomer,
  updateCustomerPassword,
} from "../../database/repositories/auth/customerAuthRepository.js";
import { mergeGuestCartToCustomer } from "../../database/repositories/cart/cartRepository.js";
import {
  type AdminAuthSessionResponse,
  type AdminSessionView,
  type AuthSessionResponse,
  type CustomerSessionView,
} from "../../../types/auth.js";
import { normalizeEmail } from "../../../utils/normalizeEmail.js";
import {
  createPasswordSalt,
  hashPassword,
  verifyPassword,
} from "../../../utils/passwordHash.js";
import {
  createSessionToken,
  hashSessionToken,
} from "../../../utils/sessionToken.js";
import { ServiceError } from "../../../utils/serviceError.js";
import {
  createAdminSession,
  deleteAdminSession,
  findAdminByEmail,
  findAdminById,
} from "../../database/repositories/auth/adminAuthRepository.js";

const customerSessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const adminSessionTtlMs = 8 * 60 * 60 * 1000;

function buildCustomerSessionView(input: {
  email: string;
  firstName: string;
  lastName: string;
  signedInAt: string;
}): CustomerSessionView {
  return {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    signedInAt: input.signedInAt,
  };
}

async function issueCustomerSession(customerId: string): Promise<AuthSessionResponse> {
  const customer = await findCustomerById(customerId);

  if (customer === null) {
    throw new ServiceError(404, "not_found", "Customer not found");
  }

  const sessionToken = createSessionToken();
  const signedInAt = new Date().toISOString();

  await createCustomerSession({
    customerId,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt: new Date(Date.now() + customerSessionTtlMs),
  });

  return {
    session: buildCustomerSessionView({
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      signedInAt,
    }),
    sessionToken,
  };
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  guestToken?: string | undefined;
}): Promise<AuthSessionResponse> {
  const email = normalizeEmail(input.email);
  const existing = await findCustomerByEmail(email);

  if (existing !== null) {
    throw new ServiceError(409, "conflict", "Account already exists");
  }

  const passwordSalt = createPasswordSalt();
  const passwordHash = await hashPassword(input.password, passwordSalt);
  const customer = await insertCustomer({
    email,
    passwordHash,
    passwordSalt,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  if (input.guestToken !== undefined) {
    await mergeGuestCartToCustomer({
      guestToken: input.guestToken,
      customerId: customer.id,
    });
  }

  return issueCustomerSession(customer.id);
}

export async function loginCustomer(input: {
  email: string;
  password: string;
  guestToken?: string | undefined;
}): Promise<AuthSessionResponse> {
  const email = normalizeEmail(input.email);
  const customer = await findCustomerByEmail(email);

  if (customer === null) {
    throw new ServiceError(401, "unauthenticated", "Invalid credentials");
  }

  const valid = await verifyPassword(
    input.password,
    customer.password_salt,
    customer.password_hash,
  );

  if (!valid) {
    throw new ServiceError(401, "unauthenticated", "Invalid credentials");
  }

  if (input.guestToken !== undefined) {
    await mergeGuestCartToCustomer({
      guestToken: input.guestToken,
      customerId: customer.id,
    });
  }

  return issueCustomerSession(customer.id);
}

export async function logoutCustomer(sessionToken: string): Promise<{ ok: true }> {
  await deleteCustomerSession(hashSessionToken(sessionToken));
  return { ok: true };
}

export async function getCustomerSession(
  customerId: string,
): Promise<CustomerSessionView> {
  const customer = await findCustomerById(customerId);

  if (customer === null) {
    throw new ServiceError(401, "unauthenticated", "Unauthorized");
  }

  return buildCustomerSessionView({
    email: customer.email,
    firstName: customer.first_name,
    lastName: customer.last_name,
    signedInAt: customer.created_at.toISOString(),
  });
}

export async function forgotCustomerPassword(input: {
  email: string;
  password?: string | undefined;
}): Promise<{ ok: true }> {
  const email = normalizeEmail(input.email);

  if (input.password === undefined) {
    return { ok: true };
  }

  const customer = await findCustomerByEmail(email);

  if (customer === null) {
    throw new ServiceError(404, "not_found", "Account not found");
  }

  const passwordSalt = createPasswordSalt();
  const passwordHash = await hashPassword(input.password, passwordSalt);

  await updateCustomerPassword({
    customerId: customer.id,
    passwordHash,
    passwordSalt,
  });

  return { ok: true };
}

export async function changeCustomerPassword(input: {
  customerId: string;
  currentPassword: string;
  nextPassword: string;
}): Promise<{ ok: true }> {
  const customer = await findCustomerById(input.customerId);

  if (customer === null) {
    throw new ServiceError(401, "unauthenticated", "Unauthorized");
  }

  const valid = await verifyPassword(
    input.currentPassword,
    customer.password_salt,
    customer.password_hash,
  );

  if (!valid) {
    throw new ServiceError(401, "unauthenticated", "Invalid credentials");
  }

  const passwordSalt = createPasswordSalt();
  const passwordHash = await hashPassword(input.nextPassword, passwordSalt);

  await updateCustomerPassword({
    customerId: customer.id,
    passwordHash,
    passwordSalt,
  });

  return { ok: true };
}

async function issueAdminSession(adminUserId: string): Promise<AdminAuthSessionResponse> {
  const admin = await findAdminById(adminUserId);

  if (admin === null) {
    throw new ServiceError(404, "not_found", "Admin not found");
  }

  const sessionToken = createSessionToken();
  const signedInAt = new Date().toISOString();

  await createAdminSession({
    adminUserId,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt: new Date(Date.now() + adminSessionTtlMs),
  });

  const session: AdminSessionView = {
    email: admin.email,
    role: admin.role,
    signedInAt,
  };

  return { session, sessionToken };
}

export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<AdminAuthSessionResponse> {
  const email = normalizeEmail(input.email);
  const admin = await findAdminByEmail(email);

  if (admin === null) {
    throw new ServiceError(401, "unauthenticated", "Invalid credentials");
  }

  const valid = await verifyPassword(
    input.password,
    admin.password_salt,
    admin.password_hash,
  );

  if (!valid) {
    throw new ServiceError(401, "unauthenticated", "Invalid credentials");
  }

  return issueAdminSession(admin.id);
}

export async function logoutAdmin(sessionToken: string): Promise<{ ok: true }> {
  await deleteAdminSession(hashSessionToken(sessionToken));
  return { ok: true };
}

export async function getAdminSession(
  adminUserId: string,
): Promise<AdminSessionView> {
  const admin = await findAdminById(adminUserId);

  if (admin === null) {
    throw new ServiceError(401, "unauthenticated", "Unauthorized");
  }

  return {
    email: admin.email,
    role: admin.role,
    signedInAt: new Date().toISOString(),
  };
}

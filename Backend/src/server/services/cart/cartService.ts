import {
  listCartLines,
  replaceCartLines,
} from "../../database/repositories/cart/cartRepository.js";
import { type CartLine, type CartView } from "../../../types/cart.js";
import { ServiceError } from "../../../utils/serviceError.js";

function resolveCartOwner(input: {
  customerId?: string | undefined;
  guestToken?: string | undefined;
}): { customerId?: string; guestToken?: string } {
  if (input.customerId !== undefined) {
    return { customerId: input.customerId };
  }

  if (input.guestToken !== undefined) {
    return { guestToken: input.guestToken };
  }

  throw new ServiceError(401, "unauthenticated", "Cart session required");
}

export async function getCart(input: {
  customerId?: string | undefined;
  guestToken?: string | undefined;
}): Promise<CartView> {
  const owner = resolveCartOwner(input);
  const lines = await listCartLines(owner);
  return { lines };
}

export async function updateCart(input: {
  customerId?: string | undefined;
  guestToken?: string | undefined;
  lines: CartLine[];
}): Promise<CartView> {
  const owner = resolveCartOwner(input);

  await replaceCartLines({
    ...owner,
    slugs: input.lines.map((line) => line.slug),
  });

  const lines = await listCartLines(owner);
  return { lines };
}

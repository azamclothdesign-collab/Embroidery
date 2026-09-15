import {
  findAccountSettings,
  updateAccountSettings,
} from "../../database/repositories/account/accountRepository.js";
import { listOrdersForCustomer } from "../../database/repositories/orders/orderRepository.js";
import {
  type AccountSettings,
  type DownloadLibraryItem,
} from "../../../types/account.js";
import { ServiceError } from "../../../utils/serviceError.js";

function requireCustomerId(customerId?: string): string {
  if (customerId === undefined) {
    throw new ServiceError(401, "unauthenticated", "Unauthorized");
  }

  return customerId;
}

export async function getAccountSettings(
  customerId?: string,
): Promise<AccountSettings> {
  const id = requireCustomerId(customerId);
  const settings = await findAccountSettings(id);

  if (settings === null) {
    throw new ServiceError(404, "not_found", "Account not found");
  }

  return settings;
}

export async function putAccountSettings(input: {
  customerId?: string | undefined;
  settings: AccountSettings;
}): Promise<AccountSettings> {
  const id = requireCustomerId(input.customerId);
  return updateAccountSettings({
    customerId: id,
    settings: input.settings,
  });
}

export async function getAccountDownloads(
  customerId?: string,
): Promise<{ items: DownloadLibraryItem[] }> {
  const id = requireCustomerId(customerId);
  const orders = await listOrdersForCustomer(id);
  const items: DownloadLibraryItem[] = [];

  for (const order of orders) {
    for (const line of order.lines) {
      items.push({
        key: `${order.id}-${line.slug}`,
        orderId: order.id,
        orderCreatedAt: order.createdAt,
        slug: line.slug,
        pdpSlug: line.pdpSlug,
        name: line.name,
        displayName: line.displayName,
        priceCents: line.priceCents,
        imageSrc: line.imageSrc,
        imageAlt: line.imageAlt,
        formats: [...line.formats],
        formatsLabel: line.formatsLabel,
        sizeLabel: line.sizeLabel,
        stitchLabel: line.stitchLabel,
      });
    }
  }

  return { items };
}

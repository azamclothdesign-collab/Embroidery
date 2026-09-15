import {
  deleteOrder,
  findOrderById,
  findOrderForCustomer,
  insertOrder,
  listAllOrders,
  listOrdersForCustomer,
} from "../../database/repositories/orders/orderRepository.js";
import { findProductBySlug } from "../../database/repositories/products/productRepository.js";
import { readStoredPackage } from "../media/mediaService.js";
import { type CartLine } from "../../../types/cart.js";
import { type OrderLine, type OrderRecord } from "../../../types/order.js";
import { createOrderId } from "../../../utils/createOrderId.js";
import { ServiceError } from "../../../utils/serviceError.js";

function requireCustomerId(customerId?: string): string {
  if (customerId === undefined) {
    throw new ServiceError(401, "unauthenticated", "Unauthorized");
  }

  return customerId;
}

function requireAdmin(adminUserId?: string): string {
  if (adminUserId === undefined) {
    throw new ServiceError(403, "forbidden", "Forbidden");
  }

  return adminUserId;
}

async function buildOrderLines(lines: readonly CartLine[]): Promise<OrderLine[]> {
  const orderLines: OrderLine[] = [];

  for (const line of lines) {
    const product = await findProductBySlug(line.slug);

    if (product === null) {
      throw new ServiceError(422, "invalid_product", "Cart contains invalid product");
    }

    orderLines.push({
      slug: product.slug,
      pdpSlug: product.pdpSlug,
      name: product.name,
      displayName: `${product.name} Embroidery Design`,
      priceCents: product.priceCents,
      imageSrc: product.imageSrc,
      imageAlt: product.imageAlt,
      formats: [...product.formats],
      formatsLabel: "Embroidery package ZIP",
      sizeLabel: product.hoopSize,
      stitchLabel: `${product.stitchCount.toLocaleString("en-US")} stitches`,
      packagePath: product.packagePath,
      packageFileName: product.packageFileName,
    });
  }

  return orderLines;
}

export async function listCustomerOrders(
  customerId?: string,
): Promise<OrderRecord[]> {
  const id = requireCustomerId(customerId);
  return listOrdersForCustomer(id);
}

export async function listAdminOrders(
  adminUserId?: string,
): Promise<OrderRecord[]> {
  requireAdmin(adminUserId);
  return listAllOrders();
}

export async function getCustomerOrder(input: {
  customerId?: string | undefined;
  orderId: string;
}): Promise<OrderRecord> {
  const id = requireCustomerId(input.customerId);
  const order = await findOrderForCustomer({
    customerId: id,
    orderId: input.orderId,
  });

  if (order === null) {
    throw new ServiceError(404, "not_found", "Order not found");
  }

  return order;
}

export async function getAdminOrCustomerOrder(input: {
  adminUserId?: string | undefined;
  customerId?: string | undefined;
  orderId: string;
}): Promise<OrderRecord> {
  if (input.adminUserId !== undefined) {
    const order = await findOrderById(input.orderId);

    if (order === null) {
      throw new ServiceError(404, "not_found", "Order not found");
    }

    return order;
  }

  return getCustomerOrder({
    customerId: input.customerId,
    orderId: input.orderId,
  });
}

export async function createOrder(input: {
  customerId?: string | undefined;
  email: string;
  totalCents: number;
  discountCents: number;
  lines: readonly CartLine[];
}): Promise<OrderRecord> {
  const orderLines = await buildOrderLines(input.lines);
  const computedTotal = orderLines.reduce(
    (sum, line) => sum + line.priceCents,
    0,
  );

  if (computedTotal - input.discountCents !== input.totalCents) {
    throw new ServiceError(422, "invalid_total", "Order total mismatch");
  }

  return insertOrder({
    id: createOrderId(),
    email: input.email,
    totalCents: computedTotal - input.discountCents,
    discountCents: input.discountCents,
    lines: orderLines,
    ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
  });
}

export async function downloadPurchasedPackage(input: {
  customerId?: string | undefined;
  orderId: string;
  productSlug: string;
}): Promise<{
  fileName: string;
  contentType: string;
  contentBase64: string;
  byteLength: number;
}> {
  let order: OrderRecord;

  if (input.customerId !== undefined) {
    order = await getCustomerOrder({
      customerId: input.customerId,
      orderId: input.orderId,
    });
  } else {
    const guestOrder = await findOrderById(input.orderId);

    if (guestOrder === null) {
      throw new ServiceError(404, "not_found", "Order not found");
    }

    order = guestOrder;
  }

  const line = order.lines.find(
    (item) =>
      item.slug === input.productSlug || item.pdpSlug === input.productSlug,
  );

  if (line === undefined) {
    throw new ServiceError(404, "not_found", "Design not found on this order");
  }

  let packagePath = line.packagePath;
  let packageFileName = line.packageFileName;

  if (packagePath === undefined) {
    const product = await findProductBySlug(line.slug);
    packagePath = product?.packagePath;
    packageFileName = product?.packageFileName;
  }

  if (packagePath === undefined) {
    throw new ServiceError(404, "not_found", "Embroidery package not available");
  }

  const bytes = await readStoredPackage(packagePath);

  return {
    fileName: packageFileName ?? `${line.slug}.zip`,
    contentType: "application/zip",
    contentBase64: bytes.toString("base64"),
    byteLength: bytes.byteLength,
  };
}

export async function deleteOrderById(orderId: string): Promise<{ ok: true }> {
  const deleted = await deleteOrder(orderId);

  if (!deleted) {
    throw new ServiceError(404, "not_found", "Order not found");
  }

  return { ok: true };
}

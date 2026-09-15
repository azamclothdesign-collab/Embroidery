import {
  formatShopPrice,
  type ShopProduct,
} from "@/constants/shopCatalog";
import { type CartLine } from "@/types/api/cart";

export type CartDisplayLine = CartLine & {
  formatsLabel: string;
  sizeLabel: string;
  displayName: string;
  isAvailable: boolean;
};

export function resolveCartDisplayLine(
  line: CartLine,
  catalog: readonly ShopProduct[] = [],
): CartDisplayLine {
  const product = findCatalogProduct(line.slug, catalog);

  if (product === undefined) {
    return {
      ...line,
      formatsLabel: "",
      sizeLabel: "",
      displayName: `${line.name} Embroidery Design`,
      // When no catalog is supplied, trust API-backed cart lines.
      isAvailable: catalog.length === 0,
    };
  }

  return {
    ...line,
    name: product.name,
    pdpSlug: product.pdpSlug,
    priceCents: product.priceCents,
    imageSrc: product.imageSrc,
    imageAlt: product.imageAlt,
    formatsLabel: "ZIP package",
    sizeLabel: product.hoopSize,
    displayName: `${product.name} Embroidery Design`,
    isAvailable: true,
  };
}

export function resolveCartDisplayLines(
  lines: readonly CartLine[],
  catalog: readonly ShopProduct[] = [],
): CartDisplayLine[] {
  return lines.map((line) => resolveCartDisplayLine(line, catalog));
}

export function cartHasValidationIssues(
  lines: readonly CartDisplayLine[],
): boolean {
  return lines.some((line) => !line.isAvailable);
}

export function formatCartTotal(cents: number): string {
  return formatShopPrice(cents);
}

export function findCatalogProduct(
  slug: string,
  catalog: readonly ShopProduct[] = [],
): ShopProduct | undefined {
  return catalog.find((item) => item.slug === slug);
}

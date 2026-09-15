import {
  formatFromScreenMetric,
  fromScreenToStitchMetrics,
} from "@/constants/fromScreenToStitch";
import { type CartDisplayLine, findCatalogProduct } from "@/lib/session/cartDisplay";
import {
  createLocalOrderId,
  type LocalOrder,
  type LocalOrderLine,
} from "@/lib/session/orderSession";

function stitchLabelForSlug(slug: string): string {
  const product = findCatalogProduct(slug);
  const stitches = fromScreenToStitchMetrics.find((item) => item.id === "stitches");

  if (product === undefined || stitches === undefined) {
    return "";
  }

  return formatFromScreenMetric(stitches.value, stitches.decimals, stitches.suffix);
}

export function buildLocalOrder(options: {
  email: string;
  lines: readonly CartDisplayLine[];
  totalCents: number;
  discountCents: number;
}): LocalOrder {
  const lines: LocalOrderLine[] = options.lines.map((line) => {
    const product = findCatalogProduct(line.slug);
    const formats = product?.formats ?? [];

    return {
      slug: line.slug,
      pdpSlug: line.pdpSlug,
      name: line.name,
      displayName: line.displayName,
      priceCents: line.priceCents,
      imageSrc: line.imageSrc,
      imageAlt: line.imageAlt,
      formats,
      formatsLabel: "ZIP package",
      sizeLabel: line.sizeLabel,
      stitchLabel: stitchLabelForSlug(line.slug),
    };
  });

  return {
    id: createLocalOrderId(),
    email: options.email.trim(),
    createdAt: new Date().toISOString(),
    totalCents: options.totalCents,
    discountCents: options.discountCents,
    lines,
  };
}

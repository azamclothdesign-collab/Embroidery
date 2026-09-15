import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { communityPosts } from "@/constants/communityPosts";
import {
  formatFromScreenMetric,
  fromScreenToStitchCopy,
  fromScreenToStitchMetrics,
} from "@/constants/fromScreenToStitch";
import { machineFormats } from "@/constants/machineFormats";
import { type ShopProduct } from "@/constants/shopCatalog";

const productDescriptionFallback =
  "A professionally digitized embroidery design created for apparel, accessories, gifts, and creative embroidery projects.";

export function productDescriptionText(product: ShopProduct): string {
  const fromCatalog = product.description?.trim();

  if (fromCatalog !== undefined && fromCatalog.length > 0) {
    return fromCatalog;
  }

  return productDescriptionFallback;
}

export const productReview = {
  quote: "Absolutely beautiful stitching.",
  body: "The design was easy to download, the files were organized perfectly, and it stitched beautifully on my machine.",
  name: "Emily R.",
} as const;

export const productThreadColors = [
  { id: "01", name: "Black", swatchClassName: "bg-[#111111]" },
  { id: "02", name: "Green", swatchClassName: "bg-[#5c7a4a]" },
  { id: "03", name: "Pink", swatchClassName: "bg-[#d4a0b0]" },
  { id: "04", name: "White", swatchClassName: "bg-[#f8f7f3]" },
  { id: "05", name: "Yellow", swatchClassName: "bg-[#d8a83e]" },
  { id: "06", name: "Brown", swatchClassName: "bg-[#6b4a32]" },
  { id: "07", name: "Red", swatchClassName: "bg-[#a33b3b]" },
] as const;

const garmentPost = communityPosts[0];

export function productGallery(product: ShopProduct) {
  const stitchedSrc = product.stitchedImageSrc;
  const items = [
    {
      id: "preview",
      label: "Preview",
      src: product.imageSrc,
      alt: product.imageAlt,
    },
    ...(stitchedSrc === undefined
      ? []
      : [
          {
            id: "stitched",
            label: "Stitched",
            src: stitchedSrc,
            alt: product.stitchedImageAlt ?? product.imageAlt,
          },
        ]),
  ];

  return items;
}

export type ProductGalleryItem = ReturnType<typeof productGallery>[number];

export function productShowcaseSteps(product: ShopProduct) {
  const stitchedSrc = product.stitchedImageSrc ?? product.imageSrc;
  const finishedSrc = garmentPost?.imageSrc ?? stitchedSrc;
  const finishedAlt = garmentPost?.imageAlt ?? product.imageAlt;

  return [
    {
      id: "digital",
      label: "Digital Design",
      src: product.imageSrc,
      alt: product.imageAlt,
    },
    {
      id: "structure",
      label: "Stitch Structure",
      src: fromScreenToStitchPosterSrc,
      alt: fromScreenToStitchCopy.imageAlt,
    },
    {
      id: "thread",
      label: "Thread & Color",
      src: stitchedSrc,
      alt: product.stitchedImageAlt ?? product.imageAlt,
    },
    {
      id: "finished",
      label: "Finished Result",
      src: finishedSrc,
      alt: finishedAlt,
    },
  ] as const;
}

export function compatibleMachines(product: ShopProduct) {
  return machineFormats.filter((item) =>
    product.formats.some((format) => format === item.format),
  );
}

export function includedFiles(_product: ShopProduct): string[] {
  return [
    "Embroidery package ZIP",
    "PNG preview",
    "Color chart",
    "Embroidery guide",
  ];
}

function metricById(id: string) {
  return fromScreenToStitchMetrics.find((item) => item.id === id);
}

export function productSpecLabels(product: ShopProduct) {
  const colors = metricById("thread-colors");

  return {
    widthLabel: "",
    heightLabel: "",
    sizeLabel: product.hoopSize,
    stitchLabel: new Intl.NumberFormat("en-US").format(product.stitchCount),
    colorLabel:
      colors === undefined
        ? ""
        : formatFromScreenMetric(colors.value, colors.decimals, colors.suffix),
    hoopLabel: product.hoopSize,
    formatsLabel: "Single embroidery ZIP",
  };
}

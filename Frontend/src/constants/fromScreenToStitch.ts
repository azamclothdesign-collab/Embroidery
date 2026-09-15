export const fromScreenToStitchCopy = {
  heading: "From Digital File to Real Thread.",
  lead: "Every design starts digitally — but its purpose is physical.",
  body: "Our designs are created to translate cleanly from screen to fabric, with clear specs and one ZIP package ready after purchase.",
  imageAlt: "Close-up of embroidery thread stitched into cream linen",
} as const;

export const fromScreenToStitchMetrics = [
  {
    id: "stitches",
    label: "Stitches",
    value: 18452,
    decimals: 0,
    suffix: "",
  },
  {
    id: "thread-colors",
    label: "Thread Colors",
    value: 7,
    decimals: 0,
    suffix: "",
  },
  {
    id: "design-width",
    label: "Design Width",
    value: 4.1,
    decimals: 1,
    suffix: '"',
  },
  {
    id: "design-height",
    label: "Design Height",
    value: 3.8,
    decimals: 1,
    suffix: '"',
  },
] as const;

export function formatFromScreenMetric(
  value: number,
  decimals: number,
  suffix: string,
): string {
  if (decimals === 0) {
    return `${new Intl.NumberFormat("en-US").format(Math.round(value))}${suffix}`;
  }

  return `${value.toFixed(decimals)}${suffix}`;
}

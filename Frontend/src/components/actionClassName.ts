type ActionTone = "ink" | "paper" | "ghostOnDark" | "ghostOnLight";

const toneClassName: Record<ActionTone, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink",
  ghostOnDark: "border border-paper text-paper",
  ghostOnLight: "border border-ink text-ink",
};

const baseClassName =
  "inline-flex min-h-11 items-center justify-center px-6 font-nourd text-base tracking-wide transition-transform active:scale-[0.97]";

export function actionClassName(options?: {
  tone?: ActionTone | null | undefined;
  className?: string | null | undefined;
}): string {
  const tone = options?.tone ?? "ink";
  const extra = options?.className;

  return [baseClassName, toneClassName[tone], extra]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ");
}

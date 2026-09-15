type HeaderIconCountBadgeProps = {
  count: number;
  overlay?: boolean;
};

export function HeaderIconCountBadge({
  count,
  overlay = false,
}: HeaderIconCountBadgeProps) {
  if (count < 1) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      aria-hidden="true"
      className={
        overlay
          ? "absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-paper px-1 font-nourd text-[10px] font-semibold leading-none text-ink"
          : "absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 font-nourd text-[10px] font-semibold leading-none text-paper"
      }
    >
      {label}
    </span>
  );
}

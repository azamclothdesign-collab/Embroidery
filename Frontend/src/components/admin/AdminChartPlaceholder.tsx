import { adminCopy } from "@/constants/adminCopy";

const chartBarHeights = [42, 68, 35, 79, 51, 63, 47] as const;

type AdminChartPlaceholderProps = {
  title?: string;
  className?: string;
};

export function AdminChartPlaceholder({
  title,
  className = "",
}: AdminChartPlaceholderProps) {
  return (
    <div
      className={`flex min-h-[16rem] flex-col rounded-[1.25rem] border border-dashed border-admin-line/50 bg-admin-surface/30 backdrop-blur-sm px-5 py-5 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-admin-accent/5 to-transparent pointer-events-none" />
      {title === undefined ? null : (
        <p className="text-meta uppercase tracking-[0.16em] text-admin-ink-soft relative z-10">
          {title}
        </p>
      )}
      <div className="mt-4 flex flex-1 items-end gap-2 relative z-10">
        {["a", "b", "c", "d", "e", "f", "g"].map((slot, i) => (
          <span
            key={slot}
            className="flex-1 rounded-t-md bg-gradient-to-t from-admin-accent/20 to-admin-accent/5 border-t border-admin-accent/20"
            style={{ height: `${chartBarHeights[i]}%`, opacity: 0.5 + (i * 0.05) }}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-[0.8125rem] leading-6 text-admin-ink-soft relative z-10">
        {adminCopy.chartPending}
      </p>
    </div>
  );
}

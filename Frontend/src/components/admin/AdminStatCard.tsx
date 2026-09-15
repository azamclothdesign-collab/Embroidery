import { adminCopy } from "@/constants/adminCopy";

type AdminStatCardProps = {
  label: string;
  value?: string;
  hint?: string;
  pending?: boolean;
  tone?: "surface" | "ink";
};

export function AdminStatCard({
  label,
  value,
  pending = true,
}: AdminStatCardProps) {
  const display = pending || value === undefined ? adminCopy.emDash : value;

  return (
    <article className="admin-orders-stat">
      <p className="admin-orders-stat-label">{label}</p>
      <p className="admin-orders-stat-value">{display}</p>
    </article>
  );
}

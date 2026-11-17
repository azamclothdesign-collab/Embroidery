import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, FileWarning, Inbox, Plus, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { AnimatedNumber } from "@/features/admin/AnimatedNumber";
import { SalesChart } from "@/features/admin/SalesChart";
import { RecentOrders } from "@/features/admin/RecentOrders";
import { PageHeader, Panel, rupees } from "@/features/admin/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Overview" };

type Overview = {
  days: number;
  revenueMinor: number;
  previousRevenueMinor: number;
  paidOrders: number;
  averageOrderMinor: number;
  customers: number;
  series: Array<{ day: string; revenueMinor: number; orders: number }>;
  topProducts: Array<{ slug: string; name: string; sold: number; revenueMinor: number }>;
  attention: { awaiting: number; proofs: number; messages: number; drafts: number; unpaid: number };
  recentOrders: Array<{ number: string; customerName: string; totalMinor: number; status: string; paymentMethod: string; createdAt: string }>;
};

export default async function OverviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).days;
  const days = raw === "7" || raw === "90" ? raw : "30";
  const data = await adminApi<Overview>(`/v1/admin/overview?days=${days}`);
  const change = data.previousRevenueMinor > 0 ? Math.round(((data.revenueMinor - data.previousRevenueMinor) / data.previousRevenueMinor) * 100) : null;

  const tasks = [
    { count: data.attention.proofs, label: "bank receipts to review", href: "/admin/orders?status=awaiting_verification", icon: Receipt },
    { count: data.attention.awaiting - data.attention.proofs, label: "manual orders waiting (no receipt yet)", href: "/admin/orders?status=awaiting_verification", icon: AlertCircle },
    { count: data.attention.messages, label: "unread messages", href: "/admin/messages", icon: Inbox },
    { count: data.attention.drafts, label: "draft designs not published", href: "/admin/products?status=draft", icon: FileWarning },
  ].filter((task) => task.count > 0);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Sales and what needs your attention."
        actions={
          <>
            <div className="flex rounded-full border border-line bg-paper p-1" role="group" aria-label="Period">
              {["7", "30", "90"].map((d) => (
                <Link key={d} href={`/admin?days=${d}`} aria-current={d === days ? "true" : undefined} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", d === days ? "bg-ink text-white" : "text-ink-soft")}>
                  {d}d
                </Link>
              ))}
            </div>
            <Link href="/admin/products/new" className="btn btn-primary">
              <Plus className="size-4" aria-hidden /> New design
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`Revenue (${data.days}d)`} value={data.revenueMinor} format="rupees" change={change} />
        <Stat label="Paid orders" value={data.paidOrders} />
        <Stat label="Average order" value={data.averageOrderMinor} format="rupees" />
        <Stat label="Customers" value={data.customers} />
      </div>

      {tasks.length > 0 && (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {tasks.map(({ count, label, href, icon: Icon }) => (
            <li key={label}>
              <Link href={href} className="flex items-center gap-3 rounded-2xl border border-saffron/30 bg-saffron-soft/50 px-4 py-3 font-semibold hover:bg-saffron-soft">
                <Icon className="size-5 text-saffron-strong" aria-hidden />
                <span className="text-lg">{count}</span> {label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Sales">
          <SalesChart series={data.series} />
        </Panel>
        <Panel title="Top designs">
          {data.topProducts.length === 0 ? (
            <p className="text-ink-soft">No sales in this period yet.</p>
          ) : (
            <ol className="space-y-3">
              {data.topProducts.map((product, index) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-sand text-sm font-semibold">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{product.name}</span>
                  <span className="text-sm text-ink-soft">{product.sold} sold</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel title="Recent orders" className="mt-6">
        <div className="-mx-5 sm:-mx-6">
          <RecentOrders orders={data.recentOrders} />
        </div>
      </Panel>
    </>
  );
}

function Stat({ label, value, format = "int", change = null }: { label: string; value: number; format?: "int" | "rupees"; change?: number | null }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold"><AnimatedNumber value={value} format={format} /></p>
      {change !== null && (
        <p className={cn("mt-1 flex items-center gap-1 text-sm font-semibold", change >= 0 ? "text-success" : "text-danger")}>
          {change >= 0 ? <TrendingUp className="size-4" aria-hidden /> : <TrendingDown className="size-4" aria-hidden />}
          {change >= 0 ? "+" : ""}
          {change}% vs previous period
        </p>
      )}
    </div>
  );
}

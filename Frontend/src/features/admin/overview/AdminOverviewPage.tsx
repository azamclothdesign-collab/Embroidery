"use client";

import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import {
  adminOrderDetailHref,
  adminProductEditHref,
  adminProductNewHref,
} from "@/constants/adminNav";
import { formatShopPrice, type ShopProduct } from "@/constants/shopCatalog";
import { type OrderRecord } from "@/types/api/order";

type AdminOverviewPageProps = {
  locale: string;
  products: readonly ShopProduct[];
  orders: readonly OrderRecord[];
};

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AdminOverviewPage({
  locale,
  products,
  orders,
}: AdminOverviewPageProps) {
  const localeRoot = `/${locale}`;
  const recentOrders = orders.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Overview"
        actions={
          <Link
            href={`${localeRoot}${adminProductNewHref}`}
            className="admin-product-cta"
          >
            Add Product
          </Link>
        }
      />

      <section
        aria-label="Key metrics"
        className="admin-orders-stats"
      >
        <AdminStatCard
          label="Products"
          value={String(products.length)}
          pending={false}
        />
        <AdminStatCard
          label="Published"
          value={String(products.length)}
          pending={false}
        />
        <AdminStatCard
          label={adminCopy.kpiOrders}
          value={String(orders.length)}
          pending={false}
        />
        <AdminStatCard label="Pending" value="0" pending={false} />
      </section>

      <section className="mt-4 flex flex-col gap-6">
        <article className="admin-panel p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="admin-panel-kicker">{adminCopy.ordersTitle}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-admin-ink">
                Recent Orders
              </h2>
            </div>
            <Link
              href={`${localeRoot}/admin/orders`}
              className="text-[12px] font-medium uppercase tracking-[0.12em] text-admin-ink underline-offset-4 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-admin-line">
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">Order</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">Customer</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">Status</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">Total</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[14px] text-admin-ink-soft">
                      {adminCopy.recentOrdersEmpty}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-admin-line/50 last:border-0 hover:bg-admin-line/20"
                    >
                      <td className="py-3 pr-4 text-[14px] text-admin-ink">
                        {order.id}
                      </td>
                      <td className="py-3 pr-4 text-[14px] text-admin-ink-soft">
                        {order.email}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="admin-status-pill--delivered">Paid</span>
                      </td>
                      <td className="py-3 pr-4 text-[14px] text-admin-ink">
                        {formatMoney(order.totalCents)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`${localeRoot}${adminOrderDetailHref(order.id)}`}
                          className="admin-orders-open"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="admin-panel-kicker">{adminCopy.productsTitle}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-admin-ink">
                Catalog Snapshot
              </h2>
            </div>
            <Link
              href={`${localeRoot}/admin/products`}
              className="text-[12px] font-medium uppercase tracking-[0.12em] text-admin-ink underline-offset-4 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-admin-line">
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">Product</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">SKU</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft">Status</th>
                  <th className="pb-3 text-[12px] font-medium uppercase text-admin-ink-soft text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 8).map((product) => (
                  <tr key={product.slug} className="border-b border-admin-line/50 last:border-0 hover:bg-admin-line/20">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 overflow-hidden rounded bg-admin-line/50">
                          <CoverImage
                            src={product.imageSrc}
                            alt={product.imageAlt}
                            sizes="40px"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] text-admin-ink">{product.name}</p>
                          <p className="truncate text-[12px] text-admin-ink-soft">{formatShopPrice(product.priceCents)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[14px] text-admin-ink-soft">
                      {product.slug.toUpperCase()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="admin-status-pill--delivered">Published</span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`${localeRoot}${adminProductEditHref(product.pdpSlug)}`}
                        className="admin-orders-open"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[14px] text-admin-ink-soft">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

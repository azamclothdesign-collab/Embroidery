"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export function ExportOrders() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  return (
    <form className="flex flex-wrap items-end gap-2" action="/admin/files/orders.csv" method="get">
      <label className="text-xs font-semibold text-muted">
        From
        <input type="date" name="from" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="field mt-1 min-h-10 w-auto py-1 text-sm" />
      </label>
      <label className="text-xs font-semibold text-muted">
        To
        <input type="date" name="to" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} className="field mt-1 min-h-10 w-auto py-1 text-sm" />
      </label>
      <button type="submit" className="btn btn-outline min-h-10">
        <Download className="size-4" aria-hidden /> Export CSV
      </button>
    </form>
  );
}

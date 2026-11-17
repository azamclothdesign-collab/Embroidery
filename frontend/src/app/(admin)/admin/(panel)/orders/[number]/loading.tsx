export default function OrderDetailLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading order">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-sand" />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="h-64 animate-pulse rounded-2xl bg-sand" />
        <div className="h-48 animate-pulse rounded-2xl bg-sand" />
      </div>
    </div>
  );
}

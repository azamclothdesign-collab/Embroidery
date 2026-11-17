export default function Loading() {
  return (
    <div className="container-page py-14" aria-busy="true" aria-live="polite">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-sand" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-[var(--radius-card)] bg-sand" />
        ))}
      </div>
    </div>
  );
}

export default function PublicLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-12 w-2/3 bg-line" />
      <div className="h-6 w-full bg-line" />
      <div className="h-6 w-5/6 bg-line" />
    </div>
  );
}

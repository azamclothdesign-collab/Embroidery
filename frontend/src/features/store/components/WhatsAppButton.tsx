/** Floating WhatsApp shortcut — only rendered when a number is set in Admin → Settings. */
export function WhatsAppButton({ number, label }: { number: string; label: string }) {
  const digits = number.replaceAll(/\D/g, "").replace(/^0/, "92");
  if (digits.length < 10) return null;
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed end-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-lift)] transition hover:scale-105 sm:end-6 sm:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true" fill="currentColor">
        <path d="M17.472 14.382c-.297-.139-1.633-.807-1.887-.899-.253-.093-.437-.139-.62.139-.184.278-.713.899-.873 1.083-.16.184-.32.208-.59.07-.297-.139-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.597.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.62-1.494-.85-2.048-.224-.535-.45-.463-.62-.472l-.528-.01c-.185 0-.484.07-.738.372-.253.297-.966.944-.966 2.3s.99 2.667 1.127 2.86c.139.195 1.945 2.97 4.715 4.163.659.285 1.173.455 1.574.582.661.21 1.263.18 1.74.11.53-.079 1.633-.667 1.865-1.312.23-.645.23-1.198.16-1.312-.07-.114-.255-.184-.553-.323z" />
        <path d="M12.05 2.003A9.94 9.94 0 0 0 2.11 11.94c0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.85 1.24h.01c5.48 0 9.94-4.46 9.94-9.94 0-2.65-1.03-5.15-2.91-7.03A9.9 9.9 0 0 0 12.05 2zm0 18.18h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.09.81.83-3.01-.2-.31a8.23 8.23 0 0 1-1.26-4.39 8.24 8.24 0 0 1 8.23-8.23c2.2 0 4.26.86 5.81 2.41a8.2 8.2 0 0 1 2.41 5.82 8.24 8.24 0 0 1-8.23 8.23z" />
      </svg>
    </a>
  );
}

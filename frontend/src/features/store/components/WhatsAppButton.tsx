import { MessageCircle } from "lucide-react";

/** Floating WhatsApp shortcut — only rendered when a number is set in admin. */
export function WhatsAppButton({ number, label }: { number: string; label: string }) {
  const digits = number.replaceAll(/\D/g, "").replace(/^0/, "92");
  if (digits.length < 10) return null;
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed end-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[var(--shadow-lift)] transition hover:scale-105 sm:end-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}

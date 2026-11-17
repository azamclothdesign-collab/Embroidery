import { Sparkle } from "lucide-react";
import { pick, type Locale, type Storefront } from "@/lib/types";

/**
 * Slim announcement strip (client asked: short, not a big banner).
 * CSS-only marquee; pauses on hover/focus; static under reduced motion.
 */
export function Marquee({ announcement, locale }: { announcement: Storefront["announcement"]; locale: Locale }) {
  const items = announcement.items.map((item) => pick(item, locale)).filter((text) => text.trim().length > 0);
  if (!announcement.enabled || items.length === 0) return null;
  const loop = [...items, ...items, ...items];

  return (
    <section aria-label={locale === "ur" ? "اعلانات" : "Announcements"} className="group overflow-hidden border-y border-ink bg-ink text-ivory">
      <p className="sr-only">{items.join(" · ")}</p>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] rtl:[animation-direction:reverse]" aria-hidden="true">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {loop.map((text, index) => (
              <li key={`${copy}-${index}`} className="flex h-10 items-center gap-6 px-6 text-sm font-semibold whitespace-nowrap">
                <Sparkle className="size-3.5 text-saffron" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

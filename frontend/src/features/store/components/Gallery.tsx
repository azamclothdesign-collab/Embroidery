"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/mediaLoader";

/**
 * Product gallery. Natural aspect ratio (no fixed short box) so tall
 * embroidery files stay fully visible and centered on mobile.
 */
export function Gallery({ images, alt, emptyLabel }: { images: string[]; alt: string; emptyLabel: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  if (current === null) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] bg-sand text-muted">
        <ImageOff className="size-8" aria-hidden />
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP; natural aspect avoids clip */}
        <img
          key={current}
          src={mediaUrl(current, 800)}
          alt={images.length > 1 ? `${alt} — ${active + 1}/${images.length}` : alt}
          decoding="async"
          fetchPriority={active === 0 ? "high" : "auto"}
          className="mx-auto block h-auto max-h-[min(85vh,920px)] w-full object-contain object-center"
          sizes="(min-width: 1024px) 50vw, 100vw"
          srcSet={`${mediaUrl(current, 400)} 400w, ${mediaUrl(current, 800)} 800w, ${mediaUrl(current, 1600)} 1600w`}
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${alt} ${index + 1}`}
                aria-pressed={index === active}
                className={cn(
                  "relative size-20 overflow-hidden rounded-xl border-2 bg-sand transition",
                  index === active ? "border-ink" : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(image, 400)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain object-center"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
